// 4 random lowercase alphanumeric chars. Vowels removed to dodge confusables
// and accidental words; left with 32 symbols → 32^4 ≈ 1M handles.
const ALPHABET = "bcdfghjkmnpqrstvwxyz0123456789";

export function isValidHandle(s: string): boolean {
  return /^[a-z0-9]{4}$/.test(s);
}

export function generateHandle(): string {
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

// Per-user opaque slug for the raw-markdown URL at /r/<slug>. 12 chars
// from the same alphabet → 32^12 ≈ 1.15e18, enough that nobody can
// guess it from the public handle. Uses crypto-strong randomness.
export function generateResumeSlug(): string {
  const buf = new Uint8Array(12);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < buf.length; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    out += ALPHABET[buf[i] % ALPHABET.length];
  }
  return out;
}

export function isValidResumeSlug(s: string): boolean {
  return /^[a-z0-9]{12}$/.test(s);
}
