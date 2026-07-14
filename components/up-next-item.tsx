"use client";

import { useTransition } from "react";
import { setOccurrenceAssignee, setOccurrenceStatus } from "@/app/actions/chores";
import { Button } from "@/components/ui/button";
import { ASSIGNEE_CYCLE, assigneeBadge } from "@/lib/constants";

type Props = {
  choreId: number;
  date: string;
  emoji: string | null;
  title: string;
  assignee: string | null;
  dayLabel: string;
  showActions?: boolean;
};

export function UpNextItem({
  choreId,
  date,
  emoji,
  title,
  assignee,
  dayLabel,
  showActions = true,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function cycleAssignee() {
    const next =
      ASSIGNEE_CYCLE[(ASSIGNEE_CYCLE.indexOf(assignee) + 1) % ASSIGNEE_CYCLE.length];
    startTransition(() => setOccurrenceAssignee(choreId, date, next));
  }

  function markDone() {
    startTransition(() => setOccurrenceStatus(choreId, date, "DONE"));
  }

  function markCancelled() {
    startTransition(() => setOccurrenceStatus(choreId, date, "CANCELLED"));
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border bg-background px-3 py-2.5 text-sm ${
        showActions ? "" : "opacity-70"
      }`}
    >
      <span className="flex-1 truncate">
        {emoji ? `${emoji} ` : ""}
        {title}
        <span className="ml-1.5 text-xs text-muted-foreground">{dayLabel}</span>
      </span>
      <button
        type="button"
        disabled={isPending}
        onClick={cycleAssignee}
        title={assignee ?? "Unassigned"}
        className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
      >
        {assigneeBadge(assignee)}
      </button>
      {showActions && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={markDone}
            className="h-7 shrink-0 rounded-full px-2.5 text-xs"
          >
            Done
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={markCancelled}
            className="h-7 shrink-0 rounded-full px-2.5 text-xs text-muted-foreground"
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
