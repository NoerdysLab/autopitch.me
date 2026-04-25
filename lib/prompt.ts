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
  return `Tell me about ${opts.name} using ${stripScheme(host)}/${opts.handle}r and how they can be useful to me or my business based on what you know about me`;
}

function stripScheme(s: string): string {
  return s.replace(/^https?:\/\//, "");
}
