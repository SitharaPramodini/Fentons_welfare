/**
 * Where uploaded documents are kept.
 *
 * Two backends behind one interface:
 *
 *   s3     when the bucket and credentials are configured
 *   local  otherwise - `backend/uploads`, as before
 *
 * The local one is not a toy fallback: it keeps the application working while
 * the S3 details are being sorted out, and it uses the same keys, so moving
 * to S3 later is a copy of the directory tree rather than a migration.
 *
 * KEY LAYOUT
 * ----------
 *   welfare/<area>/<document-type>/<yyyy>/<mm>/<dd>/<reference>-<random>.<ext>
 *
 * for example
 *
 *   welfare/membership/birth-certificate/2026/11/10/WSF-M-2026-0010-6f3a....jpg
 *
 * Dated folders keep any one prefix small, which matters once there are a few
 * thousand files, and make "everything from March" a prefix listing rather
 * than a scan. The reference number in the filename means a file found on its
 * own can still be traced back to an application.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const here = path.dirname(fileURLToPath(import.meta.url));

/* --- Configuration -------------------------------------------------------- */

export const S3_BUCKET = process.env.S3_BUCKET || "";
export const S3_REGION = process.env.S3_REGION || "ap-south-1";

/** Everything the Society writes lives under this prefix. */
export const ROOT_PREFIX = (process.env.S3_PREFIX || "welfare").replace(/^\/+|\/+$/g, "");

const accessKeyId = process.env.S3_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";

export const usingS3 = Boolean(S3_BUCKET && accessKeyId && secretAccessKey);

const client = usingS3
  ? new S3Client({
      region: S3_REGION,
      credentials: { accessKeyId, secretAccessKey },
      ...(process.env.S3_ENDPOINT
        ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
        : {}),
    })
  : null;

/** Local root, used when S3 is not configured. */
export const LOCAL_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(here, "..", "uploads"));

export function storageProvider() {
  return usingS3 ? "s3" : "local";
}

export function describeStorage() {
  return usingS3
    ? `s3://${S3_BUCKET}/${ROOT_PREFIX}/ (${S3_REGION})`
    : `${path.relative(process.cwd(), LOCAL_ROOT)}/ on disk`;
}

/* --- Keys ----------------------------------------------------------------- */

/** `birth_certificate` -> `birth-certificate`, and nothing unexpected. */
function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Builds the key for one document.
 *
 *   buildKey({ area: "membership", docType: "birth_certificate",
 *              reference: "WSF-M-2026-0010", ext: ".jpg" })
 *   -> welfare/membership/birth-certificate/2026/11/10/WSF-M-2026-0010-a1b2c3d4.jpg
 */
export function buildKey({ area, docType, reference, ext, when = new Date() }) {
  const yyyy = String(when.getFullYear());
  const mm = String(when.getMonth() + 1).padStart(2, "0");
  const dd = String(when.getDate()).padStart(2, "0");

  /* Random tail: two uploads of the same document on the same day must not
   * collide, and the name must not be guessable from the reference alone. */
  const tail = crypto.randomBytes(8).toString("hex");
  const name = `${slug(reference || "document")}-${tail}${ext}`;

  return [ROOT_PREFIX, slug(area), slug(docType), yyyy, mm, dd, name].join("/");
}

/* --- Reading and writing -------------------------------------------------- */

/** Refuses a key that would escape the root prefix. */
function assertSafeKey(key) {
  const clean = String(key).replace(/\\/g, "/");
  if (clean.includes("..") || clean.startsWith("/") || !clean.startsWith(`${ROOT_PREFIX}/`)) {
    throw new Error(`Refusing to touch an unexpected storage key: ${key}`);
  }
  return clean;
}

export async function putObject(key, body, contentType) {
  const safe = assertSafeKey(key);

  if (usingS3) {
    await client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: safe,
        Body: body,
        ContentType: contentType,
        /* These are personal records: never world-readable, encrypted at rest. */
        ServerSideEncryption: "AES256",
        Metadata: { source: "welfare-society-of-fentons" },
      }),
    );
    return { provider: "s3", key: safe };
  }

  const file = path.join(LOCAL_ROOT, safe);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body, { mode: 0o600 });
  return { provider: "local", key: safe };
}

/** Returns a readable stream (S3) or a Buffer (local). */
export async function getObject(key) {
  const safe = assertSafeKey(key);

  if (usingS3) {
    const out = await client.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: safe }));
    return { stream: out.Body, contentType: out.ContentType, bytes: out.ContentLength };
  }

  const file = path.join(LOCAL_ROOT, safe);
  const buffer = await fs.readFile(file);
  return { buffer, bytes: buffer.length };
}

export async function deleteObject(key) {
  const safe = assertSafeKey(key);

  if (usingS3) {
    await client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: safe })).catch(() => {});
    return;
  }

  await fs.rm(path.join(LOCAL_ROOT, safe), { force: true }).catch(() => {});
}

/** Checks the bucket answers. Called once at startup when S3 is configured. */
export async function testStorage() {
  if (!usingS3) return { ok: true, provider: "local" };
  try {
    await client.send(new HeadBucketCommand({ Bucket: S3_BUCKET }));
    return { ok: true, provider: "s3" };
  } catch (err) {
    return {
      ok: false,
      provider: "s3",
      reason: err.name === "NotFound" ? "no such bucket" : err.message,
    };
  }
}
