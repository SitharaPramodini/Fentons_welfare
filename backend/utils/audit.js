/**
 * Writing the audit trail and the consent record.
 *
 * Both are append-only in practice. Neither is ever allowed to fail the thing
 * it is recording: if the trail cannot be written, the failure is logged and
 * the member's application still goes through. Losing an audit row is bad;
 * refusing somebody's loan because of it would be worse.
 */
import { bulkQuery, query } from "../dbconnection.js";
import { CONSENTS } from "./consent.js";

/** The request details worth keeping against an event. */
export function requestContext(req) {
  const forwarded = String(req?.headers?.["x-forwarded-for"] ?? "")
    .split(",")[0]
    .trim();
  return {
    ip: (forwarded || req?.ip || req?.socket?.remoteAddress || "").slice(0, 45) || null,
    userAgent: String(req?.headers?.["user-agent"] ?? "").slice(0, 255) || null,
  };
}

/**
 * Records one event.
 *
 *   await recordAudit(req, {
 *     action: "loan.approved",
 *     entity: ["loan", loan.id],
 *     summary: `${loan.reference_no} approved`,
 *     detail: { amount: loan.loan_amount },
 *   });
 */
export async function recordAudit(req, { action, entity, summary, detail, actor }) {
  const [entityType = null, entityId = null] = entity ?? [];
  const { ip, userAgent } = requestContext(req);

  try {
    await query(
      "INSERT INTO `audit_log` (`action`, `actor_hris`, `actor_name`, `entity_type`, `entity_id`, `summary`, `detail`, `ip_address`, `user_agent`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        String(action).slice(0, 64),
        actor?.hris ?? req?.user?.hris ?? null,
        actor?.name ? String(actor.name).slice(0, 150) : null,
        entityType,
        entityId,
        String(summary).slice(0, 255),
        detail ? JSON.stringify(detail) : null,
        ip,
        userAgent,
      ],
    );
  } catch (err) {
    console.error(`  audit: could not record "${action}" - ${err.message}`);
  }
}

/**
 * Records the consents given with one application.
 *
 * `given` is a set of consent keys the member agreed to. The wording written
 * to the table is the server's own, never anything the client sent, so the
 * record always reflects what was actually displayed.
 */
export async function recordConsents(req, { hris, memberId = null, loanId = null, given = [] }) {
  const { ip, userAgent } = requestContext(req);
  const rows = [];

  for (const key of given) {
    const consent = CONSENTS[key];
    if (!consent) continue;
    rows.push([
      hris ?? null,
      memberId,
      loanId,
      key,
      consent.version,
      consent.text,
      1,
      ip,
      userAgent,
    ]);
  }

  if (rows.length === 0) return 0;

  try {
    await bulkQuery(
      "INSERT INTO `consents` (`hris`, `member_id`, `loan_id`, `consent_type`, `consent_version`, `consent_text`, `granted`, `ip_address`, `user_agent`) VALUES ?",
      [rows],
    );
    return rows.length;
  } catch (err) {
    console.error(`  consent: could not record ${rows.length} consent(s) - ${err.message}`);
    return 0;
  }
}
