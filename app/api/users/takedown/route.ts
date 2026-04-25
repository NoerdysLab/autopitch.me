import { NextResponse } from "next/server";
import { verifyTakedownToken } from "@/lib/takedown";
import { getUserById, softDeleteUser } from "@/lib/users";

// HMAC-token-gated soft-delete. Idempotent: calling twice on the same user
// is fine, the second call just no-ops because deleted_at is already set.
export async function POST(req: Request) {
  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const userId = verifyTakedownToken(token);
  if (!userId) {
    return NextResponse.json({ error: "invalid_token" }, { status: 400 });
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!user.deleted_at) {
    await softDeleteUser(userId);
  }

  return NextResponse.json({ ok: true });
}
