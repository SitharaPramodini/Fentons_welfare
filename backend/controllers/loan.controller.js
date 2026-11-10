/**
 * Welfare loan applications - WFR/LOAN/2013.
 *
 * Sections 1-3, 5 and 7 of the form are the applicant's and arrive through
 * `createLoan`. Section 6, "FOR OFFICE USE ONLY", is never writable from the
 * public form: it is set by `decideLoan` and `releaseLoan`.
 */
import { query, queryOne, withTransaction } from "../dbconnection.js";
import {
  ApiError,
  asyncHandler,
  buildReference,
  buildUpdateSet,
  created,
  ok,
  readId,
  readPaging,
  validate,
  validatePartial,
} from "../utils/validate.js";
import { IDENTITY_TYPES, LOAN_STATUSES, TITLES } from "../utils/constants.js";
import { buildLoanPdf } from "../utils/loanPdf.js";
import { acknowledgeLoan, notifyLoanSubmitted } from "../utils/notifications.js";
import { recordAudit, recordConsents } from "../utils/audit.js";

/* --- Field rules ---------------------------------------------------------- */

/** Sections 1, 2, 3, 5 and 7 - everything the applicant fills in. */
const applicantSchema = {
  /* 1) PERSONAL DETAILS */
  title: { label: "Title", type: "enum", values: TITLES, required: true },
  full_name: { label: "Full name", required: true, max: 150, minLength: 3 },
  date_of_birth: { label: "Date of birth", type: "date", required: true },
  identity_type: {
    label: "Identity document",
    type: "enum",
    values: IDENTITY_TYPES,
    required: false,
    default: "NIC",
  },
  identity_number: { label: "NIC/DL/Passport No", required: true, max: 30, minLength: 5 },
  telephone: { label: "Telephone", type: "phone", required: true },
  email: { label: "E-mail address", type: "email", required: false },

  /* 2) EMPLOYMENT DETAILS */
  date_joined: { label: "Date joined", type: "date", required: true },
  epf_number: { label: "EPF No", required: true, max: 20 },
  designation: { label: "Designation", required: true, max: 120 },
  years_of_service: {
    label: "No of years of service",
    type: "decimal",
    required: false,
    min: 0,
    max: 60,
  },
  division: { label: "Division", required: true, max: 100 },
  /* Membership commences with effect from a date the applicant chooses, which
   * may be in the future - and the EPF lookup pre-fills this field from it,
   * so a future date has to be accepted here too. */
  date_joined_society: {
    label: "Date joined to Welfare Society",
    type: "date",
    required: false,
    allowFuture: true,
  },

  /* 3) FACILITY REQUIRED */
  loan_purpose: { label: "Purpose of loan", required: true, max: 500, minLength: 5 },
  loan_amount: {
    label: "Loan amount",
    type: "decimal",
    required: true,
    min: 1,
    max: 9_999_999.99,
  },

  /* 5) DECLARATION */
  declaration_accepted: {
    label: "Declaration",
    type: "bool",
    required: true,
    mustBeTrue: true,
    message: "You must declare that the information given is true and correct.",
  },

  /* 7) PAYROLL DEDUCTION */
  payroll_deduction_consent: {
    label: "Payroll deduction",
    type: "bool",
    required: true,
    mustBeTrue: true,
    message:
      "You must agree to the payroll deductions from your monthly salary until the loan is paid off.",
  },
  payroll_deduction_amount: {
    label: "Amount to be deducted",
    type: "decimal",
    required: false,
    min: 1,
    max: 9_999_999.99,
  },
};

/** 4) SECURITY - the guarantor block. */
const guarantorSchema = {
  full_name: { label: "Guarantor's full name", required: true, max: 150, minLength: 3 },
  date_joined: { label: "Guarantor's date joined", type: "date", required: false },
  division: { label: "Guarantor's division", required: false, max: 100 },
  designation: { label: "Guarantor's designation", required: false, max: 120 },
  epf_number: { label: "Guarantor's EPF No", required: false, max: 20 },
  identity_type: {
    label: "Guarantor's identity document",
    type: "enum",
    values: IDENTITY_TYPES,
    required: false,
    default: "NIC",
  },
  identity_number: {
    label: "Guarantor's NIC/DL/Passport No",
    required: true,
    max: 30,
    minLength: 5,
  },
  telephone: { label: "Guarantor's telephone", type: "phone", required: true },
  declaration_accepted: {
    label: "Guarantor's declaration",
    type: "bool",
    required: true,
    mustBeTrue: true,
    message: "The guarantor must confirm they are prepared to guarantee this facility.",
  },
};

/** 6) FOR OFFICE USE ONLY - Exco Approval. */
const decisionSchema = {
  status: {
    label: "Exco approval",
    type: "enum",
    values: ["under_review", "approved", "not_approved"],
    required: true,
  },
  fund_raising_contribution: { label: "Contribution towards fund raising project", type: "bool" },
  exco_remarks: { label: "Remarks", required: false, max: 500 },
  decided_by: { label: "Decided by", required: false, max: 150 },
};

/** 6) FOR OFFICE USE ONLY - release. */
const releaseSchema = {
  released_on: { label: "Loan released on", type: "date", required: true },
  amount_released: {
    label: "Amount released",
    type: "decimal",
    required: true,
    min: 1,
    max: 9_999_999.99,
  },
  authorized_by_1: { label: "Authorized signatory", required: true, max: 150 },
  authorized_by_2: { label: "Second authorized signatory", required: false, max: 150 },
  authorized_date: { label: "Authorised date", type: "date", required: false },
};

/* --- Helpers -------------------------------------------------------------- */

async function findLoanOr404(id) {
  const loan = await queryOne("SELECT * FROM `loan_applications` WHERE `id` = ?", [id]);
  if (!loan) throw new ApiError(404, "No loan application found with that id.");

  const guarantors = await query(
    "SELECT * FROM `loan_guarantors` WHERE `loan_id` = ? ORDER BY `id`",
    [id],
  );
  return { ...loan, guarantors };
}

/** Years between a joining date and today, to one decimal place. */
function yearsSince(dateJoined) {
  if (!dateJoined) return null;
  const joined = new Date(`${String(dateJoined).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(joined.getTime())) return null;
  const years = (Date.now() - joined.getTime()) / (365.25 * 24 * 3600 * 1000);
  return years < 0 ? null : Number(years.toFixed(1));
}

/**
 * Clause 8.2: "A guarantor shall be required for applicants who have
 * completed less than five (5) years of service." The declared years are
 * trusted when given, and fall back to the joining date otherwise. A missing
 * answer is treated as under five years, so the stricter rule applies.
 */
function guarantorIsRequired(data) {
  const years = data.years_of_service ?? yearsSince(data.date_joined);
  return years === null || years < 5;
}

/**
 * Reads the guarantor block. An empty block is allowed only for applicants
 * with five or more years of service. An array is accepted so a second
 * guarantor needs no API change.
 */
function collectGuarantors(body, required = true) {
  const supplied = Array.isArray(body.guarantors)
    ? body.guarantors
    : body.guarantor
      ? [body.guarantor]
      : [];

  /* A block the applicant left entirely blank is not a block at all.
   * `identity_type` is ignored because it carries a default value and so is
   * never blank, even in an untouched block. */
  const raw = supplied.filter((entry) =>
    Object.entries(entry ?? {}).some(
      ([key, value]) =>
        key !== "identity_type" &&
        value !== null &&
        value !== undefined &&
        value !== false &&
        String(value).trim() !== "",
    ),
  );

  if (raw.length === 0) {
    if (!required) return [];
    throw new ApiError(422, "Please correct the highlighted fields.", {
      "guarantor.full_name":
        "A guarantor is required for applicants with less than five (5) years of service.",
    });
  }

  return raw.map((entry, index) => {
    try {
      return validate(entry, guarantorSchema);
    } catch (err) {
      /* Re-key the field errors so the frontend can map them onto the right
       * guarantor block, e.g. `guarantor.telephone`. */
      if (err instanceof ApiError && err.details) {
        const prefix = raw.length > 1 ? `guarantors.${index}` : "guarantor";
        throw new ApiError(
          422,
          err.message,
          Object.fromEntries(
            Object.entries(err.details).map(([key, message]) => [`${prefix}.${key}`, message]),
          ),
        );
      }
      throw err;
    }
  });
}

/** Writes the guarantor block. A no-op when there is none to write. */
async function insertGuarantors(cx, loanId, guarantors, signedDate) {
  if (guarantors.length === 0) return;
  await cx.query(
    "INSERT INTO `loan_guarantors` (`loan_id`, `full_name`, `date_joined`, `division`, `designation`, `epf_number`, `identity_type`, `identity_number`, `telephone`, `declaration_accepted`, `signed_date`) VALUES ?",
    [
      guarantors.map((g) => [
        loanId,
        g.full_name,
        g.date_joined,
        g.division,
        g.designation,
        g.epf_number,
        g.identity_type,
        g.identity_number,
        g.telephone,
        g.declaration_accepted,
        signedDate,
      ]),
    ],
  );
}

/** A member cannot guarantee their own loan. */
function assertGuarantorIsNotApplicant(applicant, guarantors) {
  for (const g of guarantors) {
    const sameId = g.identity_number && g.identity_number === applicant.identity_number;
    const sameEpf = g.epf_number && g.epf_number === applicant.epf_number;
    if (sameId || sameEpf) {
      throw new ApiError(422, "Please correct the highlighted fields.", {
        "guarantor.full_name": "The guarantor must be someone other than the applicant.",
      });
    }
  }
}

/* --- Handlers ------------------------------------------------------------- */

/** POST /api/loans - submit a loan application. */
export const createLoan = asyncHandler(async (req, res) => {
  const data = validate(req.body, applicantSchema);
  const guarantors = collectGuarantors(req.body ?? {}, guarantorIsRequired(data));
  assertGuarantorIsNotApplicant(data, guarantors);

  /* Link to the membership record when the EPF number matches an approved
   * member. Left null otherwise - the Committee decides eligibility. */
  const member = await queryOne(
    "SELECT `id` FROM `members` WHERE `epf_number` = ? AND `status` = 'approved'",
    [data.epf_number],
  );

  const today = new Date().toISOString().slice(0, 10);
  const columns = {
    ...data,
    member_id: member?.id ?? null,
    applicant_signed_date: today,
    payroll_signed_date: today,
    /* Taken from the session, never from the request body. */
    hris: req.user?.hris ?? null,
  };

  const result = await withTransaction(async (cx) => {
    const keys = Object.keys(columns);
    const [insert] = await cx.execute(
      `INSERT INTO \`loan_applications\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys
        .map(() => "?")
        .join(", ")})`,
      keys.map((k) => columns[k]),
    );

    const id = insert.insertId;
    const reference = buildReference("L", id);
    await cx.execute("UPDATE `loan_applications` SET `reference_no` = ? WHERE `id` = ?", [
      reference,
      id,
    ]);

    await insertGuarantors(cx, id, guarantors, today);

    return { id, reference };
  });

  const loan = await findLoanOr404(result.id);

  /* The application is already saved. Building the PDF and writing to the
   * office are follow-on steps: if either fails the member still has their
   * reference, and the failure is logged rather than shown to them. */
  await recordConsents(req, {
    hris: req.user?.hris,
    loanId: loan.id,
    given: ["declaration", "payroll_deduction"],
  });

  await recordAudit(req, {
    action: "loan.submitted",
    entity: ["loan", loan.id],
    actor: { name: loan.full_name },
    summary: `${loan.reference_no} - ${loan.full_name} applied for Rs. ${Number(loan.loan_amount).toLocaleString("en-LK")}`,
    detail: {
      amount: loan.loan_amount,
      purpose: loan.loan_purpose,
      guarantor: loan.guarantors?.[0]?.full_name ?? null,
    },
  });

  const pdf = await buildLoanPdf(loan).catch((err) => {
    console.error("  pdf: could not build the loan application:", err.message);
    return null;
  });

  await notifyLoanSubmitted(loan, pdf);
  await acknowledgeLoan(loan, pdf);

  return created(
    res,
    loan,
    `Loan application received. Your reference is ${result.reference} - the Exco will review it and you will be informed of the decision.`,
  );
});

/**
 * GET /api/loans/:id/pdf - the printable application.
 *
 * Filled in from what was submitted, with the signatures and the whole of
 * section 6 left blank to be completed on paper. A member may download only
 * their own; the check is on the session, not the URL.
 */
export const downloadLoanPdf = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  const loan = await findLoanOr404(id);

  if (loan.hris !== req.user.hris) {
    throw new ApiError(404, "No loan application found with that id.");
  }

  await recordAudit(req, {
    action: "loan.pdf_downloaded",
    entity: ["loan", loan.id],
    summary: `${loan.reference_no} downloaded by its applicant`,
  });

  const pdf = await buildLoanPdf(loan);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${loan.reference_no}-loan-application.pdf"`,
  );
  res.setHeader("Cache-Control", "private, no-store");
  return res.send(pdf);
});

/** GET /api/loans */
export const listLoans = asyncHandler(async (req, res) => {
  const { page, limit, offset } = readPaging(req.query);
  const where = [];
  const params = [];

  if (req.query.status) {
    if (!LOAN_STATUSES.includes(req.query.status)) {
      throw new ApiError(400, `status must be one of: ${LOAN_STATUSES.join(", ")}.`);
    }
    where.push("`status` = ?");
    params.push(req.query.status);
  }

  if (req.query.epf) {
    where.push("`epf_number` = ?");
    params.push(String(req.query.epf).trim());
  }

  const search = String(req.query.search ?? "").trim();
  if (search) {
    where.push("(`full_name` LIKE ? OR `epf_number` LIKE ? OR `reference_no` LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const items = await query(
    `SELECT \`id\`, \`reference_no\`, \`member_id\`, \`title\`, \`full_name\`, \`epf_number\`,
            \`designation\`, \`division\`, \`telephone\`, \`loan_purpose\`, \`loan_amount\`,
            \`status\`, \`released_on\`, \`amount_released\`, \`created_at\`
       FROM \`loan_applications\` ${clause}
      ORDER BY \`created_at\` DESC, \`id\` DESC
      LIMIT ${limit} OFFSET ${offset}`,
    params,
  );

  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM \`loan_applications\` ${clause}`,
    params,
  );

  return ok(res, { items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
});

/** GET /api/loans/:id */
export const getLoanById = asyncHandler(async (req, res) => {
  return ok(res, await findLoanOr404(readId(req.params.id)));
});

/** GET /api/loans/member/:memberId - every loan filed by one member. */
export const listLoansByMember = asyncHandler(async (req, res) => {
  const memberId = readId(req.params.memberId, "member id");
  const items = await query(
    "SELECT `id`, `reference_no`, `loan_purpose`, `loan_amount`, `status`, `released_on`, `amount_released`, `created_at` FROM `loan_applications` WHERE `member_id` = ? ORDER BY `created_at` DESC",
    [memberId],
  );
  return ok(res, { items, total: items.length });
});

/** PUT /api/loans/:id - correct an application that has not been decided. */
export const updateLoan = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  const loan = await findLoanOr404(id);

  if (!["submitted", "under_review"].includes(loan.status)) {
    throw new ApiError(409, `A loan that is already ${loan.status} can no longer be edited.`);
  }

  const data = validatePartial(req.body, applicantSchema);
  const hasGuarantor = req.body?.guarantor !== undefined || req.body?.guarantors !== undefined;

  if (Object.keys(data).length === 0 && !hasGuarantor) {
    throw new ApiError(400, "Nothing to update.");
  }

  await withTransaction(async (cx) => {
    if (Object.keys(data).length > 0) {
      const { clause, values } = buildUpdateSet(data);
      await cx.execute(`UPDATE \`loan_applications\` SET ${clause} WHERE \`id\` = ?`, [
        ...values,
        id,
      ]);
    }

    if (hasGuarantor) {
      const merged = { ...loan, ...data };
      const guarantors = collectGuarantors(req.body ?? {}, guarantorIsRequired(merged));
      assertGuarantorIsNotApplicant(merged, guarantors);
      await cx.execute("DELETE FROM `loan_guarantors` WHERE `loan_id` = ?", [id]);
      await insertGuarantors(cx, id, guarantors, new Date().toISOString().slice(0, 10));
    }
  });

  return ok(res, await findLoanOr404(id), "Loan application updated.");
});

/** PATCH /api/loans/:id/decision - the Exco Approval box in section 6. */
export const decideLoan = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  const loan = await findLoanOr404(id);

  if (["released", "settled"].includes(loan.status)) {
    throw new ApiError(409, "This loan has already been released and cannot be re-decided.");
  }

  const data = validate(req.body, decisionSchema);
  await query(
    "UPDATE `loan_applications` SET `status` = ?, `fund_raising_contribution` = ?, `exco_remarks` = ?, `decided_by` = ?, `decided_at` = NOW() WHERE `id` = ?",
    [data.status, data.fund_raising_contribution, data.exco_remarks, data.decided_by, id],
  );

  return ok(res, await findLoanOr404(id), `Loan application marked as ${data.status}.`);
});

/** PATCH /api/loans/:id/release - records the release half of section 6. */
export const releaseLoan = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  const loan = await findLoanOr404(id);

  if (loan.status !== "approved") {
    throw new ApiError(409, "Only an approved loan can be released.");
  }

  const data = validate(req.body, releaseSchema);
  if (Number(data.amount_released) > Number(loan.loan_amount)) {
    throw new ApiError(422, "Please correct the highlighted fields.", {
      amount_released: "The amount released cannot exceed the amount applied for.",
    });
  }

  await query(
    "UPDATE `loan_applications` SET `status` = 'released', `released_on` = ?, `amount_released` = ?, `authorized_by_1` = ?, `authorized_by_2` = ?, `authorized_date` = ? WHERE `id` = ?",
    [
      data.released_on,
      data.amount_released,
      data.authorized_by_1,
      data.authorized_by_2,
      data.authorized_date ?? data.released_on,
      id,
    ],
  );

  return ok(res, await findLoanOr404(id), "Loan marked as released.");
});

/** PATCH /api/loans/:id/settle - the payroll deductions have paid it off. */
export const settleLoan = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  const loan = await findLoanOr404(id);

  if (loan.status !== "released") {
    throw new ApiError(409, "Only a released loan can be settled.");
  }

  await query("UPDATE `loan_applications` SET `status` = 'settled' WHERE `id` = ?", [id]);
  return ok(res, await findLoanOr404(id), "Loan marked as settled.");
});

/** DELETE /api/loans/:id - guarantors cascade. */
export const deleteLoan = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  await findLoanOr404(id);
  await query("DELETE FROM `loan_applications` WHERE `id` = ?", [id]);
  return ok(res, { id }, "Loan application deleted.");
});

/** GET /api/loans/stats */
export const getLoanStats = asyncHandler(async (_req, res) => {
  const rows = await query(
    "SELECT `status`, COUNT(*) AS count, COALESCE(SUM(`loan_amount`), 0) AS amount FROM `loan_applications` GROUP BY `status`",
  );

  const byStatus = Object.fromEntries(LOAN_STATUSES.map((s) => [s, { count: 0, amount: 0 }]));
  for (const row of rows) {
    byStatus[row.status] = { count: Number(row.count), amount: Number(row.amount) };
  }

  const [{ released }] = await query(
    "SELECT COALESCE(SUM(`amount_released`), 0) AS released FROM `loan_applications` WHERE `status` IN ('released','settled')",
  );

  return ok(res, {
    byStatus,
    total: Object.values(byStatus).reduce((sum, s) => sum + s.count, 0),
    totalReleased: Number(released),
  });
});
