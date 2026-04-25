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
  // Monochrome approximations of each brand's icon mark. Drawn with currentColor
  // so they pick up the button's text color and stay on-design.
  switch (platform) {
    case "claude":
      // Anthropic / Claude "spark": eight tapered rays in an asterisk burst,
      // built as four crossed lozenges rotated 0/45/90/135°.
      return (
        <svg className="mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <g transform="translate(12 12)">
            <ellipse rx="1.7" ry="10" />
            <ellipse rx="1.7" ry="10" transform="rotate(45)" />
            <ellipse rx="1.7" ry="10" transform="rotate(90)" />
            <ellipse rx="1.7" ry="10" transform="rotate(135)" />
          </g>
        </svg>
      );
    case "chatgpt":
      // OpenAI "knot": three overlapping ellipses rotated 60° make the
      // hexagonal six-petal flower outline.
      return (
        <svg
          className="mark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <g transform="translate(12 12)">
            <ellipse rx="3.6" ry="9.5" />
            <ellipse rx="3.6" ry="9.5" transform="rotate(60)" />
            <ellipse rx="3.6" ry="9.5" transform="rotate(120)" />
          </g>
        </svg>
      );
    case "perplexity":
      // Perplexity uses an asterisk-style burst inside a rounded square.
      // Render the asterisk only — the surrounding button already plays the
      // role of the rounded-square container.
      return (
        <svg
          className="mark"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden
        >
          <line x1="12" y1="3" x2="12" y2="21" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
          <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
        </svg>
      );
    case "gemini":
      // Google Gemini "sparkle": four-pointed star with concave sides.
      return (
        <svg className="mark" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2 C12.7 8.4 15.6 11.3 22 12 C15.6 12.7 12.7 15.6 12 22 C11.3 15.6 8.4 12.7 2 12 C8.4 11.3 11.3 8.4 12 2 Z" />
        </svg>
      );
  }
}
