"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ERRORS: Record<string, string> = {
  name_required: "Add your name (1–80 characters).",
  tagline_too_long: "Tagline is too long (120 characters max).",
  resume_too_short: "Paste a real résumé — at least 40 characters.",
  resume_too_large: "Résumé is too large (64KB max).",
  not_authenticated: "Session lost — please sign in again.",
};

export default function SetupClient({ email }: { email: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [resume, setResume] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tagline,
          resume_md: resume,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.redirect) {
          router.push(data.redirect);
          return;
        }
        setError(ERRORS[data?.error] ?? "Something went wrong. Try again.");
        return;
      }
      router.push(data.redirect);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card auth-wide">
      <form onSubmit={submit}>
        <h1>Set up your page</h1>
        <p className="auth-sub">
          Signed in as <strong>{email}</strong>. We'll generate a short link
          for you on the next screen.
        </p>

        <label className="field">
          <span>Name</span>
          <input
            className="input"
            required
            maxLength={80}
            placeholder="Alex Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </label>

        <label className="field">
          <span>Tagline <em>optional</em></span>
          <input
            className="input"
            maxLength={120}
            placeholder="CS @ Stanford · ML systems"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Résumé (markdown)</span>
          <textarea
            className="input textarea"
            required
            rows={16}
            placeholder={"# Your Name\n\nA short bio paragraph.\n\n## Experience\n- ...\n\n## Education\n- ..."}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
        </label>

        <button type="submit" className="cta" disabled={busy}>
          {busy ? "Creating…" : "Create my page"}
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}
