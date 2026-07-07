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
      className={`flex items-center gap-1 rounded-lg border px-1.5 py-1 text-[11px] leading-tight ${
        done ? "bg-secondary/50 text-muted-foreground" : "bg-card"
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
        className="shrink-0 rounded-full bg-primary/15 px-1.5 text-[10px] font-medium text-primary"
      >
        {assignee ? assignee[0] : "?"}
      </button>
    </div>
  );
}
