"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const ERRORS: Record<string, string> = {
  name_required: "Add your name (1–80 characters).",
  tagline_too_long: "Tagline is too long (120 characters max).",
  resume_too_short: "Paste a real résumé — at least 40 characters.",
  resume_too_large: "Résumé is too large (64KB max).",
  not_authenticated: "Session lost — please sign in again.",
  photo_bad_type: "Photo must be JPEG, PNG, or WebP.",
  photo_too_large: "Photo is too large (5MB max).",
  photo_storage_unavailable:
    "Photo upload is temporarily unavailable. Try without a photo for now.",
};

export default function SetupClient({ email }: { email: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [resume, setResume] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manage the preview blob URL so we don't leak object URLs.
  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setError(null);
    if (f && !["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError(ERRORS.photo_bad_type);
      return;
    }
    if (f && f.size > 5 * 1024 * 1024) {
      setError(ERRORS.photo_too_large);
      return;
    }
    setPhoto(f);
  }

  function clearPhoto() {
    setPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const data = new FormData();
      data.append("name", name);
      data.append("tagline", tagline);
      data.append("resume_md", resume);
      if (photo) data.append("photo", photo);

      const res = await fetch("/api/users/create", {
        method: "POST",
        body: data,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (payload?.redirect) {
          router.push(payload.redirect);
          return;
        }
        // Prefer a friendly translation, fall back to whatever the API said
        // so we surface the real cause instead of a useless generic message.
        const msg =
          ERRORS[payload?.error] ??
          payload?.message ??
          (payload?.error ? `Error: ${payload.error}` : null) ??
          `Something went wrong (HTTP ${res.status}).`;
        setError(msg);
        return;
      }
      router.push(payload.redirect);
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

        <div className="photo-row">
          <label
            htmlFor="photo-input"
            className={`photo-slot ${photoPreview ? "has-photo" : ""}`}
          >
            {photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="Preview" />
            ) : (
              <span className="photo-plus">+</span>
            )}
          </label>
          <div className="photo-meta">
            <span className="photo-label">
              {photo ? photo.name : "Profile photo"}
              <em> optional</em>
            </span>
            <span className="photo-hint">
              JPEG, PNG, or WebP · 5MB max · square works best
            </span>
            {photo && (
              <button type="button" className="photo-remove" onClick={clearPhoto}>
                remove
              </button>
            )}
          </div>
          <input
            id="photo-input"
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPickPhoto}
            hidden
          />
        </div>

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
