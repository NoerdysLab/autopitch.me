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

const MIN_RESUME = 40;

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
  // 2-step wizard. Step 1 focuses on the profile markdown (with the copy
  // prompt), Step 2 collects everything else (photo, name, socials, theme).
  // State for all fields lives at this level so values survive Back nav.
  const [step, setStep] = useState<1 | 2>(1);

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

  // Snap to top whenever the step changes so the user always lands at the
  // header of the new view (instead of mid-form scrolled wherever they
  // were on the previous step).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

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

  function continueToStep2(e: React.FormEvent) {
    e.preventDefault();
    if (resume.trim().length < MIN_RESUME) {
      setError(ERRORS.resume_too_short);
      return;
    }
    setError(null);
    setStep(2);
  }

  function backToStep1() {
    setError(null);
    setStep(1);
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
        // If the failure is about the profile content (only collected on
        // Step 1), bounce the user back so the field they need to fix is
        // visible. Other errors (name, photo, socials) stay on Step 2.
        const errKey = payload?.error;
        if (errKey === "resume_too_short" || errKey === "resume_too_large") {
          setStep(1);
        }
        // Prefer a friendly translation, fall back to whatever the API said
        // so we surface the real cause instead of a useless generic message.
        const msg =
          ERRORS[errKey] ??
          payload?.message ??
          (errKey ? `Error: ${errKey}` : null) ??
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

  const canContinue = resume.trim().length >= MIN_RESUME;

  return (
    <div className="auth-card auth-wide">
      <div className="wizard-progress" aria-label={`Step ${step} of 2`}>
        <span className={step >= 1 ? "active" : ""}>1</span>
        <span className="wizard-progress-bar">
          <span
            className="wizard-progress-fill"
            style={{ width: step === 2 ? "100%" : "0%" }}
          />
        </span>
        <span className={step >= 2 ? "active" : ""}>2</span>
      </div>

      {step === 1 ? (
        <form
          key="step-1"
          className="wizard-step"
          onSubmit={continueToStep2}
        >
          <h1>Build your profile</h1>
          <p className="auth-sub">
            Signed in as <strong>{email}</strong>. Spend a few minutes here
            and the AI pitches you get later will be way better than what
            a plain résumé would produce.
          </p>

          <ol className="wizard-flow">
            <li>
              <CopyPromptButton className="cta cta-secondary cta-prompt">
                Copy the prompt
              </CopyPromptButton>
            </li>
            <li>
              <strong>Open your AI</strong> in another tab — Claude,
              ChatGPT, Gemini, or Perplexity all work — and paste the
              prompt. It&apos;ll interview you for ~5 minutes.
            </li>
            <li>
              <strong>Paste the markdown</strong> it gives you back into
              the field below. Then continue.
            </li>
          </ol>

          <label className="field">
            <span>Your profile (markdown)</span>
            <textarea
              className="input textarea"
              required
              rows={14}
              placeholder={
                "# Your Name\n\nA short opener — who you are, what you're into, what you want next.\n\n## Experience\n- ...\n\n## Education\n- ..."
              }
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
            <span className="field-hint">
              Already have a résumé? Pasting that here works too — pitches
              just won&apos;t be as rich.
            </span>
          </label>

          <button
            type="submit"
            className="cta"
            disabled={!canContinue}
          >
            Continue →
          </button>
          {error && <p className="auth-error">{error}</p>}
        </form>
      ) : (
        <form key="step-2" className="wizard-step" onSubmit={submit}>
          <h1>Add the basics</h1>
          <p className="auth-sub">
            Last step. We&apos;ll generate your short link as soon as you
            create the page.
          </p>

          <div className="notice notice-tight">
            <strong>Heads up:</strong> Claude is the only AI that reliably
            opens your profile link directly today. ChatGPT, Perplexity, and
            Gemini also work — they pitch from the LinkedIn URL below.
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
              type="text"
              maxLength={200}
              placeholder="linkedin.com/in/yourname"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
            <span className="field-hint">
              Used by ChatGPT, Perplexity, and Gemini — they don&apos;t
              reliably fetch your profile link, but they can search
              LinkedIn. Without it, only the Claude button shows on your
              page.
            </span>
          </label>

          <label className="field">
            <span>Instagram URL <em>optional</em></span>
            <input
              className="input"
              type="text"
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
              type="text"
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

          <div className="wizard-actions">
            <button
              type="button"
              className="wizard-back"
              onClick={backToStep1}
              disabled={busy}
            >
              ← Back
            </button>
            <button type="submit" className="cta" disabled={busy}>
              {busy ? "Creating…" : "Create my page"}
            </button>
          </div>
          {error && <p className="auth-error">{error}</p>}
        </form>
      )}
    </div>
  );
}
