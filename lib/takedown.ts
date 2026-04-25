import { createHmac, timingSafeEqual } from "node:crypto";

// HMAC-signed takedown tokens, embedded in the welcome email and never
// stored in the database. Format: `<userId>.<base64url-signature>`.
//
// The signing key is SESSION_SECRET. Tokens never expire on purpose — the
// kill switch should always work for as long as the page exists. If
// SESSION_SECRET is rotated, all existing takedown links become invalid;
// in that case, users can still take down via a logged-in path (TODO).

function key(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return Buffer.from(secret);
}

function sign(payload: string): string {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

export function makeTakedownToken(userId: string): string {
  return `${userId}.${sign(userId)}`;
}

export function verifyTakedownToken(token: string): string | null {
  const idx = token.indexOf(".");
  if (idx <= 0) return null;
  const userId = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (!userId || !sig) return null;

  const expected = sign(userId);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  return timingSafeEqual(sigBuf, expBuf) ? userId : null;
}
