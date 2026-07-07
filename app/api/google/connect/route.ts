import { NextRequest, NextResponse } from "next/server";
import { googleAuthUrl } from "@/lib/google-calendar";
import { ASSIGNEES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const person = request.nextUrl.searchParams.get("person") ?? "";
  if (!ASSIGNEES.includes(person as (typeof ASSIGNEES)[number])) {
    return NextResponse.json({ error: "Unknown person" }, { status: 400 });
  }

  const redirectUri = new URL("/api/google/callback", request.nextUrl.origin).toString();
  return NextResponse.redirect(googleAuthUrl(person, redirectUri));
}
