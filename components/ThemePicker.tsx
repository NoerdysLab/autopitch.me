"use client";

import { THEMES, type ThemeKey } from "@/lib/themes";

// Row of 5 colored swatch buttons. Selected one gets a thicker dark ring.
// Native button[type=button] semantics — keyboard-accessible, no JS-magic
// radio polyfill.

export default function ThemePicker({
  value,
  onChange,
}: {
  value: ThemeKey;
  onChange: (next: ThemeKey) => void;
}) {
  return (
    <div className="theme-picker" role="radiogroup" aria-label="Background color">
      {(Object.entries(THEMES) as [ThemeKey, { label: string; bg: string }][]).map(
        ([key, t]) => (
          <button
            key={key}
            type="button"
            className={`swatch ${value === key ? "swatch-on" : ""}`}
            style={{ background: t.bg }}
            onClick={() => onChange(key)}
            aria-checked={value === key}
            role="radio"
            title={t.label}
          >
            <span className="sr-only">{t.label}</span>
          </button>
        ),
      )}
    </div>
  );
}
