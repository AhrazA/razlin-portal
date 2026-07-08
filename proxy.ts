import { NextRequest, NextResponse } from "next/server";
import { PLAYER_COOKIE } from "@/lib/constants";

const PASSCODE_COOKIE = "passcode";

export function proxy(request: NextRequest) {
  const passcode = request.cookies.get(PASSCODE_COOKIE)?.value;

  if (passcode !== process.env.APP_PASSCODE) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Passcode cookies live a year, so most requests never touch /login again —
  // this is what actually catches an authenticated visitor with no player picked yet.
  if (!request.cookies.get(PLAYER_COOKIE)?.value) {
    const playerUrl = new URL("/login/player", request.url);
    playerUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(playerUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|api/cron/|.*\\.(?:jpg|jpeg|png|gif|webp|svg|ico)$).*)",
  ],
};
