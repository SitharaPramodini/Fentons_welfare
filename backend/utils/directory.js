/**
 * Reads of the Company's staff record, `intranet.employee`.
 *
 * Everything here is read-only. Three things use it: sign-in, the
 * eligible-employee list, and pre-filling the two application forms.
 *
 * WHAT A COLLEAGUE MAY SEE
 * ------------------------
 * The eligible list is visible to every signed-in member, so `toDirectoryEntry`
 * deliberately returns no date of birth, NIC, address or personal mobile. The
 * date of birth matters most: a member's first password is their HRIS number
 * followed by their date of birth, and the HRIS number is their username — so
 * publishing birthdates would hand over the account of anyone who has not yet
 * set a password of their own.
 *
 * `toProfile` is richer, and is only ever returned to the person it describes.
 */
import { intranetQuery, intranetQueryOne } from "../dbconnection.js";

/* Clause 4.1 opens membership to every category of employee, so no employment
 * status is excluded. Narrow this list to restrict the Society to particular
 * group companies — it is the single place that decision lives. */
export const ELIGIBLE_SUB_COMPANIES = null; // null = every company in the record

const BASE_COLUMNS = `
  e.HRIS, e.full_name, e.calling_name, e.name_with_initial, e.emp_email,
  e.position, e.sub_department, e.sub_company, e.emp_location, e.emp_grade,
  e.emp_status, e.joined_datetime, e.service_years, e.EPF`;

const PRIVATE_COLUMNS = `
  e.birthdate, e.emp_nic, e.mobile_no, e.office_mobile, e.emp_gender,
  e.addressLine_1, e.addressLine_2, e.addressLine_3, e.addressLine_4,
  e.emp_province, e.emp_age, e.dep_ID, e.company_ID`;

/** `WHERE` fragment limiting rows to employees eligible for membership. */
function eligibilityClause(params) {
  if (!ELIGIBLE_SUB_COMPANIES?.length) return "e.HRIS IS NOT NULL";
  params.push(...ELIGIBLE_SUB_COMPANIES);
  return `e.HRIS IS NOT NULL AND e.sub_company IN (${ELIGIBLE_SUB_COMPANIES.map(() => "?").join(", ")})`;
}

/** The full record for one person — used for sign-in, their profile and pre-fill. */
export function findEmployeeByHris(hris) {
  return intranetQueryOne(
    `SELECT ${BASE_COLUMNS}, ${PRIVATE_COLUMNS} FROM \`employee\` e WHERE e.HRIS = ? LIMIT 1`,
    [hris],
  );
}

/** Joins the address lines the HR record keeps separate. */
function addressOf(row) {
  return [
    row.addressLine_1,
    row.addressLine_2,
    row.addressLine_3,
    row.addressLine_4,
    row.emp_province,
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

/** Everything the signed-in person may see about themselves. */
export function toProfile(row) {
  if (!row) return null;
  return {
    hris: row.HRIS,
    full_name: row.full_name,
    calling_name: row.calling_name,
    name_with_initial: row.name_with_initial,
    email: row.emp_email || null,
    position: row.position,
    department: row.sub_department,
    company: row.sub_company,
    location: row.emp_location,
    grade: row.emp_grade,
    employment_status: row.emp_status,
    joined_on: row.joined_datetime ? String(row.joined_datetime).slice(0, 10) : null,
    service_years: row.service_years === null ? null : Number(row.service_years),
    epf_number: row.EPF === null ? null : String(row.EPF),
    date_of_birth: row.birthdate,
    nic_number: row.emp_nic,
    mobile_no: row.mobile_no || row.office_mobile || null,
    gender: row.emp_gender,
    address: addressOf(row),
  };
}

/** What one colleague may see about another. No birthdate, NIC or address. */
export function toDirectoryEntry(row) {
  return {
    hris: row.HRIS,
    full_name: row.full_name,
    calling_name: row.calling_name,
    name_with_initial: row.name_with_initial,
    position: row.position,
    department: row.sub_department,
    company: row.sub_company,
    location: row.emp_location,
    joined_on: row.joined_datetime ? String(row.joined_datetime).slice(0, 10) : null,
    membership_status: row.membership_status ?? null,
    member_since: row.member_since ?? null,
  };
}

/**
 * The eligible-employee list, searchable by name, HRIS, position or
 * department, with each person's membership status attached.
 *
 * The membership table lives in the Society's own database, so it is joined
 * by its fully-qualified name.
 */
export async function listEligibleEmployees({
  search = "",
  company = "",
  limit = 24,
  offset = 0,
  membersDb,
}) {
  const params = [];
  const where = [eligibilityClause(params)];

  const term = String(search).trim();
  if (term) {
    where.push(
      "(e.full_name LIKE ? OR e.calling_name LIKE ? OR e.name_with_initial LIKE ? OR e.position LIKE ? OR e.sub_department LIKE ? OR CAST(e.HRIS AS CHAR) LIKE ?)",
    );
    const like = `%${term}%`;
    params.push(like, like, like, like, like, like);
  }

  if (String(company).trim()) {
    where.push("e.sub_company = ?");
    params.push(String(company).trim());
  }

  const clause = `WHERE ${where.join(" AND ")}`;
  /* `membersDb` comes from configuration, never from a request. */
  const members = `\`${membersDb}\`.\`members\``;

  const rows = await intranetQuery(
    `SELECT ${BASE_COLUMNS},
            m.\`status\`                    AS membership_status,
            m.\`membership_effective_from\` AS member_since
       FROM \`employee\` e
       LEFT JOIN ${members} m ON m.\`hris\` = e.HRIS
      ${clause}
      ORDER BY e.full_name
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}`,
    params,
  );

  const [{ total }] = await intranetQuery(
    `SELECT COUNT(*) AS total FROM \`employee\` e ${clause}`,
    params,
  );

  return { items: rows.map(toDirectoryEntry), total: Number(total) };
}

/** The distinct companies present in the record, for the list's filter. */
export async function listCompanies() {
  const params = [];
  const rows = await intranetQuery(
    `SELECT e.sub_company AS company, COUNT(*) AS total
       FROM \`employee\` e
      WHERE ${eligibilityClause(params)} AND e.sub_company IS NOT NULL AND e.sub_company <> ''
      GROUP BY e.sub_company
      ORDER BY total DESC`,
    params,
  );
  return rows.map((r) => ({ company: r.company, total: Number(r.total) }));
}
