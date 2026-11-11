/* ===========================================================================
 * GOVERNANCE - who runs the Society.
 *
 * Clauses 6, 7, 8 and 13 of the Reformed Constitution (Draft V1, 21.10.2026),
 * reduced to what a member needs to know: who the Committee is, what it does
 * for them, and when it meets.
 *
 * The Constitution's internal procedure - meeting conduct, minutes, financial
 * controls, discipline, vacancies - is not reproduced on the site.
 *
 * No names appear here: the Constitution names no office bearers.
 * =========================================================================== */

/* --- Clause 6 - Committee of Management ---------------------------------- */

export const committee = {
  remit:
    "The Committee of Management is responsible for administering the Society, implementing approved welfare activities, considering member requests, monitoring the Welfare Fund and ensuring that the Society operates in accordance with this Constitution and Company requirements.",

  /* Clause 6.1 - Composition and appointment, and 6.2 - Term of office */
  facts: [
    {
      icon: "Landmark",
      label: "Appointed by",
      value: "Senior Management of the Company",
    },
    {
      icon: "CalendarClock",
      label: "Term of office",
      value: "Two (2) years, renewable",
    },
    {
      icon: "Users",
      label: "Composition",
      value: "Determined by Senior Management",
    },
  ],

  composition: [
    "Senior Management appoints the Committee and determines its composition and size.",
    "The General Secretary may be appointed from the HR function, and the Treasurer from the Finance function.",
    "Senior Management may appoint, replace, remove or reconstitute any Committee member, and fills any vacancy arising during a term.",
  ],
};

/* --- Clause 7 - What the Committee does for members ----------------------
 * The nine functions in the Constitution, reduced to the five that a member
 * would actually come to the Committee for.
 * ----------------------------------------------------------------------- */

export const committeeFunctions = [
  {
    icon: "ClipboardCheck",
    text: "Review and process applications for welfare benefits, assistance and loans.",
  },
  { icon: "PartyPopper", text: "Plan and implement approved welfare activities and programmes." },
  {
    icon: "Megaphone",
    text: "Consider suggestions and welfare-related requests submitted by employees.",
  },
  {
    icon: "Wallet",
    text: "Monitor the Welfare Fund, member contributions, benefit payments and loan recoveries.",
  },
  {
    icon: "ShieldCheck",
    text: "Ensure that Society funds are used only for approved welfare purposes.",
  },
];

/* --- Clause 8 - Meetings -------------------------------------------------
 * Only the three facts a member needs in order to know when their request
 * will be looked at. The procedural rules are not reproduced.
 * ----------------------------------------------------------------------- */

export const meetings = {
  facts: [
    { icon: "CalendarCheck", label: "When", value: "Third week of every month" },
    { icon: "Clock", label: "Time", value: "3.00 p.m." },
    { icon: "Users", label: "Quorum", value: "50% of appointed members" },
  ],

  note: "Member requests, welfare matters and financial matters are taken at the monthly meeting. Anything requiring Senior Management approval is referred on before it is implemented.",
};

/* --- Clause 13 - Office bearers -------------------------------------------
 * The three roles a member may need to approach, with a one-line summary of
 * each. The full schedules of duties are not reproduced.
 *
 * NAMES AND PHOTOGRAPHS
 * ---------------------
 * The Constitution names nobody - the Committee is appointed by Senior
 * Management and changes - so names live here instead, and only here.
 *
 * To name an office bearer, set `name` below. For a photograph, drop a file
 * into  src/assets/office-bearers/  named after the role:
 *
 *     president.jpg       secretary.jpg       treasurer.jpg
 *
 * (.jpg .jpeg .png .webp all work.) Nothing else needs editing. A bearer with
 * a name but no photograph shows their initials; one with no name at all
 * shows the role on its own, exactly as before.
 * ----------------------------------------------------------------------- */

const bearerPhotoFiles = import.meta.glob(
  "../assets/office-bearers/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true, import: "default" },
);

const bearerPhotos = Object.fromEntries(
  Object.entries(bearerPhotoFiles).map(([path, src]) => [
    path
      .split("/")
      .pop()
      .replace(/\.[^.]+$/, "")
      .toLowerCase(),
    src,
  ]),
);

const bearers = [
  {
    key: "president",
    role: "President / Chairperson",
    name: "Tharindu Chanaka",
    icon: "Landmark",
    accent: "brand",
    summary: "Gives the Committee overall direction and presides over its meetings.",
  },
  {
    key: "secretary",
    role: "General Secretary / Secretary",
    name: null,
    icon: "FileText",
    accent: "sky",
    summary: "Convenes meetings and keeps membership records, correspondence and minutes.",
  },
  {
    key: "treasurer",
    role: "Treasurer",
    name: null,
    icon: "Wallet",
    accent: "emerald",
    summary:
      "Keeps the accounts, records contributions, benefit payments and loans, and reports to the Committee.",
  },
];

export const officeBearers = bearers.map((bearer) => ({
  ...bearer,
  photo: bearerPhotos[bearer.key] ?? null,
}));

/** The President, for the places that single them out. */
export const president = officeBearers.find((b) => b.key === "president");

/* Clause 12.6 - the one hard date the Constitution fixes. */
export const financialYear = "1 April to 31 March";
