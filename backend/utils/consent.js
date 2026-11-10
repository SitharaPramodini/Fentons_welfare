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
    version: "1.0",
    label: "Collecting your personal documents",
    required: true,
    heading: "Consent to collect sensitive personal records",
    text:
      "I consent to the Welfare Society of Fentons collecting, recording and holding the personal documents and details I have given on this form - including my birth certificate, my spouse's birth certificate, my marriage certificate, my National Identity Card number, and the names and National Identity Card numbers of my parents and parents-in-law.\n\n" +
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

  declaration: {
    version: "1.0",
    label: "Declaration",
    required: true,
    heading: "Declaration",
    text: "I hereby declare that the above details are true and correct to the best of my knowledge, and hence, request for membership of the Society.",
  },

  payroll_deduction: {
    version: "1.0",
    label: "Salary deduction",
    required: true,
    heading: "Consent to salary deduction",
    text: "I have no objection for the entrance fee and the monthly membership subscription to be deducted from my salary until further notice.",
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
