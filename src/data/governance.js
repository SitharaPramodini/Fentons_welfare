/* ===========================================================================
 * GOVERNANCE — the Committee of Management, its meetings, the duties of the
 * office bearers, financial management, conduct and vacancies.
 *
 * Clauses 4, 5, 6, 9, 10, 11 and 12 of the Reformed Constitution (v1.0).
 * No names appear here: the Constitution does not name office bearers, and
 * the Committee is appointed by Senior Management rather than elected.
 * =========================================================================== */

/* --- Clause 4 — Committee of Management ---------------------------------- */

export const committee = {
  remit:
    "The Committee of Management shall be responsible for administering the Society, implementing approved welfare activities, considering member requests, monitoring the Welfare Fund and ensuring that the Society operates in accordance with this Constitution and Company requirements.",

  /* Clause 4.1 — Composition and appointment */
  composition: [
    "The Committee of Management shall be appointed by Senior Management of the Company.",
    "Senior Management shall determine the composition and number of members of the Committee of Management.",
    "The Committee of Management may include the following office bearers, as determined by Senior Management: Vice President, Vice Secretary, Vice Treasurer and Committee Members.",
    "The General Secretary may be appointed from the HR function or another appropriate Company representative nominated by Senior Management.",
    "The Treasurer shall be an employee nominated by Senior Management from the Finance function or another suitably authorised employee.",
    "Senior Management may appoint, replace, remove, suspend or reconstitute any member of the Committee of Management whenever considered necessary.",
    "Any vacancy arising during the term of the Committee shall be filled by Senior Management.",
  ],

  /* Clause 4.2 — Term of office */
  term: [
    "The term of office of the Committee of Management shall be two (2) years from the date of its first meeting, unless otherwise determined by Senior Management.",
    "Committee members may be reappointed by Senior Management for a further term.",
    "An employee who leaves the service of Fentons shall cease to hold office as a Committee member with effect from the date of cessation of employment.",
  ],
};

/* --- Clause 5 — Functions and responsibilities --------------------------- */

export const committeeFunctions = [
  {
    icon: "ScrollText",
    text: "Administer the Society in accordance with this Constitution and approved Company procedures.",
  },
  {
    icon: "ClipboardCheck",
    text: "Review and process applications for welfare benefits, assistance and loans.",
  },
  { icon: "PartyPopper", text: "Plan and implement approved welfare activities and programmes." },
  {
    icon: "Wallet",
    text: "Monitor the Welfare Fund, member contributions, benefit payments and loan recoveries.",
  },
  { icon: "Banknote", text: "Prepare and review welfare budgets and expenditure." },
  {
    icon: "FileText",
    text: "Maintain proper records of members, benefits, meetings, financial transactions and other Society matters.",
  },
  {
    icon: "Megaphone",
    text: "Consider suggestions and welfare-related requests submitted by employees.",
  },
  { icon: "PenLine", text: "Recommend improvements to the welfare scheme to Senior Management." },
  {
    icon: "ShieldCheck",
    text: "Ensure that Society funds are used only for approved welfare purposes.",
  },
];

/* --- Clause 6 — Meetings of the Committee of Management ------------------ */

export const meetings = {
  /* The three facts members most often need, pulled out of the clause. */
  facts: [
    { icon: "CalendarCheck", label: "When", value: "Third week of every month" },
    { icon: "Clock", label: "Time", value: "3.00 p.m." },
    { icon: "Users", label: "Quorum", value: "50% of appointed members" },
  ],

  rules: [
    "A meeting of the Committee of Management shall be held on a designated day during the third week of every month at 3.00 p.m.",
    "The Secretary shall arrange the meeting and notify Committee members of the date, time and venue.",
    "The agenda shall be prepared by the Secretary and shall include welfare matters, member requests, financial matters, pending actions and other matters requiring consideration.",
    "Committee members shall make every reasonable effort to attend all scheduled meetings. Where a member is unable to attend due to unavoidable circumstances, prior notice shall be given to the Secretary.",
    "The President / Chairperson shall preside over the meeting. In the absence of the President / Chairperson, the Vice President / Vice Chairperson shall preside.",
    "The quorum for a Committee of Management meeting shall be fifty percent (50%) of the total appointed Committee members.",
    "Where a decision is required to be taken by voting, the decision shall be made by a simple majority of the members present and entitled to vote.",
    "In the event of an equality of votes, the President / Chairperson shall have an additional casting vote.",
    "Any matter requiring the approval of Senior Management shall be referred to Senior Management before implementation.",
  ],

  /* Clause 6.1 — Minutes of meetings */
  minutes: [
    "The General Secretary / Secretary shall be responsible for recording and maintaining the minutes of every Committee of Management meeting.",
    "Minutes shall record the date, time and venue of the meeting, members present, apologies, matters discussed, decisions taken, action points and any other relevant matters.",
    "The minutes shall be prepared and circulated to Committee members within seven (7) days after the meeting.",
    "The minutes of the previous meeting shall be presented at the subsequent Committee of Management meeting for confirmation.",
    "Once confirmed, the minutes shall be signed by the President / Chairperson and the Secretary and retained as the official record of the Society.",
    "Minutes and related records shall be maintained securely and made available to Senior Management or authorised Company representatives when required.",
  ],
};

/* --- Clause 10 — Duties of office bearers -------------------------------- */

export const officeBearers = [
  {
    role: "President / Chairperson",
    icon: "Landmark",
    accent: "brand",
    duties: [
      "Provide overall guidance and direction to the Committee of Management.",
      "Preside over Committee meetings.",
      "Ensure that Committee decisions are implemented in accordance with this Constitution.",
      "Refer matters requiring Senior Management approval to the appropriate authority.",
    ],
  },
  {
    role: "General Secretary / Secretary",
    icon: "FileText",
    accent: "sky",
    duties: [
      "Convene meetings of the Committee of Management.",
      "Prepare agendas and maintain accurate minutes of meetings.",
      "Maintain membership records, correspondence and Society documents.",
      "Coordinate welfare requests and Committee activities.",
      "Circulate minutes and relevant communications within the required time period.",
    ],
  },
  {
    role: "Treasurer",
    icon: "Wallet",
    accent: "emerald",
    duties: [
      "Maintain accurate accounts of all income and expenditure.",
      "Maintain records of member contributions, benefit payments and loan transactions.",
      "Present financial statements and relevant financial information to the Committee.",
      "Ensure that payments are made only after obtaining the required approvals and supporting documents.",
    ],
  },
];

/* --- Clause 9 — Financial management and accounts ------------------------ */

export const financialManagement = {
  /* The financial year is the one hard date the Constitution fixes. */
  financialYear: "1 April to 31 March",

  rules: [
    "The Treasurer shall maintain accurate records of all income, expenditure, contributions, benefit payments, loans and recoveries of the Society.",
    "The Treasurer shall present the financial position of the Society to the Committee of Management at the monthly welfare meeting.",
    "All withdrawals and payments from the Welfare Fund shall be made only with the required authorised signatories and approvals.",
    "Supporting documents shall be maintained for all payments and transactions.",
    "The Society’s accounts shall be subject to periodic review and/or audit as required by the Company.",
    "The financial year of the Society shall be from 1 April to 31 March, unless otherwise determined by the Company.",
  ],
};

/* --- Clause 11 — Conduct and discipline ---------------------------------- */

export const conduct = [
  "All Committee members shall act honestly, responsibly and in the best interests of the Society and the Company.",
  "A Committee member shall not misuse the position or Society funds for personal benefit.",
  "Any conflict of interest shall be disclosed before the relevant matter is considered by the Committee.",
  "A Committee member who engages in misconduct, dishonesty, abuse of position, misuse of Society funds or conduct likely to bring the Society or Company into disrepute may be removed from the Committee by Senior Management.",
  "Senior Management may take appropriate Company disciplinary action where the conduct also constitutes a breach of Company rules or policies.",
];

/* --- Clause 12 — Vacancies and replacement ------------------------------- */

export const vacancies = [
  "If a vacancy occurs in the Committee of Management due to resignation, cessation of employment, removal, incapacity or any other reason, Senior Management may appoint a replacement.",
  "The person appointed shall hold office for the balance of the relevant term or for such period as determined by Senior Management.",
];
