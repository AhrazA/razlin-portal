import Link from "next/link";
import { sql } from "@/lib/db";
import { deleteChore, logout } from "@/app/actions/chores";
import {
  type Chore,
  choreOccursOn,
  describeFrequency,
  getCalendarDays,
  toDateKey,
} from "@/lib/calendar";
import { AddChoreForm } from "@/components/add-chore-form";
import { OccurrenceChip } from "@/components/occurrence-chip";
import { Button } from "@/components/ui/button";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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

  const grid = days.map((day) => {
    const dateKey = toDateKey(day);
    const items = chores
      .filter((chore) => choreOccursOn(chore, day))
      .map((chore) => {
        const override = overrideMap.get(`${chore.id}:${dateKey}`);
        return {
          chore,
          date: dateKey,
          assignee: override?.assignee ?? null,
          done: override?.done ?? false,
        };
      });
    return { day, dateKey, items };
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
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

      <AddChoreForm />

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
        {grid.map(({ day, dateKey, items }) => {
          const isToday = dateKey === todayKey;
          const showMonth = day.getDate() === 1 || dateKey === grid[0].dateKey;
          return (
            <div
              key={dateKey}
              className={`flex min-h-[110px] flex-col gap-1 rounded-xl border p-1.5 ${
                isToday ? "border-primary bg-accent/20" : "bg-card"
              }`}
            >
              <div
                className={`text-[11px] font-medium ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {showMonth
                  ? day.toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  : day.getDate()}
              </div>
              <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
                {items.map(({ chore, date, assignee, done }) => (
                  <OccurrenceChip
                    key={chore.id}
                    choreId={chore.id}
                    date={date}
                    emoji={chore.emoji}
                    title={chore.title}
                    assignee={assignee}
                    done={done}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Manage chores</h2>
        {chores.length === 0 && (
          <p className="text-sm text-muted-foreground">No chores yet — add one above.</p>
        )}
        {chores.map((chore) => (
          <div
            key={chore.id}
            className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2"
          >
            <span className="flex-1 text-sm">
              {chore.emoji ? `${chore.emoji} ` : ""}
              {chore.title}
            </span>
            <span className="text-xs text-muted-foreground">{describeFrequency(chore)}</span>
            <form action={deleteChore.bind(null, chore.id)}>
              <Button variant="ghost" size="sm" type="submit">
                Remove
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
