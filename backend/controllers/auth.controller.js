/**
 * Sign-in, sign-out, the signed-in member's own account, and changing a
 * password.
 *
 * Staff sign in with their HRIS number. Their first password is derived from
 * their HRIS and date of birth (see utils/auth.js); redeeming it stores a
 * hash and marks the account as owing a change.
 */
import { query, queryOne } from "../dbconnection.js";
import { ApiError, asyncHandler, created, ok, validate } from "../utils/validate.js";
import {
  TOKEN_COOKIE,
  assertPasswordIsAcceptable,
  cookieOptions,
  hashPassword,
  initialPasswordFor,
  signToken,
  verifyPassword,
} from "../utils/auth.js";
import { findEmployeeByHris, toProfile } from "../utils/directory.js";
import { isAdmin } from "../utils/admin.js";
import { recordAudit } from "../utils/audit.js";

/* Brute-force limits. Lenient enough that a member fumbling their own
 * password is not locked out for the afternoon. */
const MAX_ATTEMPTS = 8;
const LOCK_MINUTES = 15;

const loginSchema = {
  hris: { label: "HRIS number", type: "int", required: true, min: 1 },
  password: { label: "Password", required: true, max: 200 },
};

const changeSchema = {
  current_password: { label: "Current password", required: true, max: 200 },
  new_password: { label: "New password", required: true, max: 200 },
};

/**
 * One message for every failure, so the form cannot be used to discover which
 * HRIS numbers exist or which have signed in before.
 */
const REJECT = () =>
  new ApiError(401, "That HRIS number and password do not match.", {
    password: "Check your HRIS number and password and try again.",
  });

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { hris, password } = validate(req.body, loginSchema);

  const employee = await findEmployeeByHris(hris);
  const account = await queryOne("SELECT * FROM `auth_users` WHERE `hris` = ?", [hris]);

  if (account?.locked_until && new Date(account.locked_until) > new Date()) {
    throw new ApiError(429, "Too many failed attempts. Please wait a few minutes and try again.");
  }

  /* An unknown HRIS is still run through a hash comparison so that a missing
   * account and a wrong password take about the same time to answer. */
  if (!employee) {
    await verifyPassword(password, "$2a$10$ckDVRGnTSQ1Ck0WiBkcq6u5Wk0a2mDhkHoDRG0gkjVKTlJ4wL5nPi");
    throw REJECT();
  }

  let mustChange = false;

  if (!account) {
    /* First sign-in: the only password that works is the issued one. */
    const issued = initialPasswordFor({ hris, birthdate: employee.birthdate });
    if (!issued || password !== issued) throw REJECT();

    await query(
      "INSERT INTO `auth_users` (`hris`, `password_hash`, `must_change_password`, `last_login_at`) VALUES (?, ?, 1, NOW())",
      [hris, await hashPassword(issued)],
    );
    mustChange = true;
  } else {
    const matches = await verifyPassword(password, account.password_hash);

    if (!matches) {
      const attempts = Number(account.failed_attempts) + 1;
      const lock = attempts >= MAX_ATTEMPTS;
      await query(
        "UPDATE `auth_users` SET `failed_attempts` = ?, `locked_until` = ? WHERE `hris` = ?",
        [lock ? 0 : attempts, lock ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null, hris],
      );
      throw REJECT();
    }

    mustChange = Boolean(account.must_change_password);
    await query(
      "UPDATE `auth_users` SET `failed_attempts` = 0, `locked_until` = NULL, `last_login_at` = NOW() WHERE `hris` = ?",
      [hris],
    );
  }

  await recordAudit(req, {
    action: "auth.signed_in",
    entity: ["auth", hris],
    actor: { hris, name: employee.calling_name || employee.full_name },
    summary: `${employee.calling_name || employee.full_name} signed in`,
    detail: { firstTime: mustChange },
  });

  res.cookie(TOKEN_COOKIE, signToken({ hris, mcp: mustChange }), cookieOptions());

  return ok(
    res,
    { profile: toProfile(employee), mustChangePassword: mustChange, isAdmin: isAdmin(hris) },
    mustChange
      ? "Signed in. Please choose a password of your own before continuing."
      : `Welcome back, ${employee.calling_name || employee.full_name}.`,
  );
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: undefined });
  return ok(res, null, "Signed out.");
});

/**
 * GET /api/auth/me - the signed-in member's staff record, plus their
 * membership and loan history.
 */
export const me = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByHris(req.user.hris);
  if (!employee) throw new ApiError(404, "Your staff record could not be found.");

  const account = await queryOne(
    "SELECT `must_change_password`, `last_login_at` FROM `auth_users` WHERE `hris` = ?",
    [req.user.hris],
  );

  return ok(res, {
    profile: toProfile(employee),
    mustChangePassword: Boolean(account?.must_change_password),
    lastLoginAt: account?.last_login_at ?? null,
    isAdmin: isAdmin(req.user.hris),
  });
});

/** GET /api/auth/me/history - this member's membership and loans. */
export const myHistory = asyncHandler(async (req, res) => {
  const { hris } = req.user;

  const membership = await queryOne(
    "SELECT * FROM `members` WHERE `hris` = ? ORDER BY `created_at` DESC LIMIT 1",
    [hris],
  );

  const dependants = membership
    ? await query(
        "SELECT `relationship`, `full_name`, `date_of_birth` FROM `member_dependants` WHERE `member_id` = ? ORDER BY `id`",
        [membership.id],
      )
    : [];

  const loans = await query(
    `SELECT l.\`id\`, l.\`reference_no\`, l.\`loan_purpose\`, l.\`loan_amount\`, l.\`status\`,
            l.\`released_on\`, l.\`amount_released\`, l.\`exco_remarks\`, l.\`created_at\`,
            g.\`full_name\` AS guarantor_name
       FROM \`loan_applications\` l
       LEFT JOIN \`loan_guarantors\` g ON g.\`loan_id\` = l.\`id\`
      WHERE l.\`hris\` = ?
      ORDER BY l.\`created_at\` DESC`,
    [hris],
  );

  return ok(res, {
    membership: membership
      ? {
          ...membership,
          parents: dependants.filter((d) => d.relationship !== "Child"),
          children: dependants.filter((d) => d.relationship === "Child"),
        }
      : null,
    loans,
  });
});

/** POST /api/auth/change-password */
export const changePassword = asyncHandler(async (req, res) => {
  const { hris } = req.user;
  const { current_password, new_password } = validate(req.body, changeSchema);

  const account = await queryOne("SELECT * FROM `auth_users` WHERE `hris` = ?", [hris]);
  if (!account) throw new ApiError(404, "No account found.");

  if (!(await verifyPassword(current_password, account.password_hash))) {
    throw new ApiError(422, "Please correct the highlighted fields.", {
      current_password: "That is not your current password.",
    });
  }

  const employee = await findEmployeeByHris(hris);
  assertPasswordIsAcceptable(new_password, { hris, birthdate: employee?.birthdate });

  if (await verifyPassword(new_password, account.password_hash)) {
    throw new ApiError(422, "Please correct the highlighted fields.", {
      new_password: "Please choose a password you have not used before.",
    });
  }

  await query(
    "UPDATE `auth_users` SET `password_hash` = ?, `must_change_password` = 0 WHERE `hris` = ?",
    [await hashPassword(new_password), hris],
  );

  await recordAudit(req, {
    action: "auth.password_changed",
    entity: ["auth", hris],
    summary: `HRIS ${hris} chose a new password`,
  });

  /* Re-issue the cookie so the "must change" claim is cleared. */
  res.cookie(TOKEN_COOKIE, signToken({ hris, mcp: false }), cookieOptions());

  return created(res, null, "Your password has been changed.");
});
