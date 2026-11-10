/**
 * Builds the printable loan application, WFR/LOAN/2013.
 *
 * Sections 1 to 4 and the amount in section 7 are filled in from what the
 * member submitted. Everything that has to be signed or decided on paper is
 * left blank:
 *
 *   - Signature of Guarantor, and its date
 *   - Signature of Applicant, and its date (sections 5 and 7)
 *   - all of section 6, FOR OFFICE USE ONLY
 *
 * The member prints this, collects the signatures, and hands it in.
 */
import PDFDocument from "pdfkit";

const PAGE = { margin: 54 };
const INK = "#1b2b22";
const MUTED = "#6b7b72";
const RULE = "#b9c5bd";

/**
 * Renders the document to a Buffer.
 *
 * `compress: false` turns off stream compression, which makes the text
 * readable straight out of the file - useful when checking the output.
 */
export function buildLoanPdf(loan, { compress = true } = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PAGE.margin,
      bufferPages: true,
      compress,
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try {
      draw(doc, loan);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* --- Drawing helpers ------------------------------------------------------ */

const right = (doc) => doc.page.width - doc.page.margins.right;
const width = (doc) => right(doc) - doc.page.margins.left;

function sectionHeading(doc, number, title) {
  doc.moveDown(0.9);
  const y = doc.y;
  doc.rect(doc.page.margins.left, y - 3, width(doc), 18).fill("#eef2ef");
  doc
    .fillColor(INK)
    .font("Helvetica-BoldOblique")
    .fontSize(9.5)
    .text(`${number})  ${title}`, doc.page.margins.left + 6, y + 1);
  doc.moveDown(0.8);
}

/**
 * One labelled line. `value` is written above a rule; a blank value leaves the
 * rule empty to be filled in by hand.
 */
function line(doc, label, value, { x, labelWidth = 135, lineWidth, italic = false } = {}) {
  const left = x ?? doc.page.margins.left + 6;
  const y = doc.y;
  const ruleStart = left + labelWidth;
  const ruleEnd = ruleStart + (lineWidth ?? right(doc) - ruleStart - 6);

  doc
    .font(italic ? "Helvetica-Oblique" : "Helvetica")
    .fontSize(9)
    .fillColor(INK)
    .text(label, left, y, { width: labelWidth - 6, lineBreak: false });

  if (value) {
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(INK)
      .text(String(value), ruleStart + 2, y, { width: ruleEnd - ruleStart - 4, lineBreak: false });
  }

  doc
    .moveTo(ruleStart, y + 12)
    .lineTo(ruleEnd, y + 12)
    .lineWidth(0.6)
    .stroke(RULE);

  doc.y = y + 21;
  doc.x = doc.page.margins.left;
}

/** Two labelled lines side by side. */
function pair(doc, a, b) {
  const y = doc.y;
  const half = width(doc) / 2;
  line(doc, a.label, a.value, {
    x: doc.page.margins.left + 6,
    labelWidth: 96,
    lineWidth: half - 118,
  });
  const after = doc.y;

  doc.y = y;
  line(doc, b.label, b.value, {
    x: doc.page.margins.left + half + 6,
    labelWidth: 96,
    lineWidth: half - 118,
  });
  doc.y = Math.max(after, doc.y);
  doc.x = doc.page.margins.left;
}

/** A signature block: a rule, then its caption. */
function signature(doc, leftLabel, rightLabel = "Date") {
  doc.moveDown(1.6);
  const y = doc.y;
  const left = doc.page.margins.left + 6;
  const dateX = right(doc) - 150;

  doc
    .moveTo(left, y)
    .lineTo(left + 170, y)
    .lineWidth(0.8)
    .stroke(RULE);
  doc
    .moveTo(dateX, y)
    .lineTo(dateX + 120, y)
    .lineWidth(0.8)
    .stroke(RULE);

  doc.font("Helvetica").fontSize(8.5).fillColor(MUTED);
  doc.text(leftLabel, left, y + 4, { width: 170, lineBreak: false });
  doc.text(rightLabel, dateX, y + 4, { width: 120, lineBreak: false });

  doc.y = y + 20;
  doc.x = doc.page.margins.left;
}

/** An empty tick box with its caption, for section 6. */
function checkbox(doc, label, x, y) {
  doc.rect(x, y, 10, 10).lineWidth(0.8).stroke(RULE);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(INK)
    .text(label, x + 16, y + 1, { lineBreak: false });
}

const money = (value) =>
  value === null || value === undefined || value === ""
    ? ""
    : Number(value).toLocaleString("en-LK", { minimumFractionDigits: 2 });

const date = (value) => (value ? String(value).slice(0, 10) : "");

/* --- The document --------------------------------------------------------- */

function draw(doc, loan) {
  const g = loan.guarantors?.[0] ?? {};

  /* Running head */
  doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(MUTED);
  doc.text("Welfare Society of Fentons", doc.page.margins.left, 32, { lineBreak: false });
  doc.text("Loan Application", 0, 32, { align: "right", width: right(doc) });
  doc.font("Helvetica").fontSize(8).fillColor(MUTED);
  doc.text("WFR/LOAN/2013", doc.page.margins.left, 46, { lineBreak: false });
  if (loan.reference_no) {
    doc.text(`Reference  ${loan.reference_no}`, 0, 46, { align: "right", width: right(doc) });
  }

  doc.y = 72;
  doc.font("Helvetica-Bold").fontSize(14).fillColor(INK);
  doc.text("WELFARE SOCIETY OF FENTONS", { align: "center" });
  doc.text("LOAN APPLICATION", { align: "center" });
  doc.moveDown(0.4);

  /* 1) Personal details */
  sectionHeading(doc, 1, "PERSONAL DETAILS");
  line(
    doc,
    "Full Name (Mr. / Mrs. / Miss):",
    [loan.title, loan.full_name].filter(Boolean).join(". "),
  );
  line(doc, "Date of Birth:", date(loan.date_of_birth));
  line(doc, `${loan.identity_type || "NIC"}/DL/Passport No:`, loan.identity_number);
  line(doc, "Telephone:", loan.telephone);

  /* 2) Employment details */
  sectionHeading(doc, 2, "EMPLOYMENT DETAILS");
  pair(
    doc,
    { label: "Date Joined:", value: date(loan.date_joined) },
    { label: "EPF No:", value: loan.epf_number },
  );
  line(doc, "Designation:", loan.designation);
  pair(
    doc,
    { label: "No of Years of Service:", value: loan.years_of_service ?? "" },
    { label: "Division:", value: loan.division },
  );
  line(doc, "Date Joined to Welfare Society:", date(loan.date_joined_society));

  /* 3) Facility required */
  sectionHeading(doc, 3, "FACILITY REQUIRED");
  line(doc, "Purpose of Loan:", loan.loan_purpose);
  line(doc, "Loan Amount (Rs.)", money(loan.loan_amount));

  /* 4) Security */
  sectionHeading(doc, 4, "SECURITY");
  doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK);
  doc.text("GUARANTOR", doc.page.margins.left + 6, doc.y);
  doc.moveDown(0.5);

  if (g.full_name) {
    line(doc, "Full Name (Mr. / Mrs. / Miss):", g.full_name);
    pair(
      doc,
      { label: "Date Joined:", value: date(g.date_joined) },
      { label: "Division:", value: g.division },
    );
    pair(
      doc,
      { label: "Designation:", value: g.designation },
      { label: "EPF No:", value: g.epf_number },
    );
    line(doc, `${g.identity_type || "NIC"}/DL/Passport No:`, g.identity_number);
    line(doc, "Telephone:", g.telephone);
  } else {
    /* No guarantor was required: five or more years of service. */
    doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(MUTED);
    doc.text(
      "No guarantor required - the applicant has completed five (5) or more years of service (clause 8.2).",
      doc.page.margins.left + 6,
      doc.y,
      { width: width(doc) - 12 },
    );
    doc.moveDown(0.6);
    doc.x = doc.page.margins.left;
  }

  doc.moveDown(0.4);
  doc.font("Helvetica").fontSize(8.5).fillColor(INK);
  doc.text(
    "I hereby declare that the above information given by me is true and correct, and that I am prepared to guaranty the facility required by the above named applicant",
    doc.page.margins.left + 6,
    doc.y,
    { width: width(doc) - 12 },
  );
  signature(doc, "Signature of Guarantor");

  /* 5) Declaration */
  sectionHeading(doc, 5, "DECLARATION");
  doc.font("Helvetica").fontSize(8.5).fillColor(INK);
  doc.text(
    "I hereby declare that the above information given by me/us is/are true and correct.",
    doc.page.margins.left + 6,
    doc.y,
    { width: width(doc) - 12 },
  );
  signature(doc, "Signature of Applicant");

  /* --- Page two: the office's half ------------------------------------- */
  doc.addPage();
  doc.font("Helvetica-Oblique").fontSize(8.5).fillColor(MUTED);
  doc.text("Welfare Society of Fentons", doc.page.margins.left, 32, { lineBreak: false });
  doc.text("Loan Application", 0, 32, { align: "right", width: right(doc) });
  doc.y = 60;

  /* 6) For office use only - entirely blank, completed on paper. */
  sectionHeading(doc, 6, "FOR OFFICE USE ONLY");

  let y = doc.y + 2;
  doc.font("Helvetica").fontSize(9).fillColor(INK);
  doc.text("Contribution towards Fund Raising Project:", doc.page.margins.left + 6, y, {
    lineBreak: false,
  });
  checkbox(doc, "Yes", doc.page.margins.left + 260, y - 1);
  checkbox(doc, "No", doc.page.margins.left + 340, y - 1);

  y += 26;
  doc.text("Exco Approval:", doc.page.margins.left + 6, y, { lineBreak: false });
  checkbox(doc, "Approved", doc.page.margins.left + 260, y - 1);
  checkbox(doc, "Not Approved", doc.page.margins.left + 340, y - 1);

  doc.y = y + 26;
  doc.x = doc.page.margins.left;
  line(doc, "Loan Released on:", "", { labelWidth: 254 });
  line(doc, "Amount Released Rs:", "", { labelWidth: 254 });

  signature(doc, "Authorized Signatory");
  signature(doc, "Authorized Signatory");

  /* 7) Payroll deduction */
  sectionHeading(doc, 7, "PAYROLL DEDUCTION");
  doc.font("Helvetica").fontSize(9).fillColor(INK);

  const amount = money(loan.payroll_deduction_amount || loan.loan_amount);
  doc.text(
    `I  ${loan.full_name || "________________________________"},  hereby agree to the payroll deductions from my monthly salary until my welfare loan through Welfare Society of Fentons in the amount of Rs. ${amount || "_______________________"} has been paid off.`,
    doc.page.margins.left + 6,
    doc.y,
    { width: width(doc) - 12, lineGap: 3 },
  );

  signature(doc, "Signature of Applicant");

  /* Footer on both pages */
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.font("Helvetica").fontSize(8).fillColor(MUTED);
    doc.text(String(i + 1), 0, doc.page.height - 40, { align: "center", width: doc.page.width });
  }
}
