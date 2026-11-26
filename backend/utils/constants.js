/**
 * The closed value lists from the two forms. These are the single source of
 * truth for the ENUM columns in sql/schema.sql, the validators in the
 * controllers, and the `/api/meta/options` endpoint the frontend selects are
 * built from - so the three can never drift apart.
 *
 * The membership form is WSF/01/2026 Revision 01 (19/11/2026), which replaced
 * WFR/F/09/2020 Rev 02. What it added: calling name, civil status,
 * designation, the spouse's NIC, each child's gender, and copies of the
 * identity cards.
 */

/* The printed membership form this site reproduces. */
export const MEMBERSHIP_FORM = {
  code: "WSF/01/2026",
  revision: "01",
  revised_on: "19/11/2026",
};

/* "I hereby apply for membership ... with effect from 01st January 2027." */
export const MEMBERSHIP_EFFECTIVE_FROM = "2027-01-01";

/* Membership form, FOR HR DIVISION: "Fentons / EnergyNet / FSF / HEL" */
export const COMPANIES = ["Fentons", "EnergyNet", "FSF", "HEL"];

/* Membership form: "Employment category: Non-Executive / Executive" */
export const EMPLOYMENT_CATEGORIES = ["Non-Executive", "Executive"];

/* Membership form: "Civil Status: Single / Married / Divorced" */
export const CIVIL_STATUSES = ["Single", "Married", "Divorced"];

/* Membership form, the Gender column of the children block. */
export const GENDERS = ["Male", "Female"];

/* Membership form, the two family tables. */
export const PARENT_RELATIONSHIPS = ["Mother", "Father", "Mother-In-Law", "Father-In-Law"];
export const RELATIONSHIPS = [...PARENT_RELATIONSHIPS, "Child"];

/* The children block has five numbered rows. */
export const MAX_CHILDREN = 5;

/* Loan form: "Full Name (Mr. / Mrs. / Miss)" */
export const TITLES = ["Mr", "Mrs", "Miss"];

/* Loan form: "NIC/DL/Passport No" */
export const IDENTITY_TYPES = ["NIC", "DL", "Passport"];

/* Processing states. 'approved' / 'not_approved' are the two Exco Approval
 * boxes in section 6 of the loan form. */
export const MEMBER_STATUSES = ["pending", "approved", "rejected"];
export const LOAN_STATUSES = [
  "submitted",
  "under_review",
  "approved",
  "not_approved",
  "released",
  "settled",
];

/* Clause 4.4 of the Reformed Constitution (Draft V1, 21.10.2026), and the
 * authorisation on form WSF/01/2026: "Rs. 250.00 as a one-time joining fee
 * and Rs. 200.00 as the monthly membership fee". */
export const FEES = { joining: 250, monthly: 200 };
