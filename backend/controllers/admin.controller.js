/**
 * The Society's administration: the queue of applications waiting on a
 * decision, and the decisions themselves.
 *
 * Reachable only by the people listed in ADMIN_HRIS (see utils/admin.js).
 */
import { query, queryOne } from "../dbconnection.js";
import { ApiError, asyncHandler, ok, readId, readPaging, validate } from "../utils/validate.js";
import { buildLoanPdf } from "../utils/loanPdf.js";
import { notifyLoanApproved, notifyLoanDeclined } from "../utils/notifications.js";
import { readAction } from "../utils/actionToken.js";
import { recordAudit } from "../utils/audit.js";

/** The states a loan can still be decided from. */
const OPEN_STATES = ["submitted", "under_review"];

const decisionSchema = {
  remarks: { label: "Note to the member", required: false, max: 500 },
  decided_by: { label: "Decided by", required: false, max: 150 },
};

/** Loads a loan with its guarantor, or throws. */
async function loadLoan(id) {
  const loan = await queryOne("SELECT * FROM `loan_applications` WHERE `id` = ?", [id]);
  if (!loan) throw new ApiError(404, "No loan application found with that id.");

  const guarantors = await query(
    "SELECT * FROM `loan_guarantors` WHERE `loan_id` = ? ORDER BY `id`",
    [id],
  );
  return { ...loan, guarantors };
}

/* --- The queue ------------------------------------------------------------ */

/** GET /api/admin/pending - everything waiting on somebody. */
export const pending = asyncHandler(async (_req, res) => {
  const loans = await query(
    `SELECT l.\`id\`, l.\`reference_no\`, l.\`full_name\`, l.\`epf_number\`, l.\`division\`,
            l.\`designation\`, l.\`loan_amount\`, l.\`loan_purpose\`, l.\`years_of_service\`,
            l.\`status\`, l.\`created_at\`, g.\`full_name\` AS guarantor_name
       FROM \`loan_applications\` l
       LEFT JOIN \`loan_guarantors\` g ON g.\`loan_id\` = l.\`id\`
      WHERE l.\`status\` IN ('submitted','under_review')
      ORDER BY l.\`created_at\``,
  );

  const members = await query(
    `SELECT \`id\`, \`reference_no\`, \`full_name\`, \`epf_number\`, \`company\`, \`division\`,
            \`membership_effective_from\`, \`created_at\`
       FROM \`members\`
      WHERE \`status\` = 'pending'
      ORDER BY \`created_at\``,
  );

  return ok(res, {
    loans,
    members,
    total: loans.length + members.length,
  });
});

/* --- Deciding a loan ------------------------------------------------------ */

/**
 * Applies one decision and writes to the member.
 *
 * Shared by the signed-in route and the one-click link, so both behave
 * identically and neither can decide a loan twice.
 */
async function decide(loanId, action, { remarks = null, decidedBy = null, req = null } = {}) {
  const loan = await loadLoan(loanId);

  if (!OPEN_STATES.includes(loan.status)) {
    throw new ApiError(
      409,
      `${loan.reference_no} has already been dealt with - it is marked "${loan.status.replace(/_/g, " ")}".`,
    );
  }

  const status = action === "approve" ? "approved" : "not_approved";

  await query(
    "UPDATE `loan_applications` SET `status` = ?, `exco_remarks` = ?, `decided_by` = ?, `decided_at` = NOW() WHERE `id` = ?",
    [status, remarks, decidedBy, loanId],
  );

  const decided = { ...loan, status, exco_remarks: remarks };

  /* The letter must never hold up the decision: it is already recorded. */
  let mail;
  if (action === "approve") {
    const pdf = await buildLoanPdf(decided).catch(() => null);
    mail = await notifyLoanApproved(decided, pdf);
  } else {
    mail = await notifyLoanDeclined(decided);
  }

  await recordAudit(req, {
    action: `loan.${status}`,
    entity: ["loan", loanId],
    actor: { name: decidedBy },
    summary: `${loan.reference_no} marked ${status.replace(/_/g, " ")} by ${decidedBy ?? "the office"}`,
    detail: {
      amount: loan.loan_amount,
      remarks,
      emailed: mail.sent,
      via: req?.user ? "website" : "e-mail link",
    },
  });

  return { loan: decided, status, mail };
}

/** How the decision message reports on the letter that followed it. */
function mailNote(mail) {
  if (mail.sent) return "The member has been written to.";
  if (mail.reason === "smtp-not-configured") {
    return "SMTP is not set up yet, so the letter is waiting in backend/outbox.";
  }
  if (mail.reason === "no-email") return "No e-mail address is on file, so please tell them.";
  return "The letter could not be sent - see the server log.";
}

/** PATCH /api/admin/loans/:id/approve */
export const approveLoan = asyncHandler(async (req, res) => {
  const { remarks, decided_by } = validate(req.body ?? {}, decisionSchema);
  const result = await decide(readId(req.params.id), "approve", {
    remarks,
    decidedBy: decided_by || `HRIS ${req.user.hris}`,
    req,
  });

  return ok(
    res,
    { status: result.status, emailed: result.mail.sent },
    `${result.loan.reference_no} approved. ${mailNote(result.mail)}`,
  );
});

/** PATCH /api/admin/loans/:id/decline */
export const declineLoan = asyncHandler(async (req, res) => {
  const { remarks, decided_by } = validate(req.body ?? {}, decisionSchema);
  const result = await decide(readId(req.params.id), "decline", {
    remarks,
    decidedBy: decided_by || `HRIS ${req.user.hris}`,
    req,
  });

  return ok(
    res,
    { status: result.status, emailed: result.mail.sent },
    `${result.loan.reference_no} answered. ${mailNote(result.mail)}`,
  );
});

/* --- Deciding from the e-mail --------------------------------------------- */

/**
 * GET /api/admin/decision/:token - what this link would do.
 *
 * The link never acts on its own: mail scanners and link previewers follow
 * URLs, and an application must not be decided by a spam filter. This just
 * describes the pending decision so the page can ask for confirmation.
 */
export const describeDecision = asyncHandler(async (req, res) => {
  const claims = readAction(req.params.token);
  if (!claims) {
    throw new ApiError(410, "That link is no longer valid. Please sign in and decide from there.");
  }

  const loan = await loadLoan(claims.loanId);

  return ok(res, {
    action: claims.action,
    decidable: OPEN_STATES.includes(loan.status),
    loan: {
      id: loan.id,
      reference_no: loan.reference_no,
      full_name: loan.full_name,
      epf_number: loan.epf_number,
      division: loan.division,
      loan_amount: loan.loan_amount,
      loan_purpose: loan.loan_purpose,
      years_of_service: loan.years_of_service,
      status: loan.status,
      guarantor_name: loan.guarantors?.[0]?.full_name ?? null,
    },
  });
});

/** POST /api/admin/decision/:token - carry it out. */
export const applyDecision = asyncHandler(async (req, res) => {
  const claims = readAction(req.params.token);
  if (!claims) {
    throw new ApiError(410, "That link is no longer valid. Please sign in and decide from there.");
  }

  const { remarks } = validate(req.body ?? {}, decisionSchema);
  const result = await decide(claims.loanId, claims.action, {
    remarks,
    decidedBy: "Decided from the notification e-mail",
    req,
  });

  return ok(
    res,
    { status: result.status, reference: result.loan.reference_no, emailed: result.mail.sent },
    claims.action === "approve"
      ? `${result.loan.reference_no} approved, and the member has been told what to do next.`
      : `${result.loan.reference_no} has been answered kindly. The member has been invited to apply again.`,
  );
});

/* --- The records -----------------------------------------------------------
 * Consents and the audit trail, for the office. Read-only: neither is ever
 * edited or deleted through the application.
 * ------------------------------------------------------------------------ */

/** GET /api/admin/consents */
export const listConsents = asyncHandler(async (req, res) => {
  const { page, limit, offset } = readPaging(req.query, { defaultLimit: 25, maxLimit: 100 });

  const where = [];
  const params = [];
  if (req.query.type) {
    where.push("c.`consent_type` = ?");
    params.push(String(req.query.type));
  }
  if (req.query.hris) {
    where.push("c.`hris` = ?");
    params.push(Number(req.query.hris));
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const items = await query(
    `SELECT c.\`id\`, c.\`hris\`, c.\`member_id\`, c.\`loan_id\`, c.\`consent_type\`,
            c.\`consent_version\`, c.\`granted\`, c.\`granted_at\`, c.\`withdrawn_at\`,
            c.\`ip_address\`, m.\`full_name\`, m.\`reference_no\`
       FROM \`consents\` c
       LEFT JOIN \`members\` m ON m.\`id\` = c.\`member_id\`
      ${clause}
      ORDER BY c.\`granted_at\` DESC, c.\`id\` DESC
      LIMIT ${limit} OFFSET ${offset}`,
    params,
  );

  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM \`consents\` c ${clause}`, params);

  return ok(res, { items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
});

/**
 * GET /api/admin/consents/:id - one consent in full, including the exact
 * wording that was agreed to.
 */
export const readConsent = asyncHandler(async (req, res) => {
  const row = await queryOne("SELECT * FROM `consents` WHERE `id` = ?", [readId(req.params.id)]);
  if (!row) throw new ApiError(404, "No consent record found with that id.");
  return ok(res, row);
});

/** GET /api/admin/audit */
export const listAudit = asyncHandler(async (req, res) => {
  const { page, limit, offset } = readPaging(req.query, { defaultLimit: 40, maxLimit: 200 });

  const where = [];
  const params = [];
  if (req.query.action) {
    where.push("`action` = ?");
    params.push(String(req.query.action));
  }
  if (req.query.entity) {
    where.push("`entity_type` = ?");
    params.push(String(req.query.entity));
  }
  const search = String(req.query.search ?? "").trim();
  if (search) {
    where.push("(`summary` LIKE ? OR `actor_name` LIKE ? OR `action` LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const items = await query(
    `SELECT * FROM \`audit_log\` ${clause}
      ORDER BY \`occurred_at\` DESC, \`id\` DESC
      LIMIT ${limit} OFFSET ${offset}`,
    params,
  );

  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM \`audit_log\` ${clause}`, params);

  const actions = await query(
    "SELECT `action`, COUNT(*) AS n FROM `audit_log` GROUP BY `action` ORDER BY n DESC",
  );

  return ok(res, {
    items,
    actions,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});
