"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { toDateKey } from "@/lib/calendar";

export async function createChore(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "").trim() || null;
  const frequencyType = String(formData.get("frequencyType") ?? "");

  if (!title) return;

  if (frequencyType === "interval") {
    const intervalDays = Math.max(1, Number(formData.get("intervalDays") ?? 1));
    const anchorDate = String(formData.get("anchorDate") ?? "").trim() || toDateKey(new Date());
    await sql`
      insert into chores (title, emoji, frequency_type, interval_days, anchor_date)
      values (${title}, ${emoji}, 'interval', ${intervalDays}, ${anchorDate})
    `;
  } else {
    const days = formData.getAll("days").map(Number);
    if (days.length === 0) return;
    await sql`
      insert into chores (title, emoji, frequency_type, days_of_week, anchor_date)
      values (${title}, ${emoji}, 'weekly', ${days}::int[], current_date)
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

export async function setOccurrenceDone(choreId: number, date: string, done: boolean) {
  await sql`
    insert into chore_occurrences (chore_id, date, done)
    values (${choreId}, ${date}, ${done})
    on conflict (chore_id, date) do update set done = excluded.done
  `;
  revalidatePath("/chores");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("passcode");
  redirect("/login");
}
