/**
 * Outgoing e-mail.
 *
 * SMTP is configured through `.env`. When it is not configured - which is the
 * case until the Company's mail details are filled in - nothing is lost and
 * nothing throws: each message is written to `backend/outbox` as a readable
 * `.eml` file and logged. The whole application flow can then be exercised,
 * and the files show exactly what would have been sent.
 *
 * A failure to send never fails the member's submission. Their application is
 * already saved by the time we get here; refusing it because a mail server
 * was briefly unreachable would be the wrong trade.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const here = path.dirname(fileURLToPath(import.meta.url));
const OUTBOX = path.resolve(process.env.MAIL_OUTBOX || path.join(here, "..", "outbox"));

/** Where membership and loan applications are sent. */
export const SOCIETY_INBOX = process.env.SOCIETY_INBOX || "sitharapramodini@gmail.com";

export const MAIL_FROM =
  process.env.MAIL_FROM || "Welfare Society of Fentons <no-reply@hayleysfentons.com>";

/** The site's own address, used to build links inside e-mails. */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:5173").replace(/\/$/, "");

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT);

const transport = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    })
  : null;

export function mailIsConfigured() {
  return smtpConfigured;
}

/** Writes a message to the outbox folder so it can be read and checked. */
async function writeToOutbox(message) {
  await fs.mkdir(OUTBOX, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const slug = String(message.subject || "message")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 60);
  const file = path.join(OUTBOX, `${stamp}-${slug}.eml`);

  const body = [
    `To: ${message.to}`,
    `From: ${MAIL_FROM}`,
    message.replyTo ? `Reply-To: ${message.replyTo}` : null,
    `Subject: ${message.subject}`,
    message.attachments?.length
      ? `X-Attachments: ${message.attachments.map((a) => a.filename).join(", ")}`
      : null,
    "",
    message.text,
  ]
    .filter(Boolean)
    .join("\n");

  await fs.writeFile(file, body, "utf8");
  return file;
}

/**
 * Sends one message. Always resolves - the caller is told whether it went out,
 * but never has to handle a rejection.
 */
export async function sendMail(message) {
  const envelope = { from: MAIL_FROM, ...message };

  if (!transport) {
    const file = await writeToOutbox(envelope).catch(() => null);
    console.log(
      `  mail: SMTP not configured - "${envelope.subject}" for ${envelope.to} written to ${file ? path.relative(process.cwd(), file) : "nowhere"}`,
    );
    return { sent: false, reason: "smtp-not-configured", file };
  }

  try {
    const info = await transport.sendMail(envelope);
    console.log(`  mail: sent "${envelope.subject}" to ${envelope.to} (${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    /* Keep a copy so nothing is lost while the mail server is unreachable. */
    const file = await writeToOutbox(envelope).catch(() => null);
    console.error(`  mail: FAILED to send "${envelope.subject}" to ${envelope.to}: ${err.message}`);
    return { sent: false, reason: err.message, file };
  }
}

/** Verifies the configured SMTP server answers. Called once at startup. */
export async function verifyMail() {
  if (!transport) return { ok: false, reason: "not-configured" };
  try {
    await transport.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}
