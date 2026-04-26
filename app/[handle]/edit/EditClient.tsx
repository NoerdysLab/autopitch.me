"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemePicker from "@/components/ThemePicker";
import type { ThemeKey } from "@/lib/themes";

const ERRORS: Record<string, string> = {
  name_required: "Add your name (1–80 characters).",
  tagline_too_long: "Tagline is too long (120 characters max).",
  resume_too_short: "Paste a real résumé — at least 40 characters.",
  resume_too_large: "Résumé is too large (64KB max).",
  linkedin_invalid:
    "That doesn't look like a LinkedIn profile URL. Should look like linkedin.com/in/yourname.",
  instagram_invalid:
    "That doesn't look like an Instagram profile URL. Should look like instagram.com/yourname.",
  x_invalid:
    "That doesn't look like an X profile URL. Should look like x.com/yourname.",
  not_authenticated: "Session lost — please sign in again.",
  not_found: "Your account couldn't be found. Sign in again.",
  photo_bad_type: "Photo must be JPEG, PNG, or WebP.",
  photo_too_large: "Photo is too large (5MB max).",
  photo_storage_unavailable:
    "Photo storage is temporarily unavailable. Save without changing the photo.",
};

type Props = {
  handle: string;
  name: string;
  tagline: string;
  linkedinUrl: string;
  instagramUrl: string;
  xUrl: string;
  theme: ThemeKey;
  resumeMd: string;
  photoUrl: string | null;
};

export default function EditClient(props: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(props.name);
  const [tagline, setTagline] = useState(props.tagline);
  const [linkedin, setLinkedin] = useState(props.linkedinUrl);
  const [instagram, setInstagram] = useState(props.instagramUrl);
  const [x, setX] = useState(props.xUrl);
  const [theme, setTheme] = useState<ThemeKey>(props.theme);
  const [resume, setResume] = useState(props.resumeMd);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    if (!newPhoto) {
      setNewPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(newPhoto);
    setNewPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [newPhoto]);

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
    setNewPhoto(f);
    setRemovePhoto(false);
  }

  function clearNewPhoto() {
    setNewPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeExistingPhoto() {
    setRemovePhoto(true);
    setNewPhoto(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function undoRemove() {
    setRemovePhoto(false);
  }

  // What's currently shown in the avatar slot.
  const previewUrl = newPhotoPreview
    ? newPhotoPreview
    : removePhoto
      ? null
      : props.photoUrl;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedOk(false);
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
      if (newPhoto) data.append("photo", newPhoto);
      if (removePhoto && !newPhoto) data.append("remove_photo", "1");

      const res = await fetch("/api/users/update", {
        method: "POST",
        body: data,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          ERRORS[payload?.error] ??
          payload?.message ??
          (payload?.error ? `Error: ${payload.error}` : null) ??
          `Something went wrong (HTTP ${res.status}).`;
        setError(msg);
        return;
      }
      setSavedOk(true);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deletePage() {
    if (
      !confirm(
        `Delete warmpitch.me/${props.handle} permanently? This can't be undone — your link will 404 immediately.`,
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
      // Session was destroyed server-side; landing on / will show marketing.
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card auth-wide">
      <form onSubmit={submit}>
        <h1>Edit your page</h1>
        <p className="auth-sub">
          Live at <strong>warmpitch.me/{props.handle}</strong>. Changes go
          live the instant you save.
        </p>

        <div className="photo-row">
          <label
            htmlFor="photo-input"
            className={`photo-slot ${previewUrl ? "has-photo" : ""}`}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" />
            ) : (
              <span className="photo-plus">+</span>
            )}
          </label>
          <div className="photo-meta">
            <span className="photo-label">
              {newPhoto
                ? `New: ${newPhoto.name}`
                : removePhoto
                  ? "Photo will be removed"
                  : props.photoUrl
                    ? "Profile photo"
                    : "Profile photo"}
              <em> optional</em>
            </span>
            <span className="photo-hint">
              JPEG, PNG, or WebP · 5MB max
            </span>
            <div className="photo-actions">
              {newPhoto && (
                <button type="button" className="photo-remove" onClick={clearNewPhoto}>
                  cancel new
                </button>
              )}
              {!newPhoto && props.photoUrl && !removePhoto && (
                <button
                  type="button"
                  className="photo-remove"
                  onClick={removeExistingPhoto}
                >
                  remove
                </button>
              )}
              {removePhoto && (
                <button type="button" className="photo-remove" onClick={undoRemove}>
                  undo remove
                </button>
              )}
            </div>
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <span>Résumé (markdown)</span>
          <textarea
            className="input textarea"
            required
            rows={16}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />
          <span className="field-hint">
            New to markdown? Send your existing résumé (PDF, doc, anything)
            to ChatGPT or Claude and ask: <em>"convert this to markdown."</em>
            Paste the result here.
          </span>
        </label>

        <button type="submit" className="cta" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        {savedOk && <p className="auth-success">Saved.</p>}
        {error && <p className="auth-error">{error}</p>}
      </form>

      <div className="danger-zone">
        <h3>Danger zone</h3>
        <p>
          Delete your page permanently. <strong>warmpitch.me/{props.handle}</strong>{" "}
          will return 404 and your résumé and photo are removed from view. You
          can sign up again later with the same email if you change your mind —
          you'll get a new handle.
        </p>
        <button
          type="button"
          className="cta cta-danger"
          onClick={deletePage}
          disabled={busy}
        >
          Delete my page
        </button>
      </div>
    </div>
  );
}
