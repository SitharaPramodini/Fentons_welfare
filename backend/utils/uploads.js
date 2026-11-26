/**
 * Supporting documents for a membership application - the checklist at the
 * foot of form WSF/01/2026: identity cards, birth certificates, a marriage
 * certificate and one birth certificate per child.
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
import multer from "multer";
import { ApiError } from "./validate.js";
import { MAX_CHILDREN } from "./constants.js";
import { compressDocument, describeTarget } from "./compress.js";
import { buildKey, deleteObject, putObject, storageProvider } from "./storage.js";

/**
 * What may arrive. Generous, because images are compressed to 100-200 KB on
 * the way in and a photograph taken on a modern phone is routinely 8-12 MB -
 * refusing those would mean telling members to go and shrink a picture
 * themselves, which is exactly the work this is meant to save them.
 */
export const MAX_FILE_BYTES = Number(process.env.MAX_UPLOAD_MB || 15) * 1024 * 1024;

/**
 * PDFs are stored as supplied, so they get a tighter limit than images: a
 * 15 MB PDF would stay 15 MB forever.
 */
export const MAX_PDF_BYTES = Number(process.env.MAX_PDF_MB || 5) * 1024 * 1024;

/**
 * The documents the membership form collects, in the order its checklist
 * prints them.
 *
 * A child's birth certificate arrives on a numbered field -
 * `child_birth_certificate_1` and so on, one per row of the children block -
 * so each certificate stays attached to the child it belongs to. They are
 * all stored under the single `child_birth_certificate` type, with the row
 * number in `doc_index`.
 */
export const CHILD_BIRTH_CERTIFICATE = "child_birth_certificate";

export const DOCUMENT_TYPES = {
  id_card: "Your identity card",
  birth_certificate: "Your birth certificate",
  spouse_id_card: "Your spouse's identity card",
  spouse_birth_certificate: "Your spouse's birth certificate",
  marriage_certificate: "Your marriage certificate",
  ...Object.fromEntries(
    Array.from({ length: MAX_CHILDREN }, (_, i) => [
      childCertificateField(i + 1),
      `Child ${i + 1}'s birth certificate`,
    ]),
  ),
};

/** The upload field a given child's certificate arrives on. */
export function childCertificateField(position) {
  return `${CHILD_BIRTH_CERTIFICATE}_${position}`;
}

/**
 * Splits an upload field into the type stored against it and its position.
 * Everything but a child's certificate sits at index 0.
 */
export function describeField(field) {
  const match = /^child_birth_certificate_(\d+)$/.exec(field);
  return match
    ? { docType: CHILD_BIRTH_CERTIFICATE, index: Number(match[1]) }
    : { docType: field, index: 0 };
}

/** Accepted types, with the bytes each one must start with. */
const ACCEPTED = {
  "application/pdf": { ext: ".pdf", magic: [[0x25, 0x50, 0x44, 0x46]] }, // %PDF
  "image/jpeg": { ext: ".jpg", magic: [[0xff, 0xd8, 0xff]] },
  "image/png": { ext: ".png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
};

export const ACCEPTED_LABEL = `JPG or PNG up to ${MAX_FILE_BYTES / 1024 / 1024} MB, or PDF up to ${MAX_PDF_BYTES / 1024 / 1024} MB`;

/* Images are compressed on arrival, so the limit here is what a phone camera
 * produces rather than what is stored. */
export const MAX_UPLOAD_LABEL = `${MAX_FILE_BYTES / 1024 / 1024} MB`;

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
    } else if (file.mimetype === "application/pdf" && file.size > MAX_PDF_BYTES) {
      errors[field] =
        `${label} is ${(file.size / 1024 / 1024).toFixed(1)} MB. PDFs are kept as supplied, so please use one under ${MAX_PDF_BYTES / 1024 / 1024} MB, or attach a photograph instead.`;
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
 * Compresses each document and writes it to storage.
 *
 * Called after the member row exists, so the reference number can go into
 * the key. Returns the rows to record; `removeDocuments` undoes it if the
 * surrounding transaction then fails.
 */
export async function storeDocuments({ memberId, reference, files, area = "membership" }) {
  const written = [];

  for (const [field, list] of Object.entries(files ?? {})) {
    const file = list?.[0];
    if (!file) continue;

    const { docType, index } = describeField(field);
    const prepared = await compressDocument(file);
    const key = buildKey({
      area,
      docType,
      reference: index ? `${reference}-${index}` : reference,
      ext: prepared.ext,
    });

    await putObject(key, prepared.buffer, prepared.mimetype);

    if (prepared.note) {
      console.log(`  upload: ${field} for ${reference} - ${prepared.note}`);
    }

    written.push({
      member_id: memberId,
      doc_type: docType,
      doc_index: index,
      original_name: String(file.originalname).slice(0, 255),
      stored_name: key.split("/").pop(),
      storage_key: key,
      storage_provider: storageProvider(),
      mime_type: prepared.mimetype,
      size_bytes: prepared.bytes,
      original_bytes: prepared.originalBytes,
    });
  }

  return written;
}

/** Removes a set of stored documents. Used to clean up a failed submission. */
export async function removeDocuments(keys = []) {
  for (const key of keys) {
    if (key) await deleteObject(key).catch(() => {});
  }
}

export { describeTarget };
