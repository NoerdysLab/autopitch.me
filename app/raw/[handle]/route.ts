import { NextResponse } from "next/server";
import { isValidHandle } from "@/lib/handle";
import { getUserByHandle } from "@/lib/users";

// Reached via middleware rewrite from /<handle>r so AI agents fetching the
// link in the prompt see plain markdown, not an HTML page.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  if (!isValidHandle(handle)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const user = await getUserByHandle(handle);
  if (!user || user.deleted_at) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(user.resume_md, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
