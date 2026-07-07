import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { generateWeeklyNewsletter } from "@/lib/newsletter";
import { sendPushToAll } from "@/lib/push";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newsletter = await generateWeeklyNewsletter();
  revalidatePath("/");
  revalidatePath("/newsletters");
  await sendPushToAll({
    title: "This week's newsletter is up 📰",
    body: "Your weekly Razlin newsletter is ready to read.",
    url: "/newsletters",
  });
  return NextResponse.json({ newsletter });
}
