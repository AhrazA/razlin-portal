import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateWeeklyNewsletter } from "@/lib/newsletter";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newsletter = await generateWeeklyNewsletter();
  revalidatePath("/");
  return NextResponse.json({ newsletter });
}
