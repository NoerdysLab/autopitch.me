import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

const PLATFORMS = new Set(["claude", "chatgpt", "perplexity", "gemini"]);

// Anonymous click log. Called via navigator.sendBeacon from the AI buttons —
// fire-and-forget, no auth, body must be tiny because beacon size is capped
// at ~64 KB and the browser never reads our response.
export async function POST(req: Request) {
  let body: { handle?: unknown; ai_platform?: unknown };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const handle = typeof body.handle === "string" ? body.handle : "";
  const platform =
    typeof body.ai_platform === "string" ? body.ai_platform : "";

  if (!/^[a-z0-9]{4}$/.test(handle) || !PLATFORMS.has(platform)) {
    return new NextResponse(null, { status: 400 });
  }

  // We don't validate that the handle exists — the read of users on every
  // click would double the cost. Garbage rows are cheap to prune later.
  const sql = getSql();
  await sql`
    INSERT INTO clicks (handle, ai_platform)
    VALUES (${handle}, ${platform})
  `;

  return new NextResponse(null, { status: 204 });
}
