/**
 * Supporting documents for a membership application: birth certificates and
 * a marriage certificate.
 *
 * These are sensitive personal records, so:
 *
 *   - they are written outside the web root and are never served statically;
 *     every read goes through an authenticated route that checks the file
 *     belongs to the member asking for it;
 *   - the uploader's filename is never used on disk. It is kept in the
 *     database for display only, and the file itself gets a random name, so
 *     a crafted name cannot escape the upload directory or overwrite
 *     anything;
 *   - the first bytes of each file are checked against its claimed type. A
 *     browser's Content-Type header is whatever the client chose to send.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { ApiError } from "./validate.js";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Where uploaded documents live. Outside `public`, and git-ignored. */
export const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(here, "..", "uploads"));

export const MAX_FILE_BYTES = Number(process.env.MAX_UPLOAD_MB || 5) * 1024 * 1024;

/** The three documents the membership form collects. */
export const DOCUMENT_TYPES = {
  birth_certificate: "Your birth certificate",
  spouse_birth_certificate: "Your spouse's birth certificate",
  marriage_certificate: "Your marriage certificate",
};

/** Accepted types, with the bytes each one must start with. */
const ACCEPTED = {
  "application/pdf": { ext: ".pdf", magic: [[0x25, 0x50, 0x44, 0x46]] }, // %PDF
  "image/jpeg": { ext: ".jpg", magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: ".png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
};

export const ACCEPTED_LABEL = "PDF, JPG or PNG, up to " + MAX_FILE_BYTES / 1024 / 1024 + " MB";

/**
 * Multer reads into memory rather than straight to disk: nothing is written
 * until the application itself has passed validation, so a rejected form
 * leaves no files behind.
 */
export const uploadDocuments = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: Object.keys(DOCUMENT_TYPES).length, fields: 40 },
  fileFilter(_req, file, done) {
    if (!ACCEPTED[file.mimetype]) {
      return done(
        new ApiError(422, "Please correct the highlighted fields.", {
          [file.fieldname]: `${DOCUMENT_TYPES[file.fieldname] ?? "That file"} must be a PDF, JPG or PNG.`,
        }),
      );
    }
    return done(null, true);
  },
}).fields(Object.keys(DOCUMENT_TYPES).map((name) => ({ name, maxCount: 1 })));

/** True when the file's first bytes match one of the signatures for its type. */
function signatureMatches(buffer, mimetype) {
  const spec = ACCEPTED[mimetype];
  if (!spec) return false;
  return spec.magic.some((bytes) => bytes.every((byte, i) => buffer[i] === byte));
}

/**
 * Checks every uploaded file, throwing a field-level 422 for anything that
 * is not what it claims to be.
 */
export function assertFilesAreValid(files) {
  const errors = {};

  for (const [field, list] of Object.entries(files ?? {})) {
    const file = list?.[0];
    if (!file) continue;

    const label = DOCUMENT_TYPES[field] ?? "That file";

    if (file.size === 0) {
      errors[field] = `${label} appears to be empty.`;
    } else if (!signatureMatches(file.buffer, file.mimetype)) {
      errors[field] =
        `${label} does not look like a valid ${ACCEPTED[file.mimetype].ext.slice(1).toUpperCase()} file.`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, "Please correct the highlighted fields.", errors);
  }
}

/**
 * Writes one member's documents to disk and returns the rows to record.
 * Called inside the application's transaction; `removeDocuments` undoes it if
 * the transaction then fails.
 */
export async function storeDocuments(memberId, files) {
  const dir = path.join(UPLOAD_ROOT, "members", String(memberId));
  await fs.mkdir(dir, { recursive: true });

  const written = [];

  for (const [field, list] of Object.entries(files ?? {})) {
    const file = list?.[0];
    if (!file) continue;

    /* A random name: the uploader's own is kept only for display. */
    const storedName = crypto.randomUUID() + ACCEPTED[file.mimetype].ext;
    await fs.writeFile(path.join(dir, storedName), file.buffer, { mode: 0o600 });

    written.push({
      member_id: memberId,
      doc_type: field,
      original_name: String(file.originalname).slice(0, 255),
      stored_name: storedName,
      mime_type: file.mimetype,
      size_bytes: file.size,
    });
  }

  return written;
}

/** Deletes a member's upload directory. Used to clean up a failed submission. */
export async function removeDocuments(memberId) {
  await fs
    .rm(path.join(UPLOAD_ROOT, "members", String(memberId)), { recursive: true, force: true })
    .catch(() => {});
}

/**
 * Resolves a stored document to an absolute path, refusing anything that
 * would point outside the member's own directory.
 */
export function pathForDocument(memberId, storedName) {
  const dir = path.join(UPLOAD_ROOT, "members", String(Number(memberId)));
  const full = path.resolve(dir, path.basename(String(storedName)));

  if (!full.startsWith(path.resolve(dir) + path.sep)) {
    throw new ApiError(400, "That document could not be read.");
  }
  return full;
}
