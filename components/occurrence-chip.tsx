"use client";

import { useTransition } from "react";
import { setOccurrenceAssignee, setOccurrenceDone } from "@/app/actions/chores";
import { ASSIGNEES } from "@/lib/constants";

type Props = {
  choreId: number;
  date: string;
  emoji: string | null;
  title: string;
  assignee: string | null;
  done: boolean;
};

const ASSIGNEE_CYCLE: (string | null)[] = [null, ...ASSIGNEES];

export function OccurrenceChip({ choreId, date, emoji, title, assignee, done }: Props) {
  const [isPending, startTransition] = useTransition();

  function cycleAssignee() {
    const next =
      ASSIGNEE_CYCLE[(ASSIGNEE_CYCLE.indexOf(assignee) + 1) % ASSIGNEE_CYCLE.length];
    startTransition(() => setOccurrenceAssignee(choreId, date, next));
  }

  function toggleDone() {
    startTransition(() => setOccurrenceDone(choreId, date, !done));
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
        done ? "bg-secondary/50 text-muted-foreground" : "bg-background"
      }`}
    >
      <button
        type="button"
        disabled={isPending}
        onClick={toggleDone}
        className={`flex-1 truncate text-left ${done ? "line-through" : ""}`}
      >
        {emoji ? `${emoji} ` : ""}
        {title}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={cycleAssignee}
        title={assignee ?? "Unassigned"}
        className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
      >
        {assignee ? assignee[0] : "?"}
      </button>
    </div>
  );
}
