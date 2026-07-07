import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { exchangeCodeForTokens, syncCalendarEvents } from "@/lib/google-calendar";
import { ASSIGNEES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const person = request.nextUrl.searchParams.get("state") ?? "";
  const choresUrl = new URL("/chores", request.nextUrl.origin);

  if (!code || !ASSIGNEES.includes(person as (typeof ASSIGNEES)[number])) {
    choresUrl.searchParams.set("google_error", "1");
    return NextResponse.redirect(choresUrl);
  }

  try {
    const redirectUri = new URL("/api/google/callback", request.nextUrl.origin).toString();
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    if (!tokens.refresh_token) {
      choresUrl.searchParams.set("google_error", "no_refresh_token");
      return NextResponse.redirect(choresUrl);
    }

    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await sql`
      insert into google_accounts (person, access_token, refresh_token, expiry)
      values (${person}, ${tokens.access_token}, ${tokens.refresh_token}, ${expiry})
      on conflict (person) do update set
        access_token = excluded.access_token,
        refresh_token = excluded.refresh_token,
        expiry = excluded.expiry
    `;
  } catch {
    choresUrl.searchParams.set("google_error", "1");
    return NextResponse.redirect(choresUrl);
  }

  await syncCalendarEvents([person]);

  revalidatePath("/chores");
  revalidatePath("/");
  return NextResponse.redirect(choresUrl);
}
