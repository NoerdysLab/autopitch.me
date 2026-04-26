// Personalized prompts. Two shapes:
//
//   buildClaudePrompt — points at the autopitch.me raw-markdown URL.
//     Claude reliably fetches URLs in a `?q=` prefilled prompt, so this is
//     the primary path.
//
//   buildLinkedInPrompt — points at the user's LinkedIn URL.
//     ChatGPT / Perplexity / Gemini don't reliably fetch a URL in their
//     prefilled prompts (they often just answer from training data).
//     LinkedIn URLs they may already know about, or can search for, so
//     pointing them there is a more useful fallback than the autopitch URL.

export function buildClaudePrompt(opts: {
  name: string;
  handle: string;
  origin?: string;
}): string {
  const host = (opts.origin ?? "https://autopitch.me").replace(/\/$/, "");
  return `Tell me about ${opts.name} using ${cleanHost(host)}/${opts.handle}r and how they can be useful to me or my business based on what you know about me`;
}

export function buildLinkedInPrompt(opts: {
  name: string;
  linkedinUrl: string;
}): string {
  return `Tell me about ${opts.name} using their LinkedIn at ${opts.linkedinUrl} and how they can be useful to me or my business based on what you know about me`;
}

// Back-compat alias — older imports may still reference buildPrompt.
export const buildPrompt = buildClaudePrompt;

// Strip the scheme AND any `www.` prefix so the prompt always reads
// "autopitch.me/x4k9r" — Vercel's apex/www redirect leaves headers().get('host')
// as `www.autopitch.me` for some requests, and we don't want that leaking
// into the user-visible prompt text.
function cleanHost(s: string): string {
  return s.replace(/^https?:\/\//, "").replace(/^www\./, "");
}
