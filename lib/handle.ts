// 4 random lowercase alphanumeric chars. Vowels removed to dodge confusables
// and accidental words; left with 31 symbols → 31^4 ≈ 920k handles.
const ALPHABET = "bcdfghjklmnpqrstvwxyz0123456789";

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
