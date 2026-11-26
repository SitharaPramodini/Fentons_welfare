/**
 * The consents a member gives, and the exact words they agree to.
 *
 * The wording lives here rather than in the page, and the page asks the
 * server for it. That matters for evidence: what is written into the
 * `consents` table has to be the same text the member actually read, and it
 * cannot be if the browser sends its own copy back. The client only ever
 * sends "yes"; the server records what it showed.
 *
 * Changing wording means a new `version`. Old records keep the text that was
 * agreed to at the time, so a consent given in 2026 can still be read back
 * exactly as it stood.
 */
import { FEES, MEMBERSHIP_EFFECTIVE_FROM } from "./constants.js";

/** "01st January 2027", as the form itself writes the date. */
const EFFECTIVE_FROM_IN_WORDS = (() => {
  const date = new Date(`${MEMBERSHIP_EFFECTIVE_FROM}T00:00:00Z`);
  const day = date.getUTCDate();
  const teen = day > 3 && day < 21;
  const suffix = teen ? "th" : { 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th";
  const month = date.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  return `${String(day).padStart(2, "0")}${suffix} ${month} ${date.getUTCFullYear()}`;
})();

/**
 * How long the Society keeps what it collects. Stated in the consent itself,
 * because somebody handing over their marriage certificate is entitled to
 * know when it will be destroyed.
 */
export const RETENTION = {
  summary: "until one year after your employment with the Company ends",
  months_after_leaving: 12,
};

export const CONSENT_TYPES = [
  "special_personal_data",
  "constitution",
  "declaration",
  "payroll_deduction",
];

export const CONSENTS = {
  /* The one the uploads require. */
  special_personal_data: {
    /* 1.1 - WSF/01/2026 added the identity card copies and a birth
     * certificate for each child, so the wording has to name them. Consents
     * already recorded keep the 1.0 text they were given under. */
    version: "1.1",
    label: "Collecting your personal documents",
    required: true,
    heading: "Consent to collect sensitive personal records",
    text:
      "I consent to the Welfare Society of Fentons collecting, recording and holding the personal documents and details I have given on this form - including copies of my identity card and my spouse's identity card, my birth certificate, my spouse's birth certificate, my marriage certificate, my children's birth certificates, my National Identity Card number, my civil status, the names and National Identity Card numbers of my parents and parents-in-law, and the names, genders and dates of birth of my children.\n\n" +
      "I understand that these are sensitive personal records; that they are collected only to administer my membership of the Society and any benefit or loan I may claim under it; and that they are seen only by the Society's office and the HR Division.\n\n" +
      `I understand that they are kept for as long as I remain a member and for one (1) year after my employment with the Company ends, after which they are destroyed.\n\n` +
      "I understand that I may ask the Secretary at any time to see what is held about me, to have it corrected, or to ask what it has been used for.",
  },

  constitution: {
    version: "1.0",
    label: "The Constitution",
    required: true,
    heading: "Agreement to abide by the Constitution",
    text: "I have read the Constitution of the Welfare Society of Fentons and I agree to abide by it on obtaining membership.",
  },

  /* Both quoted from WSF/01/2026, so the record reads the same as the
   * signed paper form. */
  declaration: {
    version: "1.1",
    label: "Declaration",
    required: true,
    heading: "Application for Society membership",
    text: `I hereby apply for membership of the Welfare Society of Fentons with effect from ${EFFECTIVE_FROM_IN_WORDS}. I declare that the information provided in this application is true and correct to the best of my knowledge. Upon admission to membership, I agree to abide by the Constitution of the Society and its applicable rules and procedures.`,
  },

  payroll_deduction: {
    version: "1.1",
    label: "Salary deduction",
    required: true,
    heading: "Authorization for salary deductions",
    text: `I authorize the deduction of Rs. ${FEES.joining}.00 as a one-time joining fee and Rs. ${FEES.monthly}.00 as the monthly membership fee from my salary, payable to the Welfare Society of Fentons, until further notice, in accordance with the Society's applicable rules and procedures.`,
  },
};

/** What the form needs in order to display them. */
export function consentsForDisplay() {
  return Object.entries(CONSENTS).map(([key, c]) => ({
    key,
    version: c.version,
    label: c.label,
    heading: c.heading,
    required: c.required,
    text: c.text,
  }));
}
