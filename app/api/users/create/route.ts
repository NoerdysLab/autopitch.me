import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { put } from "@vercel/blob";
import { sendWelcomeEmail } from "@/lib/email";
import { getSession } from "@/lib/session";
import { makeTakedownToken } from "@/lib/takedown";
import { createUser, getUserByEmail } from "@/lib/users";

const MAX_RESUME_BYTES = 64 * 1024;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    // Top-level safety net so an uncaught error becomes a structured 500
    // the client can display, instead of the empty-body Vercel error page.
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[/api/users/create] uncaught:", detail);
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

  const existing = await getUserByEmail(session.email);
  if (existing) {
    return NextResponse.json(
      { error: "already_onboarded", redirect: `/${existing.handle}` },
      { status: 409 },
    );
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
  const photo = form.get("photo");

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

  let photoUrl: string | null = null;
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

    // Random filename so URLs are unguessable; keep the user's extension so
    // the served Content-Type matches.
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase().slice(0, 5);
    const blob = await put(`avatars/${randomUUID()}.${ext}`, photo, {
      access: "public",
      addRandomSuffix: false,
      contentType: photo.type,
    });
    photoUrl = blob.url;
  }

  const user = await createUser({
    email: session.email,
    name,
    tagline: tagline || null,
    resume_md: resume,
    photo_url: photoUrl,
  });

  // Welcome email with the takedown kill switch. Built on origin so it works
  // whether the request comes in via the apex domain or a vercel.app URL.
  const h = await headers();
  const host = h.get("host") ?? "autopitch.me";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;
  const takedownUrl = `${origin}/takedown/${makeTakedownToken(user.id)}`;

  // Don't fail signup if the welcome email errors — the user has their page.
  try {
    await sendWelcomeEmail({
      to: user.email,
      name: user.name,
      handle: user.handle,
      takedownUrl,
    });
  } catch (err) {
    console.error("[welcome] send failed:", err);
  }

  return NextResponse.json({ ok: true, redirect: `/${user.handle}` });
}
