"use client";

import { useState, useTransition } from "react";
import { CalendarView, type DayData } from "@/components/calendar-view";
import { Button } from "@/components/ui/button";
import { deleteChore, setChoreDifficulty } from "@/app/actions/chores";
import { describeFrequency, type Chore } from "@/lib/calendar";
import { DIFFICULTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABELS: Record<Chore["difficulty"], string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

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
          <ChoreRow
            key={chore.id}
            chore={chore}
            highlighted={hoveredChoreId === chore.id}
            onHoverChange={(hovered) => setHoveredChoreId(hovered ? chore.id : null)}
          />
        ))}
      </div>
    </>
  );
}

function ChoreRow({
  chore,
  highlighted,
  onHoverChange,
}: {
  chore: Chore;
  highlighted: boolean;
  onHoverChange: (hovered: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function cycleDifficulty() {
    const next = DIFFICULTIES[(DIFFICULTIES.indexOf(chore.difficulty) + 1) % DIFFICULTIES.length];
    startTransition(() => setChoreDifficulty(chore.id, next));
  }

  return (
    <div
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-card px-3 py-2 transition-colors",
        highlighted && "border-primary bg-accent/20"
      )}
    >
      <span className="flex-1 text-sm">
        {chore.emoji ? `${chore.emoji} ` : ""}
        {chore.title}
      </span>
      <span className="text-xs text-muted-foreground">{describeFrequency(chore)}</span>
      <button
        type="button"
        disabled={isPending}
        onClick={cycleDifficulty}
        className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
      >
        {DIFFICULTY_LABELS[chore.difficulty]}
      </button>
      <form action={deleteChore.bind(null, chore.id)}>
        <Button variant="ghost" size="sm" type="submit">
          Remove
        </Button>
      </form>
    </div>
  );
}
