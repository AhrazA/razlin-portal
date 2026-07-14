"use client";

import { useState } from "react";
import { OccurrenceChip } from "@/components/occurrence-chip";
import { type ChoreOccurrenceStatus } from "@/lib/calendar";
import { assigneeBadge } from "@/lib/constants";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type DayItem = {
  choreId: number;
  date: string;
  emoji: string | null;
  title: string;
  assignee: string | null;
  status: ChoreOccurrenceStatus;
};

export type GoogleEventItem = {
  id: string;
  title: string;
  person: string;
};

export type DayData = {
  dateKey: string;
  dayNumber: number;
  monthLabel: string | null;
  label: string;
  isToday: boolean;
  items: DayItem[];
  googleEvents: GoogleEventItem[];
};

export function CalendarView({
  days,
  todayKey,
  highlightedChoreId = null,
}: {
  days: DayData[];
  todayKey: string;
  highlightedChoreId?: number | null;
}) {
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
              <span className="flex flex-wrap justify-center gap-0.5">
                {day.items.slice(0, 4).map((item, i) => (
                  <span
                    key={i}
                    className={cn(
                      "flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-semibold leading-none transition-transform",
                      item.status !== "PENDING"
                        ? "bg-muted-foreground/30 text-muted-foreground"
                        : "bg-primary text-primary-foreground",
                      item.choreId === highlightedChoreId &&
                        "scale-125 ring-2 ring-accent-foreground ring-offset-1 ring-offset-background"
                    )}
                  >
                    {assigneeBadge(item.assignee)}
                  </span>
                ))}
                {day.googleEvents.slice(0, 4).map((event) => (
                  <span
                    key={event.id}
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-[3px] bg-sky-500/80 text-[8px] font-semibold leading-none text-white"
                  >
                    {event.person[0]}
                  </span>
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
        {selectedDay.items.length === 0 && selectedDay.googleEvents.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing scheduled 🎉</p>
        )}
        <div className="space-y-1.5">
          {selectedDay.googleEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5 text-sm"
            >
              <span className="flex-1 truncate">📅 {event.title}</span>
              <span className="shrink-0 rounded-full bg-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-700">
                {event.person}
              </span>
            </div>
          ))}
          {selectedDay.items.map((item) => (
            <OccurrenceChip
              key={item.choreId}
              choreId={item.choreId}
              date={item.date}
              emoji={item.emoji}
              title={item.title}
              assignee={item.assignee}
              status={item.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
