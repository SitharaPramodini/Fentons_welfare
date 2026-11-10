/**
 * Membership applications - WFR/F/09/2020 Rev 02.
 *
 * The public site calls `createMember` and `declineMembership`. Everything
 * else is for whoever administers the Society (listing, reviewing, approving,
 * correcting and removing applications).
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
import {
  COMPANIES,
  EMPLOYMENT_CATEGORIES,
  FEES,
  MEMBER_STATUSES,
  PARENT_RELATIONSHIPS,
} from "../utils/constants.js";
import {
  DOCUMENT_TYPES,
  assertFilesAreValid,
  removeDocuments,
  storeDocuments,
} from "../utils/uploads.js";
import { notifyMembershipSubmitted } from "../utils/notifications.js";
import { recordAudit, recordConsents } from "../utils/audit.js";

/* --- Field rules ---------------------------------------------------------- */

/** The applicant's own half of the form. */
const applicantSchema = {
  full_name: { label: "Member's name in full", required: true, max: 150, minLength: 3 },
  permanent_address: { label: "Permanent address", required: true, max: 255, minLength: 5 },
  date_of_birth: { label: "Date of birth", type: "date", required: true },
  nic_number: { label: "National Identity Card No", required: true, max: 20, minLength: 5 },
  contact_number: { label: "Contact number", type: "phone", required: true },
  email: { label: "E-mail address", type: "email", required: false },
  spouse_name: { label: "Name of spouse", required: false, max: 150 },

  company: { label: "Company name", type: "enum", values: COMPANIES, required: true },
  division: { label: "Division", required: true, max: 100 },
  epf_number: { label: "EPF No", required: true, max: 20 },
  employment_category: {
    label: "Employment category",
    type: "enum",
    values: EMPLOYMENT_CATEGORIES,
    required: true,
  },

  membership_effective_from: {
    label: "Membership with effect from",
    type: "date",
    required: true,
    allowFuture: true,
  },
  declaration_accepted: {
    label: "Declaration",
    type: "bool",
    required: true,
    mustBeTrue: true,
    message:
      "You must declare the details true and agree to abide by the Constitution of the Society.",
  },
  payroll_deduction_consent: {
    label: "Salary deduction consent",
    type: "bool",
    required: true,
    mustBeTrue: true,
    message: `You must consent to the Rs. ${FEES.joining}/= entrance fee and Rs. ${FEES.monthly}/= monthly subscription being deducted from your salary.`,
  },
  constitution_accepted: {
    label: "Constitution",
    type: "bool",
    required: true,
    mustBeTrue: true,
    message: "You must read the Constitution and agree to abide by it.",
  },
  /* Required before the certificates can be accepted: these are sensitive
   * personal records and the member has to agree to them being held. */
  data_consent_accepted: {
    label: "Consent to collect personal documents",
    type: "bool",
    required: true,
    mustBeTrue: true,
    message:
      "You must consent to the Society collecting and holding these personal documents before you can attach them.",
  },
};

/** What HR may change after submission. */
const reviewSchema = {
  status: { label: "Status", type: "enum", values: MEMBER_STATUSES, required: true },
  hr_remarks: { label: "Remarks", required: false, max: 500 },
  processed_by: { label: "Processed by", required: false, max: 150 },
};

const declineSchema = {
  full_name: { label: "Name", required: true, max: 150, minLength: 3 },
  epf_number: { label: "EPF No", required: false, max: 20 },
  company: { label: "Company name", type: "enum", values: COMPANIES, required: false },
  division: { label: "Division", required: false, max: 100 },
  declined_on: { label: "Date", type: "date", required: true, allowFuture: true },
  reason: { label: "Reason", required: false, max: 500 },
};

/* --- Dependants ----------------------------------------------------------- */

/**
 * Normalises the family block into rows for `member_dependants`.
 *
 * Accepts `parents: { Mother: "...", Father: "..." }` (or an array of
 * `{ relationship, full_name }`) and `children: [{ full_name, date_of_birth }]`.
 * Blank entries are dropped - the form only asks for parents "if they are
 * alive", so an empty box is normal rather than an error.
 */
function collectDependants(body) {
  const rows = [];
  const nic = (value) => {
    const text = String(value ?? "").trim();
    return text ? text.slice(0, 20) : null;
  };

  const parents = body.parents;
  if (parents && !Array.isArray(parents)) {
    /* `{ Mother: { full_name, nic_number } }`, or the older plain-string
     * shape `{ Mother: "name" }`. */
    for (const relationship of PARENT_RELATIONSHIPS) {
      const entry = parents[relationship];
      const name = String((typeof entry === "string" ? entry : entry?.full_name) ?? "").trim();
      if (!name) continue;
      rows.push({
        relationship,
        full_name: name.slice(0, 150),
        nic_number: typeof entry === "string" ? null : nic(entry?.nic_number),
        date_of_birth: null,
      });
    }
  } else if (Array.isArray(parents)) {
    for (const entry of parents) {
      const name = String(entry?.full_name ?? "").trim();
      const relationship = String(entry?.relationship ?? "").trim();
      if (name && PARENT_RELATIONSHIPS.includes(relationship)) {
        rows.push({
          relationship,
          full_name: name.slice(0, 150),
          nic_number: nic(entry?.nic_number),
          date_of_birth: null,
        });
      }
    }
  }

  if (Array.isArray(body.children)) {
    for (const child of body.children) {
      const name = String(child?.full_name ?? "").trim();
      if (!name) continue;
      const dob = String(child?.date_of_birth ?? "").slice(0, 10);
      rows.push({
        relationship: "Child",
        full_name: name.slice(0, 150),
        nic_number: null,
        date_of_birth: /^\d{4}-\d{2}-\d{2}$/.test(dob) ? dob : null,
      });
    }
  }

  if (rows.length > 25) {
    throw new ApiError(422, "Too many dependants listed.", {
      children: "Please list no more than 25 dependants.",
    });
  }
  return rows;
}

async function insertDependants(cx, memberId, rows) {
  if (rows.length === 0) return;
  await cx.query(
    "INSERT INTO `member_dependants` (`member_id`, `relationship`, `full_name`, `nic_number`, `date_of_birth`) VALUES ?",
    [rows.map((r) => [memberId, r.relationship, r.full_name, r.nic_number, r.date_of_birth])],
  );
}

/** Loads one application plus its dependants, or throws 404. */
async function findMemberOr404(id) {
  const member = await queryOne("SELECT * FROM `members` WHERE `id` = ?", [id]);
  if (!member) throw new ApiError(404, "No membership application found with that id.");

  const dependants = await query(
    "SELECT `id`, `relationship`, `full_name`, `nic_number`, `date_of_birth` FROM `member_dependants` WHERE `member_id` = ? ORDER BY FIELD(`relationship`, 'Mother','Father','Mother-In-Law','Father-In-Law','Child'), `id`",
    [id],
  );

  /* Metadata only - the files are served one at a time by their own route. */
  const documents = await query(
    "SELECT `id`, `doc_type`, `original_name`, `mime_type`, `size_bytes`, `uploaded_at` FROM `member_documents` WHERE `member_id` = ? ORDER BY `id`",
    [id],
  );

  return {
    ...member,
    parents: dependants.filter((d) => d.relationship !== "Child"),
    children: dependants.filter((d) => d.relationship === "Child"),
    documents,
  };
}

/** mysql2 duplicate-key errors turned into a field-level 409. */
function rethrowDuplicate(err) {
  if (err?.code !== "ER_DUP_ENTRY") throw err;
  const message = String(err.sqlMessage || "");
  if (message.includes("uq_members_nic")) {
    throw new ApiError(409, "That NIC number has already been registered.", {
      nic_number: "An application already exists for this NIC number.",
    });
  }
  if (message.includes("uq_members_epf")) {
    throw new ApiError(409, "That EPF number has already been registered.", {
      epf_number: "An application already exists for this EPF number.",
    });
  }
  throw new ApiError(409, "That application already exists.");
}

/* --- Handlers ------------------------------------------------------------- */

/**
 * The form arrives as multipart, because it carries certificates. Everything
 * except the files is sent as one JSON string so the nested family block
 * survives the trip and the validators below are unchanged.
 */
function readPayload(req) {
  if (typeof req.body?.payload !== "string") return req.body ?? {};
  try {
    return JSON.parse(req.body.payload);
  } catch {
    throw new ApiError(400, "The application could not be read. Please try again.");
  }
}

/**
 * Which certificates this application must carry.
 *
 * A member always supplies their own birth certificate. The spouse's birth
 * certificate and the marriage certificate are required only when a spouse is
 * named — an unmarried applicant is not asked for papers that do not exist.
 */
function assertRequiredDocuments(data, files) {
  const present = (field) => Boolean(files?.[field]?.[0]);
  const errors = {};

  if (!present("birth_certificate")) {
    errors.birth_certificate = "Please attach your birth certificate.";
  }

  if (String(data.spouse_name ?? "").trim()) {
    if (!present("spouse_birth_certificate")) {
      errors.spouse_birth_certificate =
        "Please attach your spouse's birth certificate, or remove their name above.";
    }
    if (!present("marriage_certificate")) {
      errors.marriage_certificate =
        "Please attach your marriage certificate, or remove your spouse's name above.";
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ApiError(422, "Please correct the highlighted fields.", errors);
  }
}

/** POST /api/members - submit a membership application. */
export const createMember = asyncHandler(async (req, res) => {
  const payload = readPayload(req);
  const data = validate(payload, applicantSchema);
  const dependants = collectDependants(payload);

  assertRequiredDocuments(data, req.files);
  assertFilesAreValid(req.files);

  const { constitution_accepted, data_consent_accepted, ...columnsFromForm } = data;

  let storedFor = null;

  const result = await withTransaction(async (cx) => {
    const columns = {
      ...columnsFromForm,
      signed_date: new Date().toISOString().slice(0, 10),
      /* Written explicitly rather than left to the column default, so the
       * figure stored against a member is the one they were shown and
       * consented to. A later change to FEES does not rewrite old rows. */
      joining_fee: FEES.joining,
      monthly_fee: FEES.monthly,
      /* Taken from the session, never from the request body: an application
       * is always filed by the member who is signed in. */
      hris: req.user?.hris ?? null,
      constitution_accepted,
      constitution_accepted_at: new Date(),
    };
    const keys = Object.keys(columns);

    const [insert] = await cx.execute(
      `INSERT INTO \`members\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys
        .map(() => "?")
        .join(", ")})`,
      keys.map((k) => columns[k]),
    );

    const id = insert.insertId;
    const reference = buildReference("M", id);
    await cx.execute("UPDATE `members` SET `reference_no` = ? WHERE `id` = ?", [reference, id]);
    await insertDependants(cx, id, dependants);

    /* Files are written only once the row exists. `storedFor` lets the catch
     * below delete them if the transaction is rolled back after this point,
     * so a failed submission never leaves certificates on disk. */
    const documents = await storeDocuments(id, req.files);
    storedFor = id;

    if (documents.length > 0) {
      await cx.query(
        "INSERT INTO `member_documents` (`member_id`, `doc_type`, `original_name`, `stored_name`, `mime_type`, `size_bytes`) VALUES ?",
        [
          documents.map((d) => [
            d.member_id,
            d.doc_type,
            d.original_name,
            d.stored_name,
            d.mime_type,
            d.size_bytes,
          ]),
        ],
      );
    }

    return { id, reference };
  }).catch(async (err) => {
    if (storedFor !== null) await removeDocuments(storedFor);
    return rethrowDuplicate(err);
  });

  const member = await findMemberOr404(result.id);

  /* The consents given, in the Society's own words, and the event itself.
   * Neither is allowed to fail the application. */
  await recordConsents(req, {
    hris: req.user?.hris,
    memberId: member.id,
    given: ["special_personal_data", "constitution", "declaration", "payroll_deduction"],
  });

  await recordAudit(req, {
    action: "membership.submitted",
    entity: ["member", member.id],
    actor: { name: member.full_name },
    summary: `${member.reference_no} submitted by ${member.full_name}`,
    detail: {
      epf_number: member.epf_number,
      company: member.company,
      division: member.division,
      documents: member.documents.map((d) => d.doc_type),
      dependants: member.parents.length + member.children.length,
    },
  });

  /* Follow-on, like the loan: the application is saved either way. */
  await notifyMembershipSubmitted(member);

  return created(
    res,
    member,
    `Application received. Your reference is ${result.reference} - the Committee will confirm your membership once HR has verified your details.`,
  );
});

/** GET /api/members - list applications, newest first. */
export const listMembers = asyncHandler(async (req, res) => {
  const { page, limit, offset } = readPaging(req.query);
  const where = [];
  const params = [];

  if (req.query.status) {
    if (!MEMBER_STATUSES.includes(req.query.status)) {
      throw new ApiError(400, `status must be one of: ${MEMBER_STATUSES.join(", ")}.`);
    }
    where.push("`status` = ?");
    params.push(req.query.status);
  }

  if (req.query.company) {
    where.push("`company` = ?");
    params.push(req.query.company);
  }

  const search = String(req.query.search ?? "").trim();
  if (search) {
    where.push(
      "(`full_name` LIKE ? OR `epf_number` LIKE ? OR `nic_number` LIKE ? OR `reference_no` LIKE ?)",
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const rows = await query(
    `SELECT \`id\`, \`reference_no\`, \`full_name\`, \`nic_number\`, \`epf_number\`, \`company\`,
            \`division\`, \`employment_category\`, \`contact_number\`, \`email\`,
            \`membership_effective_from\`, \`status\`, \`created_at\`
       FROM \`members\` ${clause}
      ORDER BY \`created_at\` DESC, \`id\` DESC
      LIMIT ${limit} OFFSET ${offset}`,
    params,
  );

  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM \`members\` ${clause}`, params);

  return ok(res, {
    items: rows,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

/** GET /api/members/:id */
export const getMemberById = asyncHandler(async (req, res) => {
  const member = await findMemberOr404(readId(req.params.id));
  return ok(res, member);
});

/**
 * GET /api/members/lookup/:epf - the small public lookup the loan form uses
 * to pre-fill an applicant's details. Deliberately returns only what that
 * form needs: no address, no NIC, no dependants.
 */
export const lookupMemberByEpf = asyncHandler(async (req, res) => {
  const epf = String(req.params.epf ?? "").trim();
  if (!epf) throw new ApiError(400, "An EPF number is required.");

  const member = await queryOne(
    "SELECT `id`, `full_name`, `date_of_birth`, `contact_number`, `email`, `division`, `company`, `membership_effective_from`, `status` FROM `members` WHERE `epf_number` = ?",
    [epf],
  );

  if (!member || member.status !== "approved") {
    /* Not an error: a non-member may still apply, the form just will not
     * pre-fill. A 404 here would read as a failure in the UI. */
    return ok(res, { found: false });
  }

  return ok(res, {
    found: true,
    member_id: member.id,
    full_name: member.full_name,
    date_of_birth: member.date_of_birth,
    telephone: member.contact_number,
    email: member.email,
    division: member.division,
    company: member.company,
    date_joined_society: member.membership_effective_from,
  });
});

/** PUT /api/members/:id - correct a submitted application. */
export const updateMember = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  await findMemberOr404(id);

  const data = validatePartial(req.body, applicantSchema);
  const hasDependants = req.body?.parents !== undefined || req.body?.children !== undefined;

  if (Object.keys(data).length === 0 && !hasDependants) {
    throw new ApiError(400, "Nothing to update.");
  }

  await withTransaction(async (cx) => {
    if (Object.keys(data).length > 0) {
      const { clause, values } = buildUpdateSet(data);
      await cx.execute(`UPDATE \`members\` SET ${clause} WHERE \`id\` = ?`, [...values, id]);
    }

    /* Dependants are replaced wholesale - the form is a snapshot of the
     * family at the time of signing, not an incrementally edited list. */
    if (hasDependants) {
      await cx.execute("DELETE FROM `member_dependants` WHERE `member_id` = ?", [id]);
      await insertDependants(cx, id, collectDependants(req.body ?? {}));
    }
  }).catch(rethrowDuplicate);

  return ok(res, await findMemberOr404(id), "Application updated.");
});

/** PATCH /api/members/:id/status - HR approves or rejects. */
export const updateMemberStatus = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  await findMemberOr404(id);

  const { status, hr_remarks, processed_by } = validate(req.body, reviewSchema);

  await query(
    "UPDATE `members` SET `status` = ?, `hr_remarks` = ?, `processed_by` = ?, `processed_at` = NOW() WHERE `id` = ?",
    [status, hr_remarks, processed_by, id],
  );

  /* Approving a member adopts any loan applications already filed under the
   * same EPF number, so the loan record links back to the membership. */
  await recordAudit(req, {
    action: `membership.${status}`,
    entity: ["member", id],
    summary: `Membership application ${id} marked ${status}`,
    detail: { remarks: hr_remarks, by: processed_by },
  });

  if (status === "approved") {
    await query(
      "UPDATE `loan_applications` l JOIN `members` m ON m.`epf_number` = l.`epf_number` SET l.`member_id` = m.`id` WHERE m.`id` = ? AND l.`member_id` IS NULL",
      [id],
    );
  }

  return ok(res, await findMemberOr404(id), `Application marked as ${status}.`);
});

/** DELETE /api/members/:id - dependants cascade. */
export const deleteMember = asyncHandler(async (req, res) => {
  const id = readId(req.params.id);
  await findMemberOr404(id);
  await query("DELETE FROM `members` WHERE `id` = ?", [id]);
  return ok(res, { id }, "Application deleted.");
});

/** POST /api/members/decline - the lower half of the membership form. */
export const declineMembership = asyncHandler(async (req, res) => {
  const data = validate(req.body, declineSchema);
  const keys = Object.keys(data);

  /* An INSERT returns a ResultSetHeader rather than rows. */
  const result = await query(
    `INSERT INTO \`membership_declinations\` (${keys.map((k) => `\`${k}\``).join(", ")}) VALUES (${keys
      .map(() => "?")
      .join(", ")})`,
    keys.map((k) => data[k]),
  );

  return created(res, { id: result.insertId }, "Your notice has been recorded.");
});

/** GET /api/members/declinations */
export const listDeclinations = asyncHandler(async (req, res) => {
  const { page, limit, offset } = readPaging(req.query);
  const items = await query(
    `SELECT * FROM \`membership_declinations\` ORDER BY \`created_at\` DESC, \`id\` DESC LIMIT ${limit} OFFSET ${offset}`,
  );
  const [{ total }] = await query("SELECT COUNT(*) AS total FROM `membership_declinations`");
  return ok(res, { items, page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) });
});

/** GET /api/members/stats - counts for a dashboard tile. */
export const getMemberStats = asyncHandler(async (_req, res) => {
  const rows = await query("SELECT `status`, COUNT(*) AS count FROM `members` GROUP BY `status`");
  const counts = Object.fromEntries(MEMBER_STATUSES.map((s) => [s, 0]));
  for (const row of rows) counts[row.status] = Number(row.count);
  return ok(res, { ...counts, total: Object.values(counts).reduce((a, b) => a + b, 0) });
});
