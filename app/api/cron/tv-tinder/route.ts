import { NextRequest, NextResponse } from "next/server";
import { generateDailyBatch } from "@/lib/tv-tinder";
import { sendPushToAll } from "@/lib/push";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const picks = await generateDailyBatch();

  if (picks.length > 0) {
    await sendPushToAll({
      title: "TV Tinder 🍿",
      body: `${picks.length} new picks are ready to swipe on`,
      url: "/tv-tinder",
    });
  }

  return NextResponse.json({ generated: picks.length });
}
