"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  token: string;
  handle: string;
  name: string;
};

export default function Confirm({ token, handle, name }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTakedown() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/users/takedown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setError("Couldn't take the page down. Try again or contact support.");
        return;
      }
      // Refresh so the server component re-runs and renders the
      // "already taken down" branch.
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Take down your page?</h1>
      <p className="auth-sub">
        This removes <strong>warmpitch.me/{handle}</strong> ({name}). Anyone
        visiting it will get a 404. Click logs are kept for analytics; the
        résumé and photo are soft-deleted and won't be served.
      </p>
      <p className="auth-sub" style={{ marginTop: 16 }}>
        You can sign up again with the same email later if you change your mind.
      </p>

      <button
        type="button"
        className="cta cta-danger"
        onClick={handleTakedown}
        disabled={busy}
      >
        {busy ? "Taking it down…" : "Yes, take it down"}
      </button>

      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
