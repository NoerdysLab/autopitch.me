import { NextResponse } from "next/server";
import { RateLimitedError, startOtp, STANFORD_RE } from "@/lib/otp";
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

  try {
    await startOtp(email);
  } catch (err) {
    if (err instanceof RateLimitedError) {
      return NextResponse.json(
        {
          error: "rate_limited",
          message: `Too many code requests. Wait a few minutes and try again.`,
        },
        { status: 429 },
      );
    }
    const detail = err instanceof Error ? err.message : "unknown";
    console.error("[/api/auth/start] send failed:", detail);
    return NextResponse.json(
      {
        error: "send_failed",
        message:
          "Couldn't deliver the code email. If you're using the Resend test sender, it only delivers to your resend.com signup address. Verify warmpitch.me as a sending domain in Resend to fix this.",
        detail,
      },
      { status: 502 },
    );
  }

  const session = await getSession();
  session.pending_email = email.toLowerCase();
  delete session.email;
  await session.save();

  return NextResponse.json({ ok: true });
}
