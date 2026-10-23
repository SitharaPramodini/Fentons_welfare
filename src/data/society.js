/* ===========================================================================
 * THE SOCIETY — identity, objectives, membership and contributions.
 *
 * SOURCE OF TRUTH
 * ---------------
 * Every line in this file is taken from the Welfare Society of Fentons
 * Reformed Constitution (Version 1.0). Nothing here is illustrative or
 * invented. If a figure, name or date is not in the Constitution, it is not
 * on this site — add it here only when the Constitution is amended through
 * the approved Company process (clause 13).
 * =========================================================================== */

export const society = {
  /* Clause 1 — Name */
  name: "Welfare Society of Fentons",
  shortName: "Welfare Society",
  parentCompany: "Fentons",

  /* The governing document itself. Schedule II records version 1.0; the
   * approval signatures and effective date are not yet filled in, so they
   * are reported as pending rather than guessed at. */
  constitution: {
    title: "Reformed Constitution",
    version: "1.0",
    approvalPending: [
      "Prepared by",
      "Reviewed by",
      "Approved by Senior Management",
      "Effective Date",
    ],
  },

  /* Clause 2, first objective — used as the one-line summary of the Society. */
  intro: "To promote the welfare and well-being of employees of Fentons.",

  /* Clause 4, opening paragraph. */
  governedBy:
    "The affairs and administration of the Welfare Society shall be managed by a Committee of Management appointed by the Senior Management of the Company.",
};

/* --- Clause 2 — Objectives ----------------------------------------------- */

export const objectives = [
  {
    icon: "HeartHandshake",
    title: "Welfare and well-being",
    text: "To promote the welfare and well-being of employees of Fentons.",
    accent: "brand",
  },
  {
    icon: "HandCoins",
    title: "Financial and welfare assistance",
    text: "To provide financial and other welfare assistance to members in accordance with the approved benefits and facilities of the Society.",
    accent: "amber",
  },
  {
    icon: "Ambulance",
    title: "Assistance in difficult times",
    text: "To provide assistance during specified family, personal, medical and emergency circumstances.",
    accent: "rose",
  },
  {
    icon: "Users",
    title: "Participation and interaction",
    text: "To encourage employee participation, social interaction and welfare activities.",
    accent: "sky",
  },
  {
    icon: "ShieldCheck",
    title: "Responsible administration",
    text: "To maintain and administer the Society’s funds in a responsible, transparent and controlled manner.",
    accent: "emerald",
  },
];

/* --- Clause 3 — Membership and eligibility ------------------------------- */

export const membership = {
  eligibility: [
    "Employees of Fentons who satisfy the applicable membership requirements shall be eligible to become members of the Society.",
    "Membership shall commence in accordance with the approved membership procedure of the Society.",
    "Employees shall complete the prescribed membership documentation where required.",
  ],

  conditions: [
    "Employees who do not make the required contribution to the Welfare Fund shall not be entitled to the benefits and facilities of the Society for the relevant period, subject to any approved exception.",
  ],

  cessation: [
    "An employee who leaves employment, retires, or otherwise ceases to be eligible for membership shall cease to be a member of the Society from the effective date of such cessation.",
    "In the event of the death of a member, membership shall cease; however, the applicable death donation benefit may be paid in accordance with this Constitution.",
  ],
};

/* --- Clause 7 — Contributions to the Welfare Fund ------------------------ */

export const contributions = [
  {
    icon: "Wallet",
    text: "Members shall contribute to the Welfare Fund through the approved monthly subscription or contribution arrangement determined by the Company.",
  },
  {
    icon: "RefreshCw",
    text: "The applicable subscription amount may be reviewed and revised with the approval of the Company.",
  },
  {
    icon: "CircleAlert",
    text: "Contributions made to the Welfare Fund shall not be refundable upon cessation of employment, retirement, death, resignation from membership or under any other circumstance, unless otherwise specifically approved by the Company.",
  },
  {
    icon: "ShieldCheck",
    text: "All contributions shall be used solely for the approved purposes of the Society.",
  },
];

/* --- Clause 13 — Amendment of the Constitution --------------------------- */

export const amendment = [
  "No amendment, addition, deletion or alteration to this Constitution shall be made without the prior approval of Senior Management of the Company.",
  "Any proposed amendment shall be submitted in writing to Senior Management for consideration and approval.",
  "Approved amendments shall form part of this Constitution from the effective date determined by Senior Management.",
  "The benefit amounts and welfare facilities may be reviewed from time to time; however, no existing benefit shall be reduced, withdrawn or replaced without the required Company approval.",
];

/* --- Clause 14 — General provisions -------------------------------------- */

export const generalProvisions = [
  "The Committee of Management shall operate within the authority granted by Senior Management and shall comply with all applicable Company policies and procedures.",
  "The Committee shall not enter into any financial or other commitment on behalf of the Company without the required approval.",
  "Any matter not specifically provided for in this Constitution shall be considered by the Committee of Management and, where necessary, referred to Senior Management for a final decision.",
  "The decision of Senior Management shall be final in matters relating to the interpretation, administration, governance and operation of the Welfare Society.",
  "Nothing in this Constitution shall be interpreted as creating an entitlement beyond the benefits and facilities approved by the Company.",
];
