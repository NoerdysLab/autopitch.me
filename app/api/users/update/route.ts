import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { normalizeLinkedIn } from "@/lib/linkedin";
import { normalizeInstagram, normalizeX } from "@/lib/socials";
import { getSession } from "@/lib/session";
import { isValidTheme } from "@/lib/themes";
import { getUserByEmail, updateUser } from "@/lib/users";

const MAX_RESUME_BYTES = 64 * 1024;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[/api/users/update] uncaught:", detail);
    return NextResponse.json(
      { error: "internal", message: detail },
      { status: 500 },
    );
  }
}

async function handle(req: Request) {
  const session = await getSession();
  if (!session.email) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }
  const user = await getUserByEmail(session.email);
  if (!user || user.deleted_at) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_form" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const tagline = String(form.get("tagline") ?? "").trim();
  const resume = String(form.get("resume_md") ?? "").trim();
  const linkedinRaw = String(form.get("linkedin_url") ?? "").trim();
  const photo = form.get("photo");
  const removePhoto = form.get("remove_photo") === "1";

  if (name.length < 1 || name.length > 80) {
    return NextResponse.json({ error: "name_required" }, { status: 400 });
  }
  if (tagline.length > 120) {
    return NextResponse.json({ error: "tagline_too_long" }, { status: 400 });
  }
  if (resume.length < 40) {
    return NextResponse.json({ error: "resume_too_short" }, { status: 400 });
  }
  if (Buffer.byteLength(resume, "utf-8") > MAX_RESUME_BYTES) {
    return NextResponse.json({ error: "resume_too_large" }, { status: 400 });
  }

  // Empty input clears the URL; non-empty must normalize to a valid LinkedIn.
  let linkedinUrl: string | null = null;
  if (linkedinRaw) {
    linkedinUrl = normalizeLinkedIn(linkedinRaw);
    if (!linkedinUrl) {
      return NextResponse.json({ error: "linkedin_invalid" }, { status: 400 });
    }
  }

  const instagramRaw = String(form.get("instagram_url") ?? "").trim();
  let instagramUrl: string | null = null;
  if (instagramRaw) {
    instagramUrl = normalizeInstagram(instagramRaw);
    if (!instagramUrl) {
      return NextResponse.json({ error: "instagram_invalid" }, { status: 400 });
    }
  }

  const xRaw = String(form.get("x_url") ?? "").trim();
  let xUrl: string | null = null;
  if (xRaw) {
    xUrl = normalizeX(xRaw);
    if (!xUrl) {
      return NextResponse.json({ error: "x_invalid" }, { status: 400 });
    }
  }

  const themeRaw = form.get("theme");
  const theme = isValidTheme(themeRaw) ? themeRaw : user.theme;

  // Photo state machine: replace > remove > keep.
  let photoUrl: string | null = user.photo_url;
  if (photo instanceof File && photo.size > 0) {
    if (!PHOTO_TYPES.has(photo.type)) {
      return NextResponse.json({ error: "photo_bad_type" }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ error: "photo_too_large" }, { status: 400 });
    }
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "photo_storage_unavailable" },
        { status: 500 },
      );
    }
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const blob = await put(`avatars/${randomUUID()}.${ext}`, photo, {
      access: "public",
      addRandomSuffix: false,
      contentType: photo.type,
    });
    photoUrl = blob.url;
  } else if (removePhoto) {
    photoUrl = null;
  }

  const updated = await updateUser(user.id, {
    name,
    tagline: tagline || null,
    resume_md: resume,
    photo_url: photoUrl,
    linkedin_url: linkedinUrl,
    instagram_url: instagramUrl,
    x_url: xUrl,
    theme,
  });

  return NextResponse.json({ ok: true, redirect: `/${updated.handle}` });
}
