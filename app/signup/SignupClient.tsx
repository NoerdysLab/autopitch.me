"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Stage = "email" | "code";

const VERIFY_ERRORS: Record<string, string> = {
  wrong: "That code didn't match. Try again.",
  expired: "That code expired. Send a new one.",
  exhausted: "Too many tries. Send a new code.",
  missing: "No code on file. Send a new one.",
  no_pending_email: "Session lost — start over with your email.",
  bad_code_format: "Enter the 6-digit code.",
};

export default function SignupClient({
  initialPendingEmail,
}: {
  initialPendingEmail: string | null;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>(
    initialPendingEmail ? "code" : "email",
  );
  const [email, setEmail] = useState(initialPendingEmail ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.message ??
            "Couldn't send a code. Check the email and try again.",
        );
        return;
      }
      setStage("code");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(VERIFY_ERRORS[data?.error] ?? "Couldn't verify. Try again.");
        return;
      }
      router.push(data.redirect ?? "/setup");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    setStage("email");
    setCode("");
    setError(null);
  }

  return (
    <div className="auth-card">
      {stage === "email" ? (
        <form onSubmit={submitEmail}>
          <h1>Claim your page</h1>
          <p className="auth-sub">
            Enter your <strong>@stanford.edu</strong> email — we'll send a
            6-digit code.
          </p>
          <div className="notice notice-tight">
            <strong>Heads up:</strong> Claude is the only AI that opens your
            résumé link directly today. The others use your LinkedIn URL,
            which you can add on the next screen.
          </div>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            required
            placeholder="you@stanford.edu"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="cta" disabled={busy}>
            {busy ? "Sending…" : "Send code"}
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      ) : (
        <form onSubmit={submitCode}>
          <h1>Check your email</h1>
          <p className="auth-sub">
            We sent a code to <strong>{email}</strong>.
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            className="input code-input"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />
          <button type="submit" className="cta" disabled={busy || code.length !== 6}>
            {busy ? "Verifying…" : "Verify"}
          </button>
          {error && <p className="auth-error">{error}</p>}
          <button type="button" className="auth-link" onClick={startOver}>
            wrong email? start over
          </button>
        </form>
      )}
    </div>
  );
}
