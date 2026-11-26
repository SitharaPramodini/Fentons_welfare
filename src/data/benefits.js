/* ===========================================================================
 * BENEFITS AND FACILITIES - clause 11 of the Reformed Constitution
 * (Draft V1, 21.10.2026), which Schedule I repeats.
 *
 * The clause opens: "The Society shall continue the existing approved Fentons
 * welfare benefits … and shall remain applicable unless revised through the
 * approved Company process." Every figure below is quoted from it. None of
 * these amounts changed in the 21.10.2026 draft.
 *
 * Do not add a benefit here that has not been approved.
 * =========================================================================== */

export const benefitsIntro =
  "The Society shall continue the existing approved Fentons welfare benefits. The following benefit schedule reflects the existing benefit structure provided in the current Fentons welfare documents and shall remain applicable unless revised through the approved Company process.";

/* --- Clause 11.1 - Death donation benefits -------------------------------- */

export const deathDonations = {
  /* Listed largest first. There is no per-row colour: the amount is the
   * variable, and one hue plus bar width says that more clearly than five
   * competing hues would. */
  rows: [
    /* `featured` is editorial, not rank: a member reads this page to find
     * their own cover first, so that card carries the gold. */
    { category: "Member", amount: 50000, icon: "IdCard", featured: true },
    { category: "Member’s spouse", amount: 30000, icon: "Heart" },
    {
      category: "Eligible child",
      note: "Below 21 years / applicable existing condition",
      amount: 25000,
      icon: "Baby",
    },
    { category: "Member’s parent", amount: 25000, icon: "Users" },
    { category: "Member’s spouse’s parent", amount: 25000, icon: "Users" },
  ],

  condition:
    "Death donation benefits shall be subject to the existing eligibility requirements, supporting documents and verification procedures of the Society.",
};

/* --- Clause 11.2 - Welfare / emergency / distress loan -------------------- */

export const welfareLoan = {
  name: "Welfare / Emergency / Distress Loan",

  /* The one figure a member comes to this page for. */
  headline: {
    label: "Maximum loan amount",
    value: "Rs. 25,000/-",
    note: "At 5% fixed interest, repaid over ten months from the date of release.",
  },

  /* The supporting terms. Value and detail are kept apart so each reads as a
   * short figure with its condition beneath, rather than one long sentence. */
  terms: [
    {
      label: "Interest",
      value: "5% fixed",
      note: "Rs. 1,250/- on a Rs. 25,000/- loan",
      icon: "Percent",
    },
    {
      label: "Repayment",
      value: "10 months",
      note: "From the date of release",
      icon: "Hourglass",
    },
    {
      label: "Loan Fund contribution",
      value: "Rs. 1,500/-",
      note: "Mandatory for consideration",
      icon: "Wallet",
    },
    {
      label: "Service required",
      value: "Over 2 years",
      note: "Of employment with the Company",
      icon: "CalendarClock",
    },
    {
      label: "Release",
      value: "Within 2 weeks",
      note: "Of approval",
      icon: "Clock",
    },
  ],

  eligibility: [
    "Members of the Welfare Society who have completed more than two (2) years of employment are eligible to apply for a welfare / emergency / distress loan, subject to the existing policy conditions.",
    "A guarantor shall be required for applicants who have completed less than five (5) years of service.",
    "A contribution of Rs. 1,500/- towards the Loan Fund shall be mandatory for loan consideration.",
    "Eligibility for another loan shall be considered after completion of twelve (12) months from the existing loan, subject to the applicable policy and availability of funds.",
    "A maximum of two (02) employees from each Division shall be eligible to apply for a welfare loan in any given month.",
    "Loan release shall be subject to the applicable divisional allocation, membership distribution and availability of funds.",
  ],

  /* How a member actually gets one, in order. */
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

/* ===========================================================================
 * HGRC FUNERAL BENEFIT
 *
 * NOT a Welfare Society of Fentons benefit.
 *
 * This is a separate scheme with its own schedule and its own monthly
 * contribution, and it is deliberately kept apart from everything above: the
 * figures are several times larger than the Society's own death donation, so
 * the two must never read as one list. Anything added here must come from
 * HGRC, and nothing here belongs in `deathDonations`.
 * ======================================================================== */

export const hgrcFuneralBenefit = {
  name: "HGRC Funeral Benefit",

  rows: [
    { category: "HGRC member (employee)", amount: 400000, icon: "IdCard", featured: true },
    { category: "Member’s spouse", note: "Wife / husband", amount: 200000, icon: "Heart" },
    { category: "Member’s child", note: "1 - 18 years", amount: 200000, icon: "Baby" },
    { category: "Member’s father / mother", amount: 200000, icon: "Users" },
    { category: "Member’s father-in-law / mother-in-law", amount: 200000, icon: "Users" },
    { category: "Child under 1 year / stillborn child", amount: 50000, icon: "Baby" },
  ],

  /* What the scheme costs, by employee category. Separate from the Society's
   * own joining fee and monthly subscription, which are on the Membership
   * page. */
  contributions: {
    label: "Monthly contribution",
    rows: [
      { category: "Executive category and above staff", amount: 620, icon: "Briefcase" },
      { category: "Non-executive staff", amount: 500, icon: "Users" },
    ],
  },
};

/* --- Clause 11.3 - Other existing welfare activities and facilities ------- */

export const otherActivities = {
  text: "Existing welfare activities and facilities operated by Fentons shall continue subject to their existing approved terms, availability of funds and Company approval.",
  change:
    "Any new benefit or facility, or any change to an existing benefit, shall be implemented only after obtaining the required Company approval.",
};
