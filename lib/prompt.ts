// The personalized prompt that every AI button copies / deep-links with.
// Kept in one place so the home page, pitch page, and any future shareable
// preview all stay in sync.

export function buildPrompt(opts: {
  name: string;
  handle: string;
  origin?: string;
}): string {
  const host = (opts.origin ?? "https://autopitch.me").replace(/\/$/, "");
  // The `r` suffix on the handle points at the raw markdown resume.
  return `Tell me about ${opts.name} using ${cleanHost(host)}/${opts.handle}r and how they can be useful to me or my business based on what you know about me`;
}

// Strip the scheme AND any `www.` prefix so the prompt always reads
// "autopitch.me/x4k9r" — Vercel's apex/www redirect leaves headers().get('host')
// as `www.autopitch.me` for some requests, and we don't want that leaking
// into the user-visible prompt text.
function cleanHost(s: string): string {
  return s.replace(/^https?:\/\//, "").replace(/^www\./, "");
}
