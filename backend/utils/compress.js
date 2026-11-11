/**
 * Shrinking a scanned certificate to a sensible size before it is stored.
 *
 * The target is 100-200 KB. That is comfortably enough for a legible scan of
 * an A4 document and small enough that a few thousand of them do not become a
 * storage problem.
 *
 * The approach is to step the quality down, then the dimensions, and stop as
 * soon as the result lands in the band. It never goes below a floor: a
 * birth certificate that cannot be read is worse than one that is 300 KB, so
 * if the floor is reached the best attempt is kept and the caller is told it
 * did not get there.
 *
 * PDFs are passed through untouched - see `compressDocument`.
 */
import sharp from "sharp";

const KB = 1024;

export const TARGET = {
  min: Number(process.env.COMPRESS_MIN_KB || 100) * KB,
  max: Number(process.env.COMPRESS_MAX_KB || 200) * KB,
};

/** Quality and width steps, tried in order, largest first. */
const QUALITY_STEPS = [82, 72, 64, 56, 48, 42, 38];
const WIDTH_STEPS = [2200, 1800, 1500, 1240, 1000];

/** Below this a scan starts to lose detail that matters on a certificate. */
const MIN_WIDTH = 1000;
const MIN_QUALITY = 38;

/**
 * Compresses one image into the target band.
 *
 * Returns `{ buffer, mimetype, ext, width, height, bytes, attempts, withinTarget }`.
 */
export async function compressImage(input) {
  const meta = await sharp(input).metadata();
  const startWidth = meta.width ?? WIDTH_STEPS[0];

  let best = null;
  let attempts = 0;

  for (const width of WIDTH_STEPS.filter((w) => w <= startWidth).concat(
    startWidth < MIN_WIDTH ? [startWidth] : [],
  )) {
    for (const quality of QUALITY_STEPS) {
      attempts += 1;

      const buffer = await sharp(input)
        .rotate() // honour EXIF orientation before it is stripped
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true, progressive: true })
        .toBuffer();

      /* Keep the smallest result seen, in case nothing lands in the band. */
      if (!best || buffer.length < best.bytes) {
        best = { buffer, bytes: buffer.length, width, quality };
      }

      if (buffer.length <= TARGET.max) {
        /* Under the ceiling. Being under the floor too is fine - it means the
         * scan was simple enough to compress well, not that it is unreadable. */
        const out = await sharp(buffer).metadata();
        return {
          buffer,
          mimetype: "image/jpeg",
          ext: ".jpg",
          width: out.width,
          height: out.height,
          bytes: buffer.length,
          attempts,
          withinTarget: true,
        };
      }

      if (quality <= MIN_QUALITY && width <= MIN_WIDTH) break;
    }
  }

  /* Could not get under the ceiling without going below the legibility
   * floor. The best attempt is kept rather than refusing the upload. */
  const out = await sharp(best.buffer).metadata();
  return {
    buffer: best.buffer,
    mimetype: "image/jpeg",
    ext: ".jpg",
    width: out.width,
    height: out.height,
    bytes: best.bytes,
    attempts,
    withinTarget: false,
  };
}

/**
 * Prepares any accepted upload for storage.
 *
 * Images are compressed. PDFs are not: recompressing one properly needs
 * Ghostscript, and the alternatives (rasterising the pages) would turn a
 * searchable certificate into a picture of one and risk making small print
 * unreadable. They are already capped at 5 MB on the way in.
 */
export async function compressDocument(file) {
  const original = file.buffer.length;

  if (file.mimetype === "application/pdf") {
    return {
      buffer: file.buffer,
      mimetype: file.mimetype,
      ext: ".pdf",
      bytes: original,
      originalBytes: original,
      compressed: false,
      withinTarget: original <= TARGET.max,
      note: "PDFs are stored as supplied.",
    };
  }

  const result = await compressImage(file.buffer);
  return {
    ...result,
    originalBytes: original,
    compressed: true,
    note: result.withinTarget
      ? null
      : "Could not reach the size target without losing legibility; the best attempt was kept.",
  };
}

export const describeTarget = () => `${TARGET.min / KB}-${TARGET.max / KB} KB`;
