import { NextResponse } from "next/server";
import { startOtp, STANFORD_RE } from "@/lib/otp";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  let body: { email?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!STANFORD_RE.test(email)) {
    return NextResponse.json(
      { error: "stanford_only", message: "Sign up requires an @stanford.edu email." },
      { status: 400 },
    );
  }

  await startOtp(email);

  const session = await getSession();
  session.pending_email = email.toLowerCase();
  delete session.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
