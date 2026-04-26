// 4 random chars from the full a–z + 0–9 alphabet (36 symbols → 36^4 ≈
// 1.68M handles). Same shape used for the per-user resume slug. Both stay
// short on purpose so URLs are readable and shareable; with a small Stanford
// cohort, brute-forcing slugs is impractical against typical 404 rates.
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomCode(length: number): string {
  const buf = new Uint8Array(length);
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

export function isValidHandle(s: string): boolean {
  return /^[a-z0-9]{4}$/.test(s);
}

export function generateHandle(): string {
  return randomCode(4);
}

export function generateResumeSlug(): string {
  return randomCode(4);
}

export function isValidResumeSlug(s: string): boolean {
  return /^[a-z0-9]{4}$/.test(s);
}
