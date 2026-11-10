/**
 * Request validation, error plumbing and the few small helpers the two
 * controllers share.
 *
 * `validate(body, schema)` is the only entry point most callers need. It
 * returns a clean object containing exactly the keys in the schema, coerced
 * to the right JS type, or throws a 422 carrying a `{ field: message }` map
 * that the frontend renders under each input.
 */

export class ApiError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/** Wraps an async route handler so a rejected promise reaches the error middleware. */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[0-9+\-\s()]{9,20}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Trims a value to a string, treating null/undefined/NaN as "". */
function asString(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function isBlank(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

/**
 * Coerces and checks one field. Returns `{ value }` or `{ error }`.
 *
 * rule: { label, type, required, max, min, values, default, allowFuture }
 *   type: text | email | phone | date | int | decimal | bool | enum
 */
function checkField(raw, rule, key) {
  const label = rule.label || key;
  const type = rule.type || "text";

  if (isBlank(raw)) {
    if (rule.required) return { error: `${label} is required.` };
    return { value: rule.default !== undefined ? rule.default : null };
  }

  switch (type) {
    case "bool": {
      const truthy = raw === true || raw === 1 || raw === "1" || raw === "true" || raw === "yes";
      if (rule.mustBeTrue && !truthy) {
        return { error: rule.message || `${label} must be accepted.` };
      }
      return { value: truthy ? 1 : 0 };
    }

    case "int":
    case "decimal": {
      const num = Number(raw);
      if (!Number.isFinite(num)) return { error: `${label} must be a number.` };
      if (type === "int" && !Number.isInteger(num)) {
        return { error: `${label} must be a whole number.` };
      }
      if (rule.min !== undefined && num < rule.min) {
        return { error: `${label} must be at least ${rule.min}.` };
      }
      if (rule.max !== undefined && num > rule.max) {
        return { error: `${label} must not exceed ${rule.max}.` };
      }
      return { value: num };
    }

    case "date": {
      const text = asString(raw).slice(0, 10);
      if (!DATE.test(text)) return { error: `${label} must be a date (YYYY-MM-DD).` };
      const parsed = new Date(`${text}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) return { error: `${label} is not a valid date.` };
      if (!rule.allowFuture && parsed.getTime() > Date.now() + 86_400_000) {
        return { error: `${label} cannot be in the future.` };
      }
      return { value: text };
    }

    case "enum": {
      const text = asString(raw);
      if (!rule.values?.includes(text)) {
        return { error: `${label} must be one of: ${rule.values?.join(", ")}.` };
      }
      return { value: text };
    }

    case "email": {
      const text = asString(raw);
      if (!EMAIL.test(text)) return { error: `${label} must be a valid e-mail address.` };
      if (text.length > (rule.max || 150)) return { error: `${label} is too long.` };
      return { value: text };
    }

    case "phone": {
      const text = asString(raw);
      if (!PHONE.test(text)) return { error: `${label} must be a valid telephone number.` };
      return { value: text };
    }

    default: {
      const text = asString(raw);
      if (rule.minLength && text.length < rule.minLength) {
        return { error: `${label} must be at least ${rule.minLength} characters.` };
      }
      if (rule.max && text.length > rule.max) {
        return { error: `${label} must not exceed ${rule.max} characters.` };
      }
      return { value: text };
    }
  }
}

/**
 * Validates `body` against `schema`, throwing a 422 ApiError listing every
 * bad field at once rather than stopping at the first.
 */
export function validate(body, schema) {
  const source = body && typeof body === "object" ? body : {};
  const errors = {};
  const out = {};

  for (const [key, rule] of Object.entries(schema)) {
    const { value, error } = checkField(source[key], rule, key);
    if (error) errors[key] = error;
    else out[key] = value;
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, "Please correct the highlighted fields.", errors);
  }
  return out;
}

/**
 * Same as `validate`, but only for the keys actually present in the body -
 * used by PATCH-style updates where omitting a field means "leave it alone".
 * Returns `{}` if nothing recognised was sent.
 */
export function validatePartial(body, schema) {
  const source = body && typeof body === "object" ? body : {};
  const present = Object.fromEntries(
    Object.entries(schema).filter(([key]) => source[key] !== undefined),
  );
  if (Object.keys(present).length === 0) return {};

  /* A field that is present must still satisfy its own rules. */
  return validate(source, present);
}

/** Reads `?page=` / `?limit=` into safe bounds. */
export function readPaging(query, { defaultLimit = 25, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requested = Number.parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requested), maxLimit);
  return { page, limit, offset: (page - 1) * limit };
}

/** Positive integer route params (`/:id`), rejected early with a 400. */
export function readId(value, label = "id") {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, `A valid numeric ${label} is required.`);
  }
  return id;
}

/**
 * Builds `WSF-M-2026-0007` style references. Called after the insert so the
 * auto-increment id supplies the sequence - no counter table, no race.
 */
export function buildReference(prefix, id, when = new Date()) {
  return `WSF-${prefix}-${when.getFullYear()}-${String(id).padStart(4, "0")}`;
}

/** Turns an object into `SET a = ?, b = ?` plus the matching value array. */
export function buildUpdateSet(fields) {
  const keys = Object.keys(fields);
  return {
    clause: keys.map((k) => `\`${k}\` = ?`).join(", "),
    values: keys.map((k) => fields[k]),
  };
}

export const ok = (res, data, message) => res.json({ success: true, message, data });
export const created = (res, data, message) =>
  res.status(201).json({ success: true, message, data });
