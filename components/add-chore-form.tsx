"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createChore } from "@/app/actions/chores";

const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export function AddChoreForm() {
  const [frequencyType, setFrequencyType] = useState<"weekly" | "interval">("weekly");

  return (
    <form
      action={createChore}
      className="flex flex-wrap items-end gap-3 rounded-2xl border bg-card p-4"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Emoji</label>
        <Input name="emoji" maxLength={2} placeholder="🧹" className="w-14 text-center" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Chore</label>
        <Input name="title" placeholder="Do the dishes" required className="w-44" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Frequency</label>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={frequencyType === "weekly" ? "default" : "outline"}
            onClick={() => setFrequencyType("weekly")}
            className="rounded-full"
          >
            Days of week
          </Button>
          <Button
            type="button"
            size="sm"
            variant={frequencyType === "interval" ? "default" : "outline"}
            onClick={() => setFrequencyType("interval")}
            className="rounded-full"
          >
            Every N days
          </Button>
        </div>
      </div>

      <input type="hidden" name="frequencyType" value={frequencyType} />

      {frequencyType === "weekly" ? (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">On</label>
          <div className="flex gap-1.5">
            {DAYS.map((d) => (
              <label
                key={d.value}
                className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground"
              >
                <input type="checkbox" name="days" value={d.value} className="accent-primary" />
                {d.label}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Every</label>
          <Input name="intervalDays" type="number" min={1} defaultValue={2} className="w-16" />
        </div>
      )}

      <Button type="submit" className="rounded-full">
        Add chore
      </Button>
    </form>
  );
}
