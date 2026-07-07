import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "passcode";

export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (cookie === process.env.APP_PASSCODE) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|api/cron/|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico)$).*)",
  ],
};
