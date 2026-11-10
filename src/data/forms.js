/* ===========================================================================
 * THE TWO SOCIETY FORMS
 *
 * SOURCE OF TRUTH
 * ---------------
 * The option lists and labels here are taken from the printed forms:
 *
 *   WFR/F/09/2020 Rev 02 - Membership Application Form
 *   WFR/LOAN/2013        - Loan Application
 *
 * They mirror backend/utils/constants.js, which in turn mirrors the ENUM
 * columns in backend/sql/schema.sql. Change a value in one place and change
 * it in all three.
 * =========================================================================== */

export const forms = {
  membership: { code: "WFR/F/09/2020", revision: "02", revisedOn: "08/09/2020" },
  loan: { code: "WFR/LOAN/2013" },
};

/* Membership form, FOR HR DIVISION: "Fentons / EnergyNet / FSF / HEL" */
export const companies = ["Fentons", "EnergyNet", "FSF", "HEL"];

/* Membership form: "Employment Category: Non-Executive / Executive" */
export const employmentCategories = ["Non-Executive", "Executive"];

/* Membership form, left column: recorded "if they are alive". */
export const parentRelationships = ["Mother", "Father", "Mother-In-Law", "Father-In-Law"];

/* Loan form: "Full Name (Mr. / Mrs. / Miss)" */
export const titles = ["Mr", "Mrs", "Miss"];

/* Loan form: "NIC/DL/Passport No" */
export const identityTypes = ["NIC", "DL", "Passport"];

/* Clause 4.4 of the Reformed Constitution (Draft V1, 21.10.2026):
 * entrance fee Rs. 250.00, monthly subscription Rs. 200.00.
 *
 * NOTE: the printed form (WFR/F/09/2020 Rev 02) still says Rs. 200/= as the
 * joining fee. The Constitution is the later document and governs, so 250 is
 * used here - but the form needs reprinting to match. */
export const fees = { joining: 250, monthly: 200 };

/**
 * The declaration wording, quoted from each form so the on-screen consent
 * says exactly what the signed paper version says.
 */
export const declarations = {
  membership:
    "I hereby declare that the above details are true and correct to the best of my knowledge, and hence, request for membership of the Society. Further, I agree to abide by the Constitution of the Society on obtaining the membership.",
  membershipDeduction: `I have no objection for the deduction of Rs. ${fees.joining}/= as the entrance fee and Rs. ${fees.monthly}/= as the monthly membership subscription to be paid to the Society from my salary until further notice.`,
  loan: "I hereby declare that the above information given by me/us is/are true and correct.",
  loanGuarantor:
    "I hereby declare that the above information given by me is true and correct, and that I am prepared to guaranty the facility required by the above named applicant.",
  loanPayroll:
    "I hereby agree to the payroll deductions from my monthly salary until my welfare loan through Welfare Society of Fentons has been paid off.",
};

/* The children column on the membership form. */
export const childrenRule = "Unmarried children below 21 years and children over 06 months.";
