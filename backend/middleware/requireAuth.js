/**
 * Session guard.
 *
 * `requireAuth` rejects anything without a valid session cookie. `attachUser`
 * reads the cookie when one is present but lets the request through either
 * way, for routes that show more to a signed-in member than to a visitor.
 */
import { ApiError } from "../utils/validate.js";
import { TOKEN_COOKIE, readToken } from "../utils/auth.js";

function sessionFrom(req) {
  const token = req.cookies?.[TOKEN_COOKIE];
  if (!token) return null;

  const claims = readToken(token);
  if (!claims?.hris) return null;

  return { hris: Number(claims.hris), mustChangePassword: Boolean(claims.mcp) };
}

export function attachUser(req, _res, next) {
  req.user = sessionFrom(req);
  next();
}

export function requireAuth(req, _res, next) {
  req.user = sessionFrom(req);
  if (!req.user) {
    return next(new ApiError(401, "Please sign in to continue."));
  }

  /* A member still on the issued password may read their own account and
   * change it, but nothing else — otherwise the forced change is no barrier
   * at all to whoever guessed the password. */
  if (req.user.mustChangePassword && !req.allowDuringPasswordChange) {
    return next(
      new ApiError(403, "Please choose a new password before continuing.", {
        must_change_password: true,
      }),
    );
  }

  return next();
}

/** Marks a route as reachable while the member still owes a password change. */
export function allowDuringPasswordChange(req, _res, next) {
  req.allowDuringPasswordChange = true;
  next();
}
