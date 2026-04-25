import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { getSession } from "@/lib/session";
import { getUserByEmail } from "@/lib/users";

export async function POST(req: Request) {
  const session = await getSession();
  const email = session.pending_email;
  if (!email) {
    return NextResponse.json({ error: "no_pending_email" }, { status: 400 });
  }

  let body: { code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim() : "";
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "bad_code_format" }, { status: 400 });
  }

  const result = await verifyOtp(email, code);
  if (!result.ok) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  // Promote pending → verified.
  delete session.pending_email;
  session.email = email;
  await session.save();

  // Tell the client where to go next.
  const existing = await getUserByEmail(email);
  return NextResponse.json({
    ok: true,
    redirect: existing ? `/${existing.handle}` : "/setup",
  });
}
