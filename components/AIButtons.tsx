"use client";

import { useEffect, useState } from "react";

type Platform = "claude" | "chatgpt" | "perplexity" | "gemini";

type Props = {
  prompt: string;
};

// Desktop deep-link targets. Gemini doesn't support a `?q=` prefill, so it's
// clipboard-only on every device.
const URLS: Record<Exclude<Platform, "gemini">, (q: string) => string> = {
  claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  chatgpt: (q) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
  perplexity: (q) => `https://www.perplexity.ai/?q=${encodeURIComponent(q)}`,
};

const LABELS: Record<Platform, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
};

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(pointer: coarse)").matches) return true;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older Safari fallback.
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      return ok;
    } finally {
      document.body.removeChild(ta);
    }
  }
}

export default function AIButtons({ prompt }: Props) {
  const [showMore, setShowMore] = useState(false);
  const [moreReady, setMoreReady] = useState(false);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMoreReady(true), 5000);
    return () => clearTimeout(t);
  }, []);

  function flash(msg: string) {
    setToast({ id: Date.now(), msg });
  }

  async function handleClick(platform: Platform) {
    const ok = await copy(prompt);
    const mobile = isMobile();

    if (mobile) {
      flash(ok ? `Copied — open ${LABELS[platform]} and paste` : "Copy failed");
      return;
    }

    if (platform === "gemini") {
      flash(ok ? "Copied — open Gemini and paste" : "Copy failed");
      return;
    }

    flash(ok ? `Copied — opening ${LABELS[platform]}…` : "Copy failed");
    window.open(URLS[platform](prompt), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="ai-stack">
      <div className="ai-row">
        <AIBtn platform="claude" onClick={handleClick} />
      </div>

      {!showMore && (
        <button
          type="button"
          className={`more-btn ${moreReady ? "visible" : ""}`}
          onClick={() => setShowMore(true)}
          aria-hidden={!moreReady}
        >
          more
        </button>
      )}

      <div className={`reveal ${showMore ? "open" : ""}`} aria-hidden={!showMore}>
        <AIBtn platform="chatgpt" onClick={handleClick} />
        <AIBtn platform="perplexity" onClick={handleClick} />
        <AIBtn platform="gemini" onClick={handleClick} />
      </div>

      <div className="toast-host" aria-live="polite">
        {toast && (
          <div className="toast" key={toast.id}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}

function AIBtn({
  platform,
  onClick,
}: {
  platform: Platform;
  onClick: (p: Platform) => void;
}) {
  return (
    <button
      type="button"
      className="ai-btn"
      onClick={() => onClick(platform)}
      aria-label={`Pitch with ${LABELS[platform]}`}
    >
      <Mark platform={platform} />
      <span className="label">{LABELS[platform]}</span>
    </button>
  );
}

function Mark({ platform }: { platform: Platform }) {
  // Simple geometric monograms — keeps the visual rhythm without leaning on
  // third-party logos. Distinct shape per brand for quick recognition.
  switch (platform) {
    case "claude":
      return (
        <svg
          className="mark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M5 15c2-7 5-9 7-9s5 2 7 9" />
          <path d="M5 15c2 0 3-1 4-3" />
          <path d="M19 15c-2 0-3-1-4-3" />
        </svg>
      );
    case "chatgpt":
      return (
        <svg
          className="mark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
        </svg>
      );
    case "perplexity":
      return (
        <svg
          className="mark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M12 4v16M4 12h16M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "gemini":
      return (
        <svg
          className="mark"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z" />
        </svg>
      );
  }
}
