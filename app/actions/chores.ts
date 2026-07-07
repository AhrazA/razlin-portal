"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { toDateKey, type ChoreOccurrenceStatus } from "@/lib/calendar";
import { DIFFICULTIES } from "@/lib/constants";

export async function createChore(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || null;
  const frequencyType = String(formData.get("frequencyType") ?? "");
  const difficultyInput = String(formData.get("difficulty") ?? "");
  const difficulty = DIFFICULTIES.includes(difficultyInput as (typeof DIFFICULTIES)[number])
    ? difficultyInput
    : "EASY";

  if (!title) return;

  if (frequencyType === "interval") {
    const intervalDays = Math.max(1, Number(formData.get("intervalDays") ?? 1));
    const anchorDate = String(formData.get("anchorDate") ?? "").trim() || toDateKey(new Date());
    await sql`
      insert into chores (title, emoji, frequency_type, interval_days, anchor_date, difficulty)
      values (${title}, ${emoji}, 'interval', ${intervalDays}, ${anchorDate}, ${difficulty})
    `;
  } else {
    const days = formData.getAll("days").map(Number);
    if (days.length === 0) return;
    await sql`
      insert into chores (title, emoji, frequency_type, days_of_week, anchor_date, difficulty)
      values (${title}, ${emoji}, 'weekly', ${days}::int[], current_date, ${difficulty})
    `;
  }

  revalidatePath("/chores");
}

export async function deleteChore(choreId: number) {
  await sql`delete from chores where id = ${choreId}`;
  revalidatePath("/chores");
}

export async function setOccurrenceAssignee(
  choreId: number,
  date: string,
  assignee: string | null
) {
  await sql`
    insert into chore_occurrences (chore_id, date, assignee)
    values (${choreId}, ${date}, ${assignee})
    on conflict (chore_id, date) do update set assignee = excluded.assignee
  `;
  revalidatePath("/chores");
}

export async function setOccurrenceStatus(
  choreId: number,
  date: string,
  status: ChoreOccurrenceStatus
) {
  await sql`
    insert into chore_occurrences (chore_id, date, status)
    values (${choreId}, ${date}, ${status})
    on conflict (chore_id, date) do update set status = excluded.status
  `;
  revalidatePath("/chores");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("passcode");
  redirect("/login");
}
