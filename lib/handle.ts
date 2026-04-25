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
