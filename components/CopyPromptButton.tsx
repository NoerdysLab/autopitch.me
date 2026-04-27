"use client";

import { useState } from "react";
import { PROFILE_PROMPT } from "@/lib/profile-prompt";

// Inline "copy this prompt" link inside the field hint copy. On click,
// copies PROFILE_PROMPT to the clipboard and floats a small "copied"
// bubble above the link for ~1.4s. The link text itself doesn't change —
// the bubble does the acknowledgment.
export default function CopyPromptButton() {
  // ID lets each click restart the animation cleanly. A timestamp value
  // is unique per click → React unmounts + remounts the bubble (key={id}),
  // which replays the keyframe from 0%.
  const [bubbleId, setBubbleId] = useState(0);

  async function copy() {
    try {
      await navigator.clipboard.writeText(PROFILE_PROMPT);
      const id = Date.now();
      setBubbleId(id);
      // Clear after the animation finishes so the DOM doesn't accumulate
      // dead bubbles. Guards against a fast second click clobbering the
      // newer bubble: only clear if ID hasn't changed since.
      setTimeout(() => {
        setBubbleId((prev) => (prev === id ? 0 : prev));
      }, 1500);
    } catch {
      // Clipboard API blocked (rare). Fail silently.
    }
  }

  return (
    <span className="hint-link-wrap">
      <button type="button" className="hint-link" onClick={copy}>
        copy this prompt
      </button>
      {bubbleId > 0 && (
        <span key={bubbleId} className="copy-bubble" aria-live="polite">
          copied
        </span>
      )}
    </span>
  );
}
