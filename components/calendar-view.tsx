"use client";

import { useState } from "react";
import { OccurrenceChip } from "@/components/occurrence-chip";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type DayItem = {
  choreId: number;
  date: string;
  emoji: string | null;
  title: string;
  assignee: string | null;
  done: boolean;
};

export type DayData = {
  dateKey: string;
  dayNumber: number;
  monthLabel: string | null;
  label: string;
  isToday: boolean;
  items: DayItem[];
};

export function CalendarView({ days, todayKey }: { days: DayData[]; todayKey: string }) {
  const [selected, setSelected] = useState(todayKey);
  const selectedDay = days.find((d) => d.dateKey === selected) ?? days[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
        {days.map((day) => {
          const isSelected = day.dateKey === selected;
          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => setSelected(day.dateKey)}
              className="flex flex-col items-center gap-0.5 rounded-lg py-1.5"
            >
              {day.monthLabel && (
                <span className="text-[9px] font-medium text-muted-foreground">
                  {day.monthLabel}
                </span>
              )}
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  day.isToday && "bg-primary text-primary-foreground",
                  !day.isToday && isSelected && "border border-primary text-primary"
                )}
              >
                {day.dayNumber}
              </span>
              <span className="flex h-1.5 gap-0.5">
                {day.items.slice(0, 4).map((item, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.done ? "bg-muted-foreground/40" : "bg-primary"
                    )}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2 rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          {selectedDay.dateKey === todayKey ? "Today" : selectedDay.label}
        </h2>
        {selectedDay.items.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing scheduled 🎉</p>
        )}
        <div className="space-y-1.5">
          {selectedDay.items.map((item) => (
            <OccurrenceChip
              key={item.choreId}
              choreId={item.choreId}
              date={item.date}
              emoji={item.emoji}
              title={item.title}
              assignee={item.assignee}
              done={item.done}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
