/* ===========================================================================
 * THE TWO SOCIETY FORMS
 *
 * SOURCE OF TRUTH
 * ---------------
 * The option lists and labels here are taken from the printed forms:
 *
 *   WSF/01/2026 Rev 01 (19/11/2026) - Membership Application & Declaration
 *   WFR/LOAN/2013                   - Loan Application
 *
 * They mirror backend/utils/constants.js, which in turn mirrors the ENUM
 * columns in backend/sql/schema.sql. Change a value in one place and change
 * it in all three.
 * =========================================================================== */

export const forms = {
  membership: { code: "WSF/01/2026", revision: "01", revisedOn: "19/11/2026" },
  loan: { code: "WFR/LOAN/2013" },
};

/* "I hereby apply for membership ... with effect from 01st January 2027." */
export const membershipEffectiveFrom = "2027-01-01";

/* Membership form, FOR HR DIVISION USE ONLY: "Company / entity" */
export const companies = ["Fentons", "EnergyNet", "FSF", "HEL"];

/* Membership form: "Employment category: Non-Executive / Executive" */
export const employmentCategories = ["Non-Executive", "Executive"];

/* Membership form: "Civil Status: Single / Married / Divorced" */
export const civilStatuses = ["Single", "Married", "Divorced"];

/* Membership form, the Gender column of the children block. */
export const genders = ["Male", "Female"];

/* Membership form, the two family tables. Parents are recorded "if living". */
export const parentRelationships = ["Mother", "Father", "Mother-In-Law", "Father-In-Law"];

/* The spouse and parents-in-law table, which applies only when married. */
export const inLawRelationships = ["Mother-In-Law", "Father-In-Law"];

/* The children block has five numbered rows. */
export const maxChildren = 5;

/* Loan form: "Full Name (Mr. / Mrs. / Miss)" */
export const titles = ["Mr", "Mrs", "Miss"];

/* Loan form: "NIC/DL/Passport No" */
export const identityTypes = ["NIC", "DL", "Passport"];

/* Clause 4.4 of the Reformed Constitution (Draft V1, 21.10.2026), and the
 * authorisation on WSF/01/2026: a one-time joining fee of Rs. 250.00 and a
 * monthly membership fee of Rs. 200.00. */
export const fees = { joining: 250, monthly: 200 };

/**
 * The declaration wording, quoted from each form so the on-screen consent
 * says exactly what the signed paper version says.
 */
export const declarations = {
  membership:
    "I hereby apply for membership of the Welfare Society of Fentons with effect from 01st January 2027. I declare that the information provided in this application is true and correct to the best of my knowledge. Upon admission to membership, I agree to abide by the Constitution of the Society and its applicable rules and procedures.",
  membershipDeduction: `I authorize the deduction of Rs. ${fees.joining}.00 as a one-time joining fee and Rs. ${fees.monthly}.00 as the monthly membership fee from my salary, payable to the Welfare Society of Fentons, until further notice, in accordance with the Society's applicable rules and procedures.`,
  loan: "I hereby declare that the above information given by me/us is/are true and correct.",
  loanGuarantor:
    "I hereby declare that the above information given by me is true and correct, and that I am prepared to guaranty the facility required by the above named applicant.",
  loanPayroll:
    "I hereby agree to the payroll deductions from my monthly salary until my welfare loan through Welfare Society of Fentons has been paid off.",
};

/* The note above the children block on the membership form. */
export const childrenRule =
  "Unmarried children below 21 years of age and children over 6 months of age.";

/**
 * The checklist at the foot of the membership form. `when` says what makes
 * a document applicable; the backend applies the same rule, in
 * assertRequiredDocuments.
 */
export const membershipDocuments = [
  { field: "id_card", label: "Your ID card copy", when: "always" },
  { field: "birth_certificate", label: "Your birth certificate", when: "always" },
  { field: "spouse_id_card", label: "Spouse's ID card copy", when: "married" },
  { field: "spouse_birth_certificate", label: "Spouse's birth certificate", when: "married" },
  { field: "marriage_certificate", label: "Marriage certificate", when: "married" },
];
