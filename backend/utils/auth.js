/**
 * Authentication primitives: the initial-password rule, hashing, and the
 * session token.
 *
 * Staff sign in with their HRIS number. They have no password until their
 * first sign-in, so the first one is derived from two things HR already
 * holds — see `initialPasswordFor`. Once used, it is hashed into
 * `auth_users` and the member is asked to choose their own.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ApiError } from "./validate.js";

const ROUNDS = 10;

export const TOKEN_COOKIE = "wsf_session";

/** Hours a signed-in session lasts. */
const TOKEN_HOURS = Number(process.env.SESSION_HOURS || 8);

/**
 * The JWT signing secret.
 *
 * In production this must be set; the server refuses to start otherwise, so
 * a deployment can never fall back to a predictable key. In development a
 * random one is generated per boot, which simply logs everyone out on
 * restart.
 */
export const JWT_SECRET = (() => {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured && configured.length >= 32) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET must be set to at least 32 characters in production. " +
        "Generate one with:  node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"",
    );
  }

  console.warn(
    "\n  WARNING: JWT_SECRET is not set (or is shorter than 32 characters).\n" +
      "  A random development secret is being used, so every restart signs\n" +
      "  everyone out. Set JWT_SECRET in backend/.env before deploying.\n",
  );
  return crypto.randomBytes(48).toString("hex");
})();

/**
 * The first password a member ever uses: their HRIS number followed by their
 * date of birth as DDMMYYYY.
 *
 *   HRIS 5471, born 1990-05-10  ->  547110051990
 *
 * This is a convenience for first sign-in only. Both halves are known to
 * colleagues and to HR, so it is treated as single-use: `must_change_password`
 * is set when it is redeemed and the member cannot get past the change screen
 * until they have chosen their own.
 */
export function initialPasswordFor({ hris, birthdate }) {
  if (!hris || !birthdate) return null;

  /* `birthdate` arrives as "YYYY-MM-DD" because the pool sets dateStrings. */
  const text = String(birthdate).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return null;

  const [, year, month, day] = match;
  return `${hris}${day}${month}${year}`;
}

export const hashPassword = (plain) => bcrypt.hash(plain, ROUNDS);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

/**
 * Rejects passwords that are too easy to guess from what colleagues know.
 * Deliberately modest: a long list of rules pushes people towards writing
 * them down.
 */
export function assertPasswordIsAcceptable(password, employee) {
  const errors = {};
  const value = String(password ?? "");

  if (value.length < 8) {
    errors.new_password = "Your new password must be at least 8 characters.";
  } else if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    errors.new_password = "Your new password must contain both letters and numbers.";
  } else if (employee && value === initialPasswordFor(employee)) {
    errors.new_password = "Please choose something other than the password you were issued.";
  } else if (employee?.hris && value === String(employee.hris)) {
    errors.new_password = "Your password cannot be your HRIS number.";
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, "Please correct the highlighted fields.", errors);
  }
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${TOKEN_HOURS}h` });
}

export function readToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Cookie options. The token is httpOnly so page scripts cannot read it, which
 * keeps a cross-site scripting bug from turning into a stolen session.
 */
export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_HOURS * 60 * 60 * 1000,
    path: "/",
  };
}
