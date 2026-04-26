import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// 303 See Other so a plain HTML form-submit lands the user back on the
// home page. Any fetch() caller can ignore the redirect and just check
// res.ok — destroy() has already been committed to the cookie.
export async function POST(req: Request) {
  const session = await getSession();
  session.destroy();
  return NextResponse.redirect(new URL("/", req.url), 303);
}
