import { NextRequest, NextResponse } from "next/server";
import { pickDailyPuzzle } from "@/lib/connections";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const puzzle = await pickDailyPuzzle();

  return NextResponse.json({ picked: puzzle?.id ?? null });
}
