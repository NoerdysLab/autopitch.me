// Normalizers for the social-profile URLs (Instagram, X). Same shape as
// lib/linkedin.normalizeLinkedIn — permissive about input, strict about
// output. Returns null on anything that doesn't look like a real profile.
//
// LinkedIn lives in lib/linkedin.ts because it predates this file and
// also drives the AI-prompt fallback; not worth churning the import path.

const IG_HANDLE = /^\/[\w.]+\/?$/;
const X_HANDLE = /^\/[\w]+\/?$/;

export function normalizeInstagram(input: string): string | null {
  return normalizeProfile(input, {
    allowedHosts: ["instagram.com"],
    pathRe: IG_HANDLE,
    canonicalHost: "www.instagram.com",
  });
}

export function normalizeX(input: string): string | null {
  // X.com is the canonical host post-rebrand; twitter.com still works as
  // a valid input but we normalize to x.com.
  return normalizeProfile(input, {
    allowedHosts: ["x.com", "twitter.com"],
    pathRe: X_HANDLE,
    canonicalHost: "x.com",
  });
}

type Opts = {
  allowedHosts: string[];
  pathRe: RegExp;
  canonicalHost: string;
};

function normalizeProfile(input: string, opts: Opts): string | null {
  let raw = input.trim();
  if (!raw) return null;
  if (raw.length > 200) return null;
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }

  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  if (!opts.allowedHosts.includes(host)) return null;
  if (!opts.pathRe.test(u.pathname)) return null;

  const handle = u.pathname.replace(/^\//, "").replace(/\/$/, "");
  return `https://${opts.canonicalHost}/${handle}`;
}
