"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Mirrors the danger-zone button on /<handle>/edit. Posts to the
// session-authed branch of /api/users/takedown, which soft-deletes the user
// and destroys the session — so router.push("/") lands them on the
// marketing page as a logged-out visitor.
export default function DeleteButton({ handle }: { handle: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deletePage() {
    if (
      !confirm(
        `Delete autopitch.me/${handle} permanently? This can't be undone — your link will 404 immediately.`,
      )
    ) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/users/takedown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(
          payload?.message ?? `Couldn't delete (HTTP ${res.status}). Try again.`,
        );
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="cta cta-danger"
        onClick={deletePage}
        disabled={busy}
      >
        {busy ? "Deleting…" : "Delete my page"}
      </button>
      {error && <p className="auth-error">{error}</p>}
    </>
  );
}
