/**
 * Serving documents.
 *
 * Two kinds, both for signed-in members only:
 *
 *   - the Constitution, which every applicant must read before agreeing to
 *     abide by it. It is marked confidential and internal, so it is served
 *     from here rather than sitting in the public folder where anyone could
 *     fetch it;
 *   - the certificates a member attached to their own application. A member
 *     may read their own and nobody else's.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { queryOne } from "../dbconnection.js";
import { ApiError, asyncHandler, readId } from "../utils/validate.js";
import { getObject } from "../utils/storage.js";
import { recordAudit } from "../utils/audit.js";

const here = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where the Constitution is kept. `backend/documents` is the home for it;
 * the project's own `assets` folder is checked too, so the file works
 * wherever it was dropped.
 */
const CONSTITUTION_CANDIDATES = [
  process.env.CONSTITUTION_PDF,
  path.join(here, "..", "documents", "constitution.pdf"),
  path.join(here, "..", "..", "assets", "constitution.pdf"),
  path.join(here, "..", "..", "src", "assets", "constitution.pdf"),
].filter(Boolean);

export function findConstitution() {
  return CONSTITUTION_CANDIDATES.find((candidate) => fs.existsSync(candidate)) ?? null;
}

/**
 * GET /api/documents/constitution/status - whether the file is in place.
 * The form asks first, so it can explain a missing document rather than
 * offering a link that downloads nothing.
 */
export const constitutionStatus = asyncHandler(async (_req, res) => {
  const file = findConstitution();
  return res.json({
    success: true,
    data: {
      available: Boolean(file),
      updated_at: file ? fs.statSync(file).mtime.toISOString().slice(0, 10) : null,
    },
  });
});

/** GET /api/documents/constitution - the PDF itself, inline. */
export const constitution = asyncHandler(async (req, res) => {
  const file = findConstitution();
  if (!file) {
    throw new ApiError(
      404,
      "The Constitution has not been uploaded yet. Please ask the Society's office.",
    );
  }

  await recordAudit(req, {
    action: "constitution.viewed",
    entity: ["document", null],
    summary: "The Constitution was opened",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    'inline; filename="Welfare-Society-of-Fentons-Constitution.pdf"',
  );
  /* Never cached by a shared proxy: this is an internal document. */
  res.setHeader("Cache-Control", "private, max-age=300");
  return fs.createReadStream(file).pipe(res);
});

/**
 * GET /api/members/:id/documents/:docId - one certificate.
 *
 * A member may read only the documents attached to their own application.
 * The check is on the session's HRIS, not on anything in the URL.
 */
export const memberDocument = asyncHandler(async (req, res) => {
  const memberId = readId(req.params.id, "member id");
  const docId = readId(req.params.docId, "document id");

  const row = await queryOne(
    `SELECT d.\`stored_name\`, d.\`storage_key\`, d.\`mime_type\`, d.\`original_name\`, m.\`hris\`
       FROM \`member_documents\` d
       JOIN \`members\` m ON m.\`id\` = d.\`member_id\`
      WHERE d.\`id\` = ? AND d.\`member_id\` = ?`,
    [docId, memberId],
  );

  /* The same answer whether the document does not exist or belongs to
   * somebody else, so the route cannot be used to probe for other people's
   * records. */
  if (!row || row.hris !== req.user.hris) {
    throw new ApiError(404, "That document could not be found.");
  }

  /* That it was read, not what it contained. */
  await recordAudit(req, {
    action: "document.viewed",
    entity: ["document", docId],
    summary: `A supporting document for member ${memberId} was opened`,
    detail: { member_id: memberId },
  });

  let object;
  try {
    object = await getObject(row.storage_key);
  } catch {
    throw new ApiError(404, "That document could not be found.");
  }

  res.setHeader("Content-Type", row.mime_type);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${row.original_name.replace(/[^\w.\- ]+/g, "_")}"`,
  );
  res.setHeader("Cache-Control", "private, no-store");

  /* S3 hands back a stream; the local store hands back a buffer. */
  return object.stream ? object.stream.pipe(res) : res.send(object.buffer);
});
