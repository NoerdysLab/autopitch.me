"use client";

import { useState } from "react";

export default function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore — clipboard can fail in some contexts
    }
  }

  return (
    <button type="button" className="nav-link" onClick={copy}>
      {copied ? "copied!" : "copy"}
    </button>
  );
}
