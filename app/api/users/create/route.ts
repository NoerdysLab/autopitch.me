import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  createUser,
  EmailAlreadyExistsError,
  getUserByEmail,
} from "@/lib/users";

const MAX_RESUME_BYTES = 64 * 1024;

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.email) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  // Refuse if a user already exists for this email — onboarding only runs once.
  const existing = await getUserByEmail(session.email);
  if (existing) {
    return NextResponse.json(
      { error: "already_onboarded", redirect: `/${existing.handle}` },
      { status: 409 },
    );
  }

  let body: {
    name?: unknown;
    tagline?: unknown;
    resume_md?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const tagline = typeof body.tagline === "string" ? body.tagline.trim() : "";
  const resume = typeof body.resume_md === "string" ? body.resume_md.trim() : "";

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

  let user;
  try {
    user = await createUser({
      email: session.email,
      name,
      tagline: tagline || null,
      resume_md: resume,
      photo_url: null,
    });
  } catch (err) {
    // Race against the precheck above: another request finished onboarding
    // for the same email between the SELECT and the INSERT.
    if (err instanceof EmailAlreadyExistsError) {
      const winner = await getUserByEmail(session.email);
      return NextResponse.json(
        {
          error: "already_onboarded",
          redirect: winner ? `/${winner.handle}` : undefined,
        },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json({ ok: true, redirect: `/${user.handle}` });
}
