import { NextResponse } from "next/server";
import { isValidResumeSlug } from "@/lib/handle";
import { getUserByResumeSlug } from "@/lib/users";

// Raw markdown résumé. Reached at /r/<slug> where slug is a 12-char random
// per-user opaque identifier — independent of the handle so finding someone's
// pitch URL doesn't reveal their résumé URL.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!isValidResumeSlug(slug)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const user = await getUserByResumeSlug(slug);
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
