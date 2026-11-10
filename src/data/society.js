/* ===========================================================================
 * THE SOCIETY - identity, objectives, membership and contributions.
 *
 * SOURCE OF TRUTH
 * ---------------
 * Every line here is taken from the Welfare Society of Fentons Reformed
 * Constitution, Draft V1 of 21.10.2026. Nothing is illustrative or invented.
 *
 * The site deliberately carries only what a member needs: what the Society
 * is for, who may join, what it costs, what it pays out and how to apply.
 * The Constitution's internal governance detail - meeting procedure, minutes,
 * office-bearer duties, conduct, vacancies, amendment procedure - is not
 * reproduced here.
 * =========================================================================== */

export const society = {
  /* Clause 1 - Name and registered office */
  name: "Welfare Society of Fentons",
  shortName: "Welfare Society",

  /* Clause 2.1 - "Company" means Hayleys Fentons Limited. */
  parentCompany: "Hayleys Fentons Limited",
  registeredOffice: "No. 200, Deans Road, Colombo 10",

  /* Clause 3.1 - used as the one-line summary of the Society. */
  intro: "To promote the welfare and well-being of employees of Hayleys Fentons Limited.",

  /* Clause 6, opening paragraph. */
  governedBy:
    "The affairs and administration of the Welfare Society shall be managed by a Committee of Management appointed by the Senior Management of the Company.",
};

/* --- Clause 3 - Objectives -----------------------------------------------
 * The five that describe what the Society does for a member. The first is the
 * Society's whole purpose and leads the section; the rest support it. The remaining
 * objectives (establishing the Fund, receiving donations, holding property,
 * and doing all lawful acts conducive to the above) are powers rather than
 * member-facing aims, and are not listed on the site.
 * ----------------------------------------------------------------------- */

export const objectives = [
  {
    icon: "HeartHandshake",
    title: "Welfare and well-being",
    text: "To promote the welfare and well-being of employees of Hayleys Fentons Limited.",
  },
  {
    icon: "HandCoins",
    title: "Financial and welfare assistance",
    text: "To provide financial and other welfare assistance to members in accordance with the approved benefits and facilities of the Society.",
  },
  {
    icon: "Ambulance",
    title: "Assistance in hardship",
    text: "To provide financial or other assistance, where practicable, in circumstances of sickness, accident, bereavement, marriage, childbirth, natural disaster, or other genuine hardship.",
  },
  {
    icon: "Users",
    title: "Participation and interaction",
    text: "To encourage employee participation, social interaction and welfare activities.",
  },
  {
    icon: "ShieldCheck",
    title: "Responsible administration",
    text: "To maintain and administer the Society’s funds in a responsible, transparent and controlled manner.",
  },
];

/* --- Clause 4 - Membership and eligibility ------------------------------- */

export const membership = {
  /* Clause 4.1 - Eligibility */
  openTo: [
    "Permanent employees",
    "Fixed-term employees",
    "Contract employees",
    "Probationary employees",
    "Part-time employees",
  ],

  eligibility: [
    "Membership is open to all permanent, fixed-term, contract, probationary and part-time employees of the Company, subject to the applicable membership requirements.",
    "Eligible employees shall complete the prescribed membership documentation where required.",
    "The Committee may admit an eligible applicant as a Member in accordance with the approved membership procedure in force at the time, and shall not unreasonably refuse membership.",
  ],

  /* Clause 4.4 - Entrance fee and subscription */
  fees: {
    entrance: 250,
    monthly: 200,
    note: "These amounts may be varied by resolution passed at a General Meeting.",
  },

  /* Clause 4.5 - Cessation of membership */
  cessation: [
    {
      icon: "PenLine",
      title: "Resignation",
      text: "Membership ends when you resign from the Society in writing.",
    },
    {
      icon: "LogOut",
      title: "Leaving the Company",
      text: "Membership ends on the date your employment with the Company ceases.",
    },
    {
      icon: "Wallet",
      title: "Unpaid subscriptions",
      text: "Membership ends after three consecutive months of non-payment, and only once a written reminder has been sent.",
    },
    {
      icon: "Scale",
      title: "Expulsion",
      text: "Only by a resolution of at least two-thirds of the Committee, after written notice of the alleged misconduct and a fair chance to be heard. You may appeal to the next General Meeting.",
    },
    {
      icon: "Flower2",
      title: "Death",
      text: "Membership ceases, but the applicable death donation benefit may still be paid to the next of kin as per Company records.",
    },
  ],

  /* Clause 4.6 - Former employees */
  formerEmployees:
    "The Committee may, at its discretion, permit a former employee who has ceased membership to participate in specified welfare benefits or activities on terms determined by the Committee.",

  /* Clause 5.1 - Rights of members */
  rights: [
    "Attend and vote at General Meetings, and receive notice of them.",
    "Elect and be elected to the Committee, subject to the eligibility requirements.",
    "Participate in the activities and benefits of the Society.",
    "Inspect the Society’s register of members, minutes and audited accounts during reasonable business hours.",
  ],

  /* Clause 5.2 - Obligations of members */
  obligations: [
    "Comply with the Constitution and the lawful decisions of the Society.",
    "Pay subscriptions and other dues promptly.",
    "Act in good faith and avoid conduct prejudicial to the Society or the Company.",
    "Provide accurate information in applications and claims.",
  ],
};

/* --- Clause 10 - Contributions to the Welfare Fund ------------------------ */

export const contributions = [
  {
    icon: "Wallet",
    text: "Members contribute to the Welfare Fund through the approved monthly subscription determined by the Company.",
  },
  {
    icon: "RefreshCw",
    text: "The applicable subscription amount may be reviewed and revised with the approval of the Company.",
  },
  {
    icon: "CircleAlert",
    text: "Contributions are not refundable on cessation of employment, retirement, death or resignation, unless specifically approved by the Company.",
  },
  {
    icon: "ShieldCheck",
    text: "All contributions shall be used solely for the approved purposes of the Society.",
  },
];
