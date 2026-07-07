import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { type Chore, type ChoreOccurrenceStatus, choreOccursOn, toDateKey } from "@/lib/calendar";
import { sendPushToAll } from "@/lib/push";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayKey = toDateKey(today);

  const chores = await sql<Chore[]>`
    select id, title, emoji, frequency_type, interval_days, days_of_week,
      anchor_date::text as anchor_date, difficulty
    from chores
  `;

  const overrides = await sql<{ chore_id: number; status: ChoreOccurrenceStatus }[]>`
    select chore_id, status from chore_occurrences where date = ${todayKey}
  `;
  const statusMap = new Map(overrides.map((o) => [o.chore_id, o.status]));

  const due = chores.filter(
    (chore) => choreOccursOn(chore, today) && (statusMap.get(chore.id) ?? "PENDING") === "PENDING"
  );

  if (due.length > 0) {
    const titles = due.map((c) => `${c.emoji ?? ""} ${c.title}`.trim()).join(", ");
    await sendPushToAll({
      title: due.length === 1 ? "1 chore due today" : `${due.length} chores due today`,
      body: titles,
      url: "/chores",
    });
  }

  return NextResponse.json({ due: due.length });
}
