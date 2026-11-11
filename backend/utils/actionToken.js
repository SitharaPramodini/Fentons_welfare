/**
 * One-click links for the decision e-mails.
 *
 * The approval message carries two links so a decision can be taken from the
 * inbox without signing in. The link is a signed token naming one loan and
 * one action, and it is:
 *
 *   - signed with the session secret, so it cannot be forged or edited;
 *   - limited to one loan and one action, so a leaked link cannot be turned
 *     into a different decision or aimed at another application;
 *   - short-lived (fourteen days by default);
 *   - effectively single-use, because the route refuses to act on a loan that
 *     has already been decided.
 *
 * A link still lands on a confirmation page rather than acting on the GET
 * itself - mail scanners and link previewers follow URLs, and an application
 * must not be decided by a spam filter.
 */
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./auth.js";

const TTL_DAYS = Number(process.env.ACTION_LINK_DAYS || 14);

export const ACTIONS = ["approve", "decline"];

export function signAction({ loanId, action }) {
  if (!ACTIONS.includes(action)) throw new Error(`Unknown action: ${action}`);
  return jwt.sign({ purpose: "loan-decision", loanId: Number(loanId), action }, JWT_SECRET, {
    expiresIn: `${TTL_DAYS}d`,
  });
}

/** Returns `{ loanId, action }`, or null when the token is not usable. */
export function readAction(token) {
  try {
    const claims = jwt.verify(String(token), JWT_SECRET);
    if (claims.purpose !== "loan-decision") return null;
    if (!ACTIONS.includes(claims.action)) return null;
    if (!Number.isInteger(claims.loanId)) return null;
    return { loanId: claims.loanId, action: claims.action };
  } catch {
    return null;
  }
}
