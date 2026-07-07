"use client";

import { useState } from "react";
import { CalendarView, type DayData } from "@/components/calendar-view";
import { Button } from "@/components/ui/button";
import { deleteChore } from "@/app/actions/chores";
import { describeFrequency, type Chore } from "@/lib/calendar";
import { cn } from "@/lib/utils";

export function ChoresBoard({
  days,
  todayKey,
  chores,
}: {
  days: DayData[];
  todayKey: string;
  chores: Chore[];
}) {
  const [hoveredChoreId, setHoveredChoreId] = useState<number | null>(null);

  return (
    <>
      <CalendarView days={days} todayKey={todayKey} highlightedChoreId={hoveredChoreId} />

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Manage chores</h2>
        {chores.length === 0 && (
          <p className="text-sm text-muted-foreground">No chores yet — add one above.</p>
        )}
        {chores.map((chore) => (
          <div
            key={chore.id}
            onMouseEnter={() => setHoveredChoreId(chore.id)}
            onMouseLeave={() => setHoveredChoreId(null)}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-card px-3 py-2 transition-colors",
              hoveredChoreId === chore.id && "border-primary bg-accent/20"
            )}
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
    </>
  );
}
