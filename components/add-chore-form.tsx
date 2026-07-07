"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createChore } from "@/app/actions/chores";
import { toDateKey } from "@/lib/calendar";
import { cn } from "@/lib/utils";

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
  const [days, setDays] = useState<number[]>([]);
  const [intervalDays, setIntervalDays] = useState(2);
  const [anchorDate, setAnchorDate] = useState(() => toDateKey(new Date()));

  function toggleDay(value: number) {
    setDays((prev) => (prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]));
  }

  return (
    <form action={createChore} className="flex flex-col gap-4 rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Chore</label>
          <Input name="title" placeholder="Do the dishes" required className="h-11 w-48" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Icon</label>
          <Input
            name="emoji"
            inputMode="text"
            maxLength={4}
            placeholder="🧹"
            className="h-11 w-16 text-center text-xl"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">Frequency</label>
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant={frequencyType === "weekly" ? "default" : "outline"}
              onClick={() => setFrequencyType("weekly")}
              className="h-11 rounded-full px-4"
            >
              Days of week
            </Button>
            <Button
              type="button"
              size="sm"
              variant={frequencyType === "interval" ? "default" : "outline"}
              onClick={() => setFrequencyType("interval")}
              className="h-11 rounded-full px-4"
            >
              Every N days
            </Button>
          </div>
        </div>

        <input type="hidden" name="frequencyType" value={frequencyType} />

        {frequencyType === "interval" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Every</label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-11 rounded-full text-lg"
                onClick={() => setIntervalDays((n) => Math.max(1, n - 1))}
              >
                −
              </Button>
              <Input
                name="intervalDays"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Math.max(1, Number(e.target.value) || 1))}
                className="h-11 w-16 text-center text-base"
              />
              <Button
                type="button"
                variant="outline"
                className="h-11 w-11 rounded-full text-lg"
                onClick={() => setIntervalDays((n) => n + 1)}
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        )}

        {frequencyType === "interval" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Starting</label>
            <Input
              name="anchorDate"
              type="date"
              value={anchorDate}
              onChange={(e) => setAnchorDate(e.target.value)}
              className="h-11"
            />
          </div>
        )}
      </div>

      {frequencyType === "weekly" && (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">On</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => toggleDay(d.value)}
                className={cn(
                  "h-11 min-w-12 rounded-full border text-sm font-medium transition-colors",
                  days.includes(d.value)
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "bg-background text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
          {days.map((d) => (
            <input key={d} type="hidden" name="days" value={d} />
          ))}
        </div>
      )}

      <Button type="submit" size="lg" className="self-start rounded-full">
        Add chore
      </Button>
    </form>
  );
}
