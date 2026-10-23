/* ===========================================================================
 * BENEFITS AND FACILITIES — clause 8 and Schedule I of the Reformed
 * Constitution (v1.0).
 *
 * Clause 8 opens: "The Society shall continue the existing approved Fentons
 * welfare benefits … and shall remain applicable unless revised through the
 * approved Company process." Every figure below is quoted from that clause
 * and from Schedule I. Do not add a benefit here that has not been approved.
 * =========================================================================== */

export const benefitsIntro =
  "The Society shall continue the existing approved Fentons welfare benefits. The following benefit schedule reflects the existing benefit structure provided in the current Fentons welfare documents and shall remain applicable unless revised through the approved Company process.";

/* --- Clause 8.1 — Death donation benefits -------------------------------- */

export const deathDonations = {
  rows: [
    { category: "Member", amount: 50000, icon: "IdCard", accent: "brand" },
    { category: "Member’s spouse", amount: 30000, icon: "Heart", accent: "rose" },
    {
      category: "Eligible child",
      note: "Below 21 years / applicable existing condition",
      amount: 25000,
      icon: "Baby",
      accent: "sky",
    },
    { category: "Member’s parent", amount: 25000, icon: "Users", accent: "amber" },
    { category: "Member’s spouse’s parent", amount: 25000, icon: "Users", accent: "violet" },
  ],

  condition:
    "Death donation benefits shall be subject to the existing eligibility requirements, supporting documents and verification procedures of the Society.",
};

/* --- Clause 8.2 — Welfare / emergency / distress loan -------------------- */

export const welfareLoan = {
  name: "Welfare / Emergency / Distress Loan",

  /* The headline terms, for the summary table. */
  terms: [
    { label: "Maximum loan amount", value: "Rs. 25,000/-", icon: "HandCoins", strong: true },
    { label: "Interest", value: "5% fixed — Rs. 1,250/- on a Rs. 25,000/- loan", icon: "Percent" },
    { label: "Repayment period", value: "10 months from the date of release", icon: "Hourglass" },
    { label: "Loan Fund contribution", value: "Rs. 1,500/- (mandatory)", icon: "Wallet" },
    { label: "Service required", value: "More than 2 years of employment", icon: "CalendarClock" },
    { label: "Release", value: "Within two (02) weeks of approval", icon: "Clock" },
  ],

  eligibility: [
    "Members of the Welfare Society who have completed more than two (2) years of employment are eligible to apply for a welfare / emergency / distress loan, subject to the existing policy conditions.",
    "A guarantor shall be required for applicants who have completed less than five (5) years of service.",
    "A contribution of Rs. 1,500/- towards the Loan Fund shall be mandatory for loan consideration.",
    "Eligibility for another loan shall be considered after completion of twelve (12) months from the existing loan, subject to the applicable policy and availability of funds.",
    "A maximum of two (02) employees from each Division shall be eligible to apply for a welfare loan in any given month.",
    "Loan release shall be subject to the applicable divisional allocation, membership distribution and availability of funds.",
  ],

  /* How a member actually gets one — clause 8.2, in order. */
  process: [
    {
      title: "Submit the application",
      text: "A duly completed loan application shall be submitted through the relevant divisional representative.",
    },
    {
      title: "Approval",
      text: "The granting of a loan shall be subject to the required Exco / authorised Company approval.",
    },
    {
      title: "Release",
      text: "Approved loans shall be released within two (02) weeks, subject to completion of the required approvals and documentation.",
    },
    {
      title: "Repayment",
      text: "The repayment period shall be ten (10) months from the date of release of the loan.",
    },
  ],

  recovery: [
    "Where a member leaves the organisation before the loan is fully settled, the outstanding balance shall be recovered from the member’s final dues in accordance with Company procedures.",
    "Where the outstanding balance cannot be recovered from final dues, recovery from the guarantor shall be made in accordance with the approved loan policy.",
    "A loan should be granted before the applicable retirement period where necessary to ensure that the loan can be fully recovered prior to retirement.",
  ],
};

/* --- Clause 8.3 — Other existing welfare activities and facilities ------- */

export const otherActivities = {
  text: "Existing welfare activities and facilities operated by Fentons shall continue subject to their existing approved terms, availability of funds and Company approval.",
  change:
    "Any new benefit or facility, or any change to an existing benefit, shall be implemented only after obtaining the required Company approval.",
};

/* --- Schedule I — Existing approved welfare benefits ---------------------
 * Reproduced in full: the benefits to be retained under the reformed
 * Constitution, with the condition recorded against each.
 * ----------------------------------------------------------------------- */

export const scheduleI = [
  {
    benefit: "Death – Member",
    current: "Rs. 50,000/-",
    remarks: "Subject to existing eligibility and verification",
  },
  {
    benefit: "Death – Spouse",
    current: "Rs. 30,000/-",
    remarks: "Subject to existing eligibility and verification",
  },
  {
    benefit: "Death – Eligible Child",
    current: "Rs. 25,000/-",
    remarks: "Existing age/eligibility condition applies",
  },
  {
    benefit: "Death – Parent",
    current: "Rs. 25,000/-",
    remarks: "Subject to existing eligibility and verification",
  },
  {
    benefit: "Death – Spouse’s Parent",
    current: "Rs. 25,000/-",
    remarks: "Subject to existing eligibility and verification",
  },
  {
    benefit: "Welfare / Emergency Loan",
    current: "Up to Rs. 25,000/-",
    remarks: "Existing loan policy applies",
  },
  { benefit: "Loan Interest", current: "5% fixed", remarks: "Rs. 1,250/- on Rs. 25,000/-" },
  { benefit: "Loan Repayment", current: "10 months", remarks: "From date of release" },
  {
    benefit: "Loan Fund Contribution",
    current: "Rs. 1,500/-",
    remarks: "Mandatory for loan consideration",
  },
];
