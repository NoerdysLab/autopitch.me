import { createHash, randomInt } from "node:crypto";
import { getSql } from "./db";
import { sendOtpEmail } from "./email";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_PER_EMAIL = 5;
const RATE_LIMIT_WINDOW_MINUTES = 10;

export const STANFORD_RE = /^[^\s@]+@stanford\.edu$/i;

export class RateLimitedError extends Error {
  retryMinutes: number;
  constructor(retryMinutes: number) {
    super(`rate_limited`);
    this.name = "RateLimitedError";
    this.retryMinutes = retryMinutes;
  }
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function startOtp(email: string): Promise<void> {
  const sql = getSql();

  // Rate limit: cap at RATE_LIMIT_PER_EMAIL OTP requests per email per
  // RATE_LIMIT_WINDOW_MINUTES so a bad actor can't burn through codes
  // (or spam the user's inbox).
  const recent = (await sql`
    SELECT count(*)::int AS n FROM otp_codes
    WHERE lower(email) = ${email.toLowerCase()}
      AND created_at > now() - (${RATE_LIMIT_WINDOW_MINUTES} || ' minutes')::interval
  `) as Array<{ n: number }>;
  if ((recent[0]?.n ?? 0) >= RATE_LIMIT_PER_EMAIL) {
    throw new RateLimitedError(RATE_LIMIT_WINDOW_MINUTES);
  }

  const code = generateCode();
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
