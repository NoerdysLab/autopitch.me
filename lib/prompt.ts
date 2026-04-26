// Personalized prompts. Two shapes:
//
//   buildClaudePrompt — points at the warmpitch.me raw-markdown URL.
//     Claude reliably fetches URLs in a `?q=` prefilled prompt, so this is
//     the primary path.
//
//   buildLinkedInPrompt — points at the user's LinkedIn URL.
//     ChatGPT / Perplexity / Gemini don't reliably fetch a URL in their
//     prefilled prompts (they often just answer from training data).
//     LinkedIn URLs they may already know about, or can search for, so
//     pointing them there is a more useful fallback than the warmpitch URL.

export function buildClaudePrompt(opts: {
  name: string;
  resumeSlug: string;
  origin?: string;
}): string {
  const host = (opts.origin ?? "https://warmpitch.me").replace(/\/$/, "");
  return `Tell me about ${opts.name} using ${cleanHost(host)}/r/${opts.resumeSlug} and how they can be useful to me or my business based on what you know about me`;
}

export function buildLinkedInPrompt(opts: {
  name: string;
  linkedinUrl: string;
}): string {
  return `Tell me about ${opts.name} using their LinkedIn at ${opts.linkedinUrl} and how they can be useful to me or my business based on what you know about me`;
}

// Strip the scheme AND any `www.` prefix so the prompt always reads
// "warmpitch.me/x4k9r" — Vercel's apex/www redirect leaves headers().get('host')
// as `www.warmpitch.me` for some requests, and we don't want that leaking
// into the user-visible prompt text.
function cleanHost(s: string): string {
  return s.replace(/^https?:\/\//, "").replace(/^www\./, "");
}
