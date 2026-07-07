import { sql } from "@/lib/db";
import {
  type Chore,
  type ChoreOccurrenceStatus,
  choreOccursOn,
  getNextWeekRange,
  getPreviousWeekRange,
  toDateKey,
} from "@/lib/calendar";
import { DIFFICULTY_POINTS } from "@/lib/constants";
import { fetchGoogleEventsForRange, type GoogleEvent } from "@/lib/google-calendar";

const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-flash";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

type ChoreOccurrenceItem = {
  date: string;
  title: string;
  assignee: string | null;
  difficulty: Chore["difficulty"];
  status: ChoreOccurrenceStatus;
};

async function getChoreOccurrences(startKey: string, endKey: string): Promise<ChoreOccurrenceItem[]> {
  const chores = await sql<Chore[]>`
    select id, title, emoji, frequency_type, interval_days, days_of_week,
      anchor_date::text as anchor_date, difficulty
    from chores
  `;

  const overrides = await sql<
    { chore_id: number; date: string; assignee: string | null; status: ChoreOccurrenceStatus }[]
  >`
    select chore_id, date::text as date, assignee, status
    from chore_occurrences
    where date >= ${startKey} and date <= ${endKey}
  `;
  const overrideMap = new Map(overrides.map((o) => [`${o.chore_id}:${o.date}`, o]));

  const occurrences: ChoreOccurrenceItem[] = [];
  const start = new Date(`${startKey}T00:00:00`);
  const end = new Date(`${endKey}T00:00:00`);
  for (let day = start; day <= end; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    const dateKey = toDateKey(day);
    for (const chore of chores) {
      if (!choreOccursOn(chore, day)) continue;
      const override = overrideMap.get(`${chore.id}:${dateKey}`);
      occurrences.push({
        date: dateKey,
        title: chore.title,
        assignee: override?.assignee ?? null,
        difficulty: chore.difficulty,
        status: override?.status ?? "PENDING",
      });
    }
  }
  return occurrences;
}

async function getChoreScores(): Promise<Record<string, number>> {
  const doneOccurrences = await sql<{ assignee: string | null; difficulty: Chore["difficulty"] }[]>`
    select co.assignee, c.difficulty
    from chore_occurrences co
    join chores c on c.id = co.chore_id
    where co.status = 'DONE'
  `;

  const scores: Record<string, number> = {};
  for (const occurrence of doneOccurrences) {
    if (!occurrence.assignee) continue;
    scores[occurrence.assignee] = (scores[occurrence.assignee] ?? 0) + DIFFICULTY_POINTS[occurrence.difficulty];
  }
  return scores;
}

function buildNewsletterPrompt(
  today: Date,
  startKey: string,
  endKey: string,
  events: GoogleEvent[],
  upcomingChores: ChoreOccurrenceItem[],
  previousChores: ChoreOccurrenceItem[],
  scores: Record<string, number>
): string {
  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const eventLines = events.length
    ? events.map((e) => `- ${e.date} (${e.person}): ${e.title}`).join("\n")
    : "- Nothing on the calendar this week.";

  const upcomingChoreLines = upcomingChores.length
    ? upcomingChores
        .map((c) => `- ${c.date}: ${c.title} — ${c.assignee ?? "unassigned"} [${c.difficulty}]`)
        .join("\n")
    : "- No chores scheduled this week.";

  const previousChoreLines = previousChores.length
    ? previousChores
        .map((c) => `- ${c.date}: ${c.title} — ${c.assignee ?? "unassigned"} [${c.status}]`)
        .join("\n")
    : "- No chores were scheduled last week.";

  const scoreLines = Object.keys(scores).length
    ? Object.entries(scores)
        .map(([person, points]) => `- ${person}: ${points} points`)
        .join("\n")
    : "- No points on the board yet.";

  return `You are writing a short, warm, narrative weekly newsletter for a couple, Ahraz and Malin, covering ${startKey} to ${endKey}.

Today is ${todayLabel} (${toDateKey(today)}).

Calendar events for the upcoming week:
${eventLines}

Chores scheduled for the upcoming week:
${upcomingChoreLines}

How last week's chores went (status is DONE, PENDING meaning it was missed, or CANCELLED):
${previousChoreLines}

All-time chore score totals:
${scoreLines}

Write a cheeky, teasing newsletter (under 300 words) that:
- Roasts them (affectionately) over how last week's chores went — really lean into it if something was missed, and don't let a well-done chore go by without a backhanded compliment either
- Shares the current score totals, trash-talking whoever's behind and letting the leader gloat
- Highlights what's coming up on the calendar this week, with a smart-aleck remark about any event that invites one
- Calls out who's on the hook for which chores this week, ribbing whoever's got the lighter load
- Ends on a warm note underneath all the teasing — the humor should read as clearly affectionate, never mean

Address them by name, keep the tone playful and sarcastic like a friend roasting them.

Format the output as GitHub-flavored markdown, styled like an actual newspaper: start with a single "# " headline for the whole issue, use "## " for each section (e.g. last week's recap, the scoreboard, this week ahead), use **bold** and *italics* for emphasis, and a "---" divider between major sections. Keep paragraphs short. Output raw markdown only, no code fences around it.`;
}

async function callDeepSeek(prompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY is not set");

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek request failed: ${await res.text()}`);

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  if (!text) throw new Error("DeepSeek returned no content");
  return text;
}

export type StoredNewsletter = {
  content: string;
  weekStart: string;
  weekEnd: string;
  createdAt: string;
};

export async function getLatestNewsletter(): Promise<StoredNewsletter | null> {
  const [row] = await sql<
    { content: string; week_start: string; week_end: string; created_at: string }[]
  >`
    select content, week_start::text as week_start, week_end::text as week_end, created_at
    from newsletters
    order by created_at desc
    limit 1
  `;
  if (!row) return null;
  return {
    content: row.content,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    createdAt: row.created_at,
  };
}

export async function generateWeeklyNewsletter(): Promise<string> {
  const today = new Date();
  const { startKey, endKey } = getNextWeekRange(today);
  const previousWeek = getPreviousWeekRange(today);

  const [events, upcomingChores, previousChores, scores] = await Promise.all([
    fetchGoogleEventsForRange(startKey, endKey),
    getChoreOccurrences(startKey, endKey),
    getChoreOccurrences(previousWeek.startKey, previousWeek.endKey),
    getChoreScores(),
  ]);

  const newsletter = await callDeepSeek(
    buildNewsletterPrompt(today, startKey, endKey, events, upcomingChores, previousChores, scores)
  );

  console.log(`[newsletter] weekly newsletter (${startKey} to ${endKey}):\n${newsletter}`);

  await sql`
    insert into newsletters (week_start, week_end, content)
    values (${startKey}, ${endKey}, ${newsletter})
  `;

  return newsletter;
}
