"use client";

import { useState } from "react";
import { PROFILE_PROMPT } from "@/lib/profile-prompt";

// Inline "copy this prompt" link under the résumé textarea. Reads as a
// regular hyperlink in the surrounding sentence; on click it copies the
// PROFILE_PROMPT to the clipboard and flips the label to "copied!" for
// 2 seconds so the user knows it landed.
export default function CopyPromptButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(PROFILE_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked (uncommon — usually only in iframes without
      // user gesture). Fail silently; the user can long-press on mobile or
      // we can add a fallback later if anyone hits it.
    }
  }

  return (
    <button type="button" className="hint-link" onClick={copy}>
      {copied ? "copied!" : "copy this prompt"}
    </button>
  );
}
