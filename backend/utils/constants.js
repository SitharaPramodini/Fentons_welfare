/**
 * The closed value lists from the two forms. These are the single source of
 * truth for the ENUM columns in sql/schema.sql, the validators in the
 * controllers, and the `/api/meta/options` endpoint the frontend selects are
 * built from - so the three can never drift apart.
 */

/* Membership form, FOR HR DIVISION: "Fentons / EnergyNet / FSF / HEL" */
export const COMPANIES = ["Fentons", "EnergyNet", "FSF", "HEL"];

/* Membership form: "Employment Category: Non-Executive / Executive" */
export const EMPLOYMENT_CATEGORIES = ["Non-Executive", "Executive"];

/* Membership form, left column of the family block. */
export const PARENT_RELATIONSHIPS = ["Mother", "Father", "Mother-In-Law", "Father-In-Law"];
export const RELATIONSHIPS = [...PARENT_RELATIONSHIPS, "Child"];

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

/* Clause 4.4 of the Reformed Constitution (Draft V1, 21.10.2026).
 * The printed form still shows Rs. 200 as the joining fee; the Constitution
 * is the later document, so 250 governs until the form is reprinted. */
export const FEES = { joining: 250, monthly: 200 };
