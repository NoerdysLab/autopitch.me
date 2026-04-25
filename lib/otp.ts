import { createHash, randomInt } from "node:crypto";
import { Resend } from "resend";
import { getSql } from "./db";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export const STANFORD_RE = /^[^\s@]+@stanford\.edu$/i;

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  // 6 digits, zero-padded. randomInt is cryptographically strong.
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function startOtp(email: string): Promise<void> {
  const code = generateCode();
  const sql = getSql();
  await sql`
    INSERT INTO otp_codes (email, code_hash, expires_at)
    VALUES (
      ${email.toLowerCase()},
      ${hashCode(code)},
      now() + (${CODE_TTL_MINUTES} || ' minutes')::interval
    )
  `;
  await sendOtpEmail(email, code);
}

type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "wrong" | "exhausted" | "missing" };

export async function verifyOtp(
  email: string,
  code: string,
): Promise<VerifyResult> {
  const sql = getSql();
  const rows = (await sql`
    SELECT id, code_hash, expires_at, consumed_at, attempts
    FROM otp_codes
    WHERE lower(email) = ${email.toLowerCase()}
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `) as Array<{
    id: string | number;
    code_hash: string;
    expires_at: string | Date;
    consumed_at: string | Date | null;
    attempts: number;
  }>;

  const row = rows[0];
  if (!row) return { ok: false, reason: "missing" };

  const expired = new Date(row.expires_at).getTime() < Date.now();
  if (expired) {
    await sql`UPDATE otp_codes SET consumed_at = now() WHERE id = ${row.id}`;
    return { ok: false, reason: "expired" };
  }

  if (row.attempts >= MAX_ATTEMPTS) {
    await sql`UPDATE otp_codes SET consumed_at = now() WHERE id = ${row.id}`;
    return { ok: false, reason: "exhausted" };
  }

  if (row.code_hash !== hashCode(code)) {
    await sql`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ${row.id}`;
    return { ok: false, reason: "wrong" };
  }

  await sql`UPDATE otp_codes SET consumed_at = now() WHERE id = ${row.id}`;
  return { ok: true };
}

async function sendOtpEmail(email: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "autopitch <onboarding@resend.dev>";

  // Dev fallback: when no Resend key is set, log the code so the flow can be
  // exercised end-to-end before the email vendor is wired up. NEVER do this
  // in production — gate on NODE_ENV.
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set");
    }
    console.log(
      `\n[otp] dev mode — no RESEND_API_KEY, code for ${email}: ${code}\n`,
    );
    return;
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: email,
    subject: `Your autopitch.me sign-in code: ${code}`,
    text: signinEmailText(code),
    html: signinEmailHtml(code),
  });

  if (result.error) {
    throw new Error(`Resend send failed: ${result.error.message}`);
  }
}

function signinEmailText(code: string): string {
  return `Your autopitch.me sign-in code is:

${code}

This code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request it, you can ignore this email.`;
}

function signinEmailHtml(code: string): string {
  // Plain-on-warm to match the site. Email clients are unforgiving — keep it
  // inline-styled and table-free; modern clients render this fine.
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1e;">
  <div style="max-width:480px;margin:0 auto;padding:48px 24px;">
    <div style="font-size:17px;font-weight:600;letter-spacing:-0.01em;margin-bottom:32px;">autopitch.me</div>
    <h1 style="font-size:24px;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px;">Your sign-in code</h1>
    <p style="margin:0 0 24px;color:#6b6b73;font-size:15px;line-height:1.5;">Enter this code to finish signing in to autopitch.me.</p>
    <div style="background:#ffffff;border:1px solid #e8e6e1;border-radius:20px;padding:28px;text-align:center;font-size:32px;font-weight:600;letter-spacing:0.4em;font-variant-numeric:tabular-nums;">${code}</div>
    <p style="margin:24px 0 0;color:#6b6b73;font-size:13px;line-height:1.5;">This code expires in ${CODE_TTL_MINUTES} minutes. If you didn't request it, you can ignore this email.</p>
  </div>
</body></html>`;
}
