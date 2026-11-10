/**
 * The letters the Society sends.
 *
 * Four of them: a membership application and a loan application reaching the
 * office, and the two answers a loan can get.
 *
 * On the declining letter — it never uses the word "rejected", and it does
 * not leave somebody feeling judged for having asked. People apply to a
 * welfare fund when something has gone wrong in their lives. The letter says
 * plainly that the answer is no for now, explains that the Fund is shared and
 * limited rather than that the person was found wanting, and asks them to
 * come back.
 */
import { SITE_URL, SOCIETY_INBOX, sendMail } from "./mailer.js";
import { signAction } from "./actionToken.js";

const money = (value) =>
  `Rs. ${Number(value ?? 0).toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

const firstName = (full) =>
  String(full ?? "")
    .trim()
    .split(/\s+/)[0] || "there";

const SIGN_OFF = `
Welfare Society of Fentons
No. 200, Deans Road, Colombo 10`;

/* --- To the office -------------------------------------------------------- */

/** A membership application has been submitted. */
export function notifyMembershipSubmitted(member) {
  const lines = [
    `A new membership application has come in.`,
    ``,
    `  Reference      ${member.reference_no}`,
    `  Name           ${member.full_name}`,
    `  EPF No         ${member.epf_number}`,
    `  Company        ${member.company}`,
    `  Division       ${member.division}`,
    `  Category       ${member.employment_category}`,
    `  Effective from ${member.membership_effective_from}`,
    `  Documents      ${member.documents?.length ? member.documents.map((d) => d.doc_type.replace(/_/g, " ")).join(", ") : "none attached"}`,
    ``,
    `The applicant has read the Constitution and agreed to abide by it.`,
    ``,
    `Open it here: ${SITE_URL}/#/admin`,
    SIGN_OFF,
  ];

  return sendMail({
    to: SOCIETY_INBOX,
    subject: `Membership application - ${member.full_name} (${member.reference_no})`,
    text: lines.join("\n"),
  });
}

/**
 * A loan application has been submitted. Carries the printable form and the
 * two decision links.
 */
export function notifyLoanSubmitted(loan, pdf) {
  const guarantor = loan.guarantors?.[0];
  const approve = `${SITE_URL}/#/decision/${signAction({ loanId: loan.id, action: "approve" })}`;
  const decline = `${SITE_URL}/#/decision/${signAction({ loanId: loan.id, action: "decline" })}`;

  const lines = [
    `A welfare loan application is waiting for a decision.`,
    ``,
    `  Reference   ${loan.reference_no}`,
    `  Applicant   ${loan.title}. ${loan.full_name}`,
    `  EPF No      ${loan.epf_number}`,
    `  Division    ${loan.division}`,
    `  Designation ${loan.designation}`,
    `  Service     ${loan.years_of_service ?? "not stated"} years`,
    `  Amount      ${money(loan.loan_amount)}`,
    `  Purpose     ${loan.loan_purpose}`,
    `  Guarantor   ${guarantor ? `${guarantor.full_name} (${guarantor.telephone})` : "not required - five or more years of service"}`,
    ``,
    `The completed application is attached.`,
    ``,
    `Decide from here:`,
    ``,
    `  Approve        ${approve}`,
    `  Not this time  ${decline}`,
    ``,
    `Either link opens a confirmation page - nothing is decided by clicking alone.`,
    `You can also decide from the Society's site: ${SITE_URL}/#/admin`,
    SIGN_OFF,
  ];

  return sendMail({
    to: SOCIETY_INBOX,
    subject: `Loan application - ${loan.full_name}, ${money(loan.loan_amount)} (${loan.reference_no})`,
    text: lines.join("\n"),
    attachments: pdf
      ? [{ filename: `${loan.reference_no}-loan-application.pdf`, content: pdf }]
      : [],
  });
}

/* --- To the member -------------------------------------------------------- */

/** Acknowledges a loan application and sends the member their own copy. */
export function acknowledgeLoan(loan, pdf) {
  if (!loan.email) return Promise.resolve({ sent: false, reason: "no-email" });

  const lines = [
    `Dear ${firstName(loan.full_name)},`,
    ``,
    `We have received your application for a welfare loan of ${money(loan.loan_amount)}.`,
    `Your reference is ${loan.reference_no}.`,
    ``,
    `Your completed application is attached. You can also download it at any`,
    `time from your account on the Society's site.`,
    ``,
    `The Exco will consider it at the monthly meeting and we will write to you`,
    `as soon as there is a decision.`,
    ``,
    `With kind regards,`,
    SIGN_OFF,
  ];

  return sendMail({
    to: loan.email,
    subject: `We have your loan application - ${loan.reference_no}`,
    text: lines.join("\n"),
    replyTo: SOCIETY_INBOX,
    attachments: pdf
      ? [{ filename: `${loan.reference_no}-loan-application.pdf`, content: pdf }]
      : [],
  });
}

/** The loan was approved. */
export function notifyLoanApproved(loan, pdf) {
  if (!loan.email) return Promise.resolve({ sent: false, reason: "no-email" });

  const lines = [
    `Dear ${firstName(loan.full_name)},`,
    ``,
    `We are glad to tell you that your application for a welfare loan of`,
    `${money(loan.loan_amount)} has been approved.`,
    ``,
    `There is one step left, and it is on paper.`,
    ``,
    `  1. Print the attached application - it is already filled in with the`,
    `     details you gave us.`,
    `  2. Sign it where it says "Signature of Applicant". There are two such`,
    `     places: the declaration in section 5, and the payroll deduction in`,
    `     section 7.`,
    loan.guarantors?.[0]
      ? `  3. Ask ${loan.guarantors[0].full_name} to sign as your guarantor.`
      : `  3. No guarantor is needed, as you have five or more years of service.`,
    `  4. Hand the signed form to your divisional representative or to the HR`,
    `     Division. They will complete section 6 and arrange the release.`,
    ``,
    `Approved loans are released within two (02) weeks once the signed form and`,
    `the required approvals are in.`,
    ``,
    `Repayment is over ten (10) months from the date of release, deducted from`,
    `your salary as you agreed on the form.`,
    ``,
    `If anything here is unclear, just reply to this message.`,
    ``,
    `With warm regards,`,
    SIGN_OFF,
  ];

  return sendMail({
    to: loan.email,
    subject: `Your welfare loan has been approved - ${loan.reference_no}`,
    text: lines.filter(Boolean).join("\n"),
    replyTo: SOCIETY_INBOX,
    attachments: pdf
      ? [{ filename: `${loan.reference_no}-loan-application.pdf`, content: pdf }]
      : [],
  });
}

/**
 * The loan was not approved.
 *
 * Deliberately gentle, and the word "rejected" appears nowhere. Somebody who
 * asked a welfare fund for help should not be made to feel refused as a
 * person — the Fund is shared and finite, and that is what the letter says.
 */
export function notifyLoanDeclined(loan) {
  if (!loan.email) return Promise.resolve({ sent: false, reason: "no-email" });

  const lines = [
    `Dear ${firstName(loan.full_name)},`,
    ``,
    `Thank you for coming to the Society, and for trusting us with your`,
    `request.`,
    ``,
    `We have looked at your application carefully. On this occasion we are not`,
    `able to release the loan, and we are sorry to be writing that to you.`,
    ``,
    `Please do not read it as a judgement on you or on your reasons for asking.`,
    `The Welfare Fund belongs to all our members together, and what it can`,
    `release in any one month is limited - only two members from each Division`,
    `can be helped at a time. It simply means we could not reach everyone who`,
    `asked this month.`,
    ``,
    `You are very welcome to apply again. Many members are helped on a later`,
    `application, and yours will be looked at afresh.`,
    ``,
    loan.exco_remarks ? `A note from the Committee: ${loan.exco_remarks}` : null,
    loan.exco_remarks ? `` : null,
    `If things are difficult at the moment, please speak to the Secretary.`,
    `A loan is not the only help the Society can offer, and we would rather`,
    `hear from you than not.`,
    ``,
    `With warm regards, and our thanks for being a member,`,
    SIGN_OFF,
  ];

  return sendMail({
    to: loan.email,
    subject: `About your loan application - ${loan.reference_no}`,
    text: lines.filter((l) => l !== null).join("\n"),
    replyTo: SOCIETY_INBOX,
  });
}
