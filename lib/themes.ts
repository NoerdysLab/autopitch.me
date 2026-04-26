// Pitch-page background themes. Five subtle tints that all sit comfortably
// behind the existing dark text — picked deliberately for low saturation so
// the tasteful Apple-ish aesthetic stays intact.
//
// The theme is applied to the public /<handle> page only; owner-facing
// pages (signup, setup, dashboard, edit) keep the default warm background
// to feel app-like rather than personal.

export type ThemeKey = "warm" | "sage" | "blush" | "sky" | "mauve";

export const THEMES: Record<ThemeKey, { label: string; bg: string }> = {
  warm: { label: "Warm", bg: "#f8f7f4" },
  sage: { label: "Sage", bg: "#e8eee5" },
  blush: { label: "Blush", bg: "#f4e8e1" },
  sky: { label: "Sky", bg: "#e6eef5" },
  mauve: { label: "Mauve", bg: "#ede8f0" },
};

export const DEFAULT_THEME: ThemeKey = "warm";

export function isValidTheme(s: unknown): s is ThemeKey {
  return typeof s === "string" && s in THEMES;
}
