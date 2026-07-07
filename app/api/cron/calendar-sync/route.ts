import { NextRequest, NextResponse } from "next/server";
import { syncNextWeekEvents } from "@/lib/google-calendar";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await syncNextWeekEvents();
  return NextResponse.json({ count: events.length });
}
