"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CopyPromptButton from "@/components/CopyPromptButton";
import ThemePicker from "@/components/ThemePicker";
import { DEFAULT_THEME, type ThemeKey } from "@/lib/themes";

const ERRORS: Record<string, string> = {
  name_required: "Add your name (1–80 characters).",
  tagline_too_long: "Tagline is too long (120 characters max).",
  resume_too_short: "Your profile is too short — at least 40 characters.",
  resume_too_large: "Your profile is too large (64KB max).",
  linkedin_invalid:
    "That doesn't look like a LinkedIn profile URL. Should look like linkedin.com/in/yourname.",
  instagram_invalid:
    "That doesn't look like an Instagram profile URL. Should look like instagram.com/yourname.",
  x_invalid:
    "That doesn't look like an X profile URL. Should look like x.com/yourname.",
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
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [x, setX] = useState("");
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
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
      data.append("linkedin_url", linkedin);
      data.append("instagram_url", instagram);
      data.append("x_url", x);
      data.append("theme", theme);
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

        <div className="notice notice-tight">
          <strong>Heads up:</strong> Claude is the only AI that reliably
          opens your profile link directly today. ChatGPT, Perplexity, and
          Gemini also work — they pitch from the LinkedIn URL below.
        </div>

        <div className="profile-callout">
          <h3>Best results: let your AI interview you</h3>
          <p>
            Pitches built from a plain résumé end up generic. Spend ~5
            minutes letting Claude (or ChatGPT, Gemini, Perplexity) draw
            out the <em>why</em> behind your background:
          </p>
          <ol className="profile-steps">
            <li>
              <CopyPromptButton />
            </li>
            <li>Paste it into your AI and answer the questions it asks</li>
            <li>Paste the markdown profile it generates into the field below</li>
          </ol>
        </div>

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
            placeholder="Phil Knight"
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
          <span>LinkedIn URL <em>optional, but recommended</em></span>
          <input
            className="input"
            type="url"
            maxLength={200}
            placeholder="linkedin.com/in/yourname"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
          <span className="field-hint">
            Used by ChatGPT, Perplexity, and Gemini — they don't reliably
            fetch your résumé link, but they can search LinkedIn. Without it,
            only the Claude button shows on your page.
          </span>
        </label>

        <label className="field">
          <span>Instagram URL <em>optional</em></span>
          <input
            className="input"
            type="url"
            maxLength={200}
            placeholder="instagram.com/yourname"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </label>

        <label className="field">
          <span>X URL <em>optional</em></span>
          <input
            className="input"
            type="url"
            maxLength={200}
            placeholder="x.com/yourname"
            value={x}
            onChange={(e) => setX(e.target.value)}
          />
          <span className="field-hint">
            Each social you provide shows up as a small icon on your page.
          </span>
        </label>

        <div className="field">
          <span>Background</span>
          <ThemePicker value={theme} onChange={setTheme} />
        </div>

        <label className="field">
          <span>Your profile (markdown)</span>
          <textarea
            className="input textarea"
            required
            rows={16}
            placeholder={"# Your Name\n\nA short bio paragraph.\n\n## Experience\n- ...\n\n## Education\n- ..."}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
          <span className="field-hint">
            Already have a résumé? Pasting that here works too — pitches
            just won't be as rich.
          </span>
        </label>

        <button type="submit" className="cta" disabled={busy}>
          {busy ? "Creating…" : "Create my page"}
        </button>
        {error && <p className="auth-error">{error}</p>}
      </form>
    </div>
  );
}
