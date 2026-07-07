import Link from "next/link";
import { sql } from "@/lib/db";
import { logout } from "@/app/actions/chores";
import { type Chore, choreOccursOn, getCalendarDays, toDateKey } from "@/lib/calendar";
import { ASSIGNEES } from "@/lib/constants";
import { connectedPeople, fetchGoogleEventsForRange } from "@/lib/google-calendar";
import { AddChoreForm } from "@/components/add-chore-form";
import { ChoresBoard } from "@/components/chores-board";
import { type DayData } from "@/components/calendar-view";
import { GoogleCalendarConnect } from "@/components/google-calendar-connect";
import { LiveSync } from "@/components/live-sync";
import { Button } from "@/components/ui/button";

type Occurrence = {
  chore_id: number;
  date: string;
  assignee: string | null;
  done: boolean;
};

export default async function ChoresPage() {
  const days = getCalendarDays(new Date());
  const startKey = toDateKey(days[0]);
  const endKey = toDateKey(days[days.length - 1]);
  const todayKey = toDateKey(new Date());

  const chores = await sql<Chore[]>`
    select id, title, emoji, frequency_type, interval_days, days_of_week,
      anchor_date::text as anchor_date
    from chores
    order by created_at asc
  `;

  const overrides = await sql<Occurrence[]>`
    select chore_id, date::text as date, assignee, done
    from chore_occurrences
    where date >= ${startKey} and date <= ${endKey}
  `;
  const overrideMap = new Map(overrides.map((o) => [`${o.chore_id}:${o.date}`, o]));

  const [connected, googleEvents] = await Promise.all([
    connectedPeople(),
    fetchGoogleEventsForRange(startKey, endKey),
  ]);
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
          done: override?.done ?? false,
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

  const upNext = dayData
    .filter((day) => day.dateKey >= todayKey)
    .flatMap((day) =>
      day.items
        .filter((item) => !item.done)
        .map((item) => ({
          ...item,
          dayLabel: day.isToday ? "Today" : day.label.split(",")[0].slice(0, 3),
        }))
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

      <div className="space-y-2 rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-medium text-muted-foreground">What&apos;s next</h2>
        {upNext.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up 🎉</p>
        ) : (
          <div className="space-y-1.5">
            {upNext.map((item) => (
              <div
                key={`${item.choreId}:${item.date}`}
                className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-sm"
              >
                <span className="flex-1 truncate">
                  {item.emoji ? `${item.emoji} ` : ""}
                  {item.title}
                  <span className="ml-1.5 text-xs text-muted-foreground">{item.dayLabel}</span>
                </span>
                <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                  {item.assignee ? item.assignee[0] : "?"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <GoogleCalendarConnect connected={connected} people={ASSIGNEES} />

      <AddChoreForm />

      <ChoresBoard days={dayData} todayKey={todayKey} chores={chores} />
    </div>
  );
}
