/**
 * Restricts a route to the Society's administrators.
 *
 * Runs after `requireAuth`, so a visitor who is not signed in is asked to
 * sign in rather than told that an administration area exists.
 */
import { ApiError } from "../utils/validate.js";
import { isAdmin } from "../utils/admin.js";

export function requireAdmin(req, _res, next) {
  if (!req.user) return next(new ApiError(401, "Please sign in to continue."));
  if (!isAdmin(req.user.hris)) {
    return next(new ApiError(403, "This part of the site is for the Society's office."));
  }
  return next();
}
