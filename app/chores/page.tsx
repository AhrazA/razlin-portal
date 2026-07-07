import Link from "next/link";
import { sql } from "@/lib/db";
import { logout } from "@/app/actions/chores";
import {
  type Chore,
  type ChoreOccurrenceStatus,
  choreOccursOn,
  getCalendarDays,
  toDateKey,
} from "@/lib/calendar";
import { DIFFICULTY_POINTS } from "@/lib/constants";
import { fetchGoogleEventsForRange } from "@/lib/google-calendar";
import { AddChoreForm } from "@/components/add-chore-form";
import { ChoresBoard } from "@/components/chores-board";
import { type DayData } from "@/components/calendar-view";
import { LiveSync } from "@/components/live-sync";
import { Scoreboard } from "@/components/scoreboard";
import { UpNextItem } from "@/components/up-next-item";
import { Button } from "@/components/ui/button";

type Occurrence = {
  chore_id: number;
  date: string;
  assignee: string | null;
  status: ChoreOccurrenceStatus;
};

export default async function ChoresPage() {
  const days = getCalendarDays(new Date());
  const startKey = toDateKey(days[0]);
  const endKey = toDateKey(days[days.length - 1]);
  const todayKey = toDateKey(new Date());

  const chores = await sql<Chore[]>`
    select id, title, emoji, frequency_type, interval_days, days_of_week,
      anchor_date::text as anchor_date, difficulty
    from chores
    order by created_at asc
  `;

  const overrides = await sql<Occurrence[]>`
    select chore_id, date::text as date, assignee, status
    from chore_occurrences
    where date >= ${startKey} and date <= ${endKey}
  `;
  const overrideMap = new Map(overrides.map((o) => [`${o.chore_id}:${o.date}`, o]));

  const doneOccurrences = await sql<{ assignee: string | null; difficulty: Chore["difficulty"] }[]>`
    select co.assignee, c.difficulty
    from chore_occurrences co
    join chores c on c.id = co.chore_id
    where co.status = 'DONE'
  `;
  const scores: Record<string, number> = {};
  for (const occurrence of doneOccurrences) {
    if (!occurrence.assignee) continue;
    scores[occurrence.assignee] =
      (scores[occurrence.assignee] ?? 0) + DIFFICULTY_POINTS[occurrence.difficulty];
  }

  const googleEvents = await fetchGoogleEventsForRange(startKey, endKey);
  const googleEventsByDate = new Map<string, typeof googleEvents>();
  for (const event of googleEvents) {
    const list = googleEventsByDate.get(event.date) ?? [];
    list.push(event);
    googleEventsByDate.set(event.date, list);
  }

  const dayData: DayData[] = days.map((day) => {
    const dateKey = toDateKey(day);
    const items = chores
      .filter((chore) => choreOccursOn(chore, day))
      .map((chore) => {
        const override = overrideMap.get(`${chore.id}:${dateKey}`);
        return {
          choreId: chore.id,
          date: dateKey,
          emoji: chore.emoji,
          title: chore.title,
          assignee: override?.assignee ?? null,
          status: override?.status ?? "PENDING",
        };
      });
    return {
      dateKey,
      dayNumber: day.getDate(),
      monthLabel: day.getDate() === 1 ? day.toLocaleDateString(undefined, { month: "short" }) : null,
      label: day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
      isToday: dateKey === todayKey,
      items,
      googleEvents: googleEventsByDate.get(dateKey) ?? [],
    };
  });

  const dayLabelFor = (day: DayData) =>
    day.isToday ? "Today" : day.label.split(",")[0].slice(0, 3);

  const due = dayData
    .filter((day) => day.dateKey <= todayKey)
    .flatMap((day) =>
      day.items
        .filter((item) => item.status === "PENDING")
        .map((item) => ({ ...item, dayLabel: dayLabelFor(day) }))
    );

  const upNext = dayData
    .filter((day) => day.dateKey > todayKey)
    .flatMap((day) =>
      day.items
        .filter((item) => item.status === "PENDING")
        .map((item) => ({ ...item, dayLabel: dayLabelFor(day) }))
    )
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <LiveSync />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl italic text-primary">Our Chores</h1>
        <div className="flex items-center gap-2">
          <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm">
            Home
          </Button>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </div>

      <Scoreboard scores={scores} />

      <div className="space-y-2 rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-medium text-muted-foreground">What&apos;s next</h2>
        {due.length === 0 && upNext.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up 🎉</p>
        ) : (
          <>
            {due.length > 0 && (
              <div className="space-y-1.5">
                {due.map((item) => (
                  <UpNextItem
                    key={`${item.choreId}:${item.date}`}
                    choreId={item.choreId}
                    date={item.date}
                    emoji={item.emoji}
                    title={item.title}
                    assignee={item.assignee}
                    dayLabel={item.dayLabel}
                  />
                ))}
              </div>
            )}

            {upNext.length > 0 && (
              <>
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                    Coming up
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-1.5">
                  {upNext.map((item) => (
                    <UpNextItem
                      key={`${item.choreId}:${item.date}`}
                      choreId={item.choreId}
                      date={item.date}
                      emoji={item.emoji}
                      title={item.title}
                      assignee={item.assignee}
                      dayLabel={item.dayLabel}
                      showActions={false}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AddChoreForm />

      <ChoresBoard days={dayData} todayKey={todayKey} chores={chores} />
    </div>
  );
}
