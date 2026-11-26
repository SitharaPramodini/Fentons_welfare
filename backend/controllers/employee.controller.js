/**
 * The eligible-employee list, read from the Company's staff record.
 *
 * Signed-in members only. Clause 4.1 opens membership to every category of
 * employee, so the list is the staff record itself with each person's
 * membership status attached.
 */
import { dbConfig } from "../dbconnection.js";
import { asyncHandler, ok, readPaging } from "../utils/validate.js";
import {
  findEmployeeByHris,
  listCompanies,
  listEligibleEmployees,
  toProfile,
} from "../utils/directory.js";

/** GET /api/employees - searchable, paginated. */
export const listEmployees = asyncHandler(async (req, res) => {
  const { page, limit, offset } = readPaging(req.query, { defaultLimit: 24, maxLimit: 60 });

  const { items, total } = await listEligibleEmployees({
    search: req.query.search ?? "",
    company: req.query.company ?? "",
    limit,
    offset,
    membersDb: dbConfig.database,
  });

  return ok(res, {
    items,
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

/** GET /api/employees/companies - the filter options for that list. */
export const employeeCompanies = asyncHandler(async (_req, res) => {
  return ok(res, { companies: await listCompanies() });
});

/**
 * GET /api/employees/prefill - the signed-in member's own staff record,
 * shaped for the two application forms.
 *
 * Deliberately keyed to the session rather than taking an HRIS parameter: a
 * member may only pre-fill a form with their own details.
 */
export const prefillForMe = asyncHandler(async (req, res) => {
  const employee = await findEmployeeByHris(req.user.hris);
  if (!employee) return ok(res, { found: false });

  const p = toProfile(employee);

  return ok(res, {
    found: true,
    hris: p.hris,
    full_name: p.full_name,
    calling_name: p.calling_name,
    date_of_birth: p.date_of_birth,
    nic_number: p.nic_number,
    identity_number: p.nic_number,
    contact_number: p.mobile_no,
    telephone: p.mobile_no,
    email: p.email,
    permanent_address: p.address,
    epf_number: p.epf_number,
    division: p.department,
    designation: p.position,
    date_joined: p.joined_on,
    years_of_service: p.service_years,
    company: p.company,
  });
});
