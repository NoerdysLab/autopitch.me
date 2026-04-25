import { NextResponse, type NextRequest } from "next/server";

// Rewrite /<handle>r → /raw/<handle> so the raw resume markdown can live
// at a sibling URL without a path separator (e.g. autopitch.me/x4k9r).
const RAW_PATH = /^\/([a-z0-9]{4})r\/?$/;

export function middleware(req: NextRequest) {
  const m = req.nextUrl.pathname.match(RAW_PATH);
  if (m) {
    const url = req.nextUrl.clone();
    url.pathname = `/raw/${m[1]}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/:handle((?!_next|api|favicon\\.ico|raw).*)"],
};
