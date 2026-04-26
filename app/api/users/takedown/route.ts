import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { verifyTakedownToken } from "@/lib/takedown";
import { getUserByEmail, getUserById, softDeleteUser } from "@/lib/users";

// Soft-delete a page. Two auth paths:
//   1. HMAC `token` from the welcome email (no login needed)
//   2. The caller's verified session
// Whichever was used, the session is always destroyed at the end — the user
// just deleted their account, so logging them out is the right finishing
// move. Idempotent: calling twice on the same user no-ops the second time.
export async function POST(req: Request) {
  let body: { token?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // Empty/missing body is allowed when relying on session auth.
  }

  const session = await getSession();

  let userId: string | null = null;
  if (typeof body.token === "string" && body.token) {
    userId = verifyTakedownToken(body.token);
    if (!userId) {
      return NextResponse.json({ error: "invalid_token" }, { status: 400 });
    }
  } else if (session.email) {
    const u = await getUserByEmail(session.email);
    if (!u) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    userId = u.id;
  } else {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!user.deleted_at) {
    await softDeleteUser(userId);
  }

  session.destroy();
  return NextResponse.json({ ok: true });
}
