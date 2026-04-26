// Normalize a user-typed LinkedIn URL to a canonical form, or return null
// if it's nonsense. We're permissive about input (with/without scheme,
// with/without www, with/without trailing slash) but strict about the
// output: always https://www.linkedin.com/in/<handle>.

const PROFILE_PATH = /^\/in\/[\w\-_.%]+\/?$/i;

export function normalizeLinkedIn(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;
  if (raw.length > 200) return null;

  // Add a scheme if the user just typed "linkedin.com/in/foo".
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }

  // Allow linkedin.com and any-language country subdomain like uk.linkedin.com.
  const host = u.hostname.toLowerCase();
  if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) {
    return null;
  }

  if (!PROFILE_PATH.test(u.pathname)) return null;

  // Canonical form: https://www.linkedin.com/in/<handle>, no trailing slash.
  const handle = u.pathname.replace(/^\/in\//i, "").replace(/\/$/, "");
  return `https://www.linkedin.com/in/${handle}`;
}
