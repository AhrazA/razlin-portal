export type Chore = {
  id: number;
  title: string;
  emoji: string | null;
  frequency_type: "interval" | "weekly";
  interval_days: number | null;
  days_of_week: number[] | null;
  anchor_date: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

export type ChoreOccurrenceStatus = "PENDING" | "DONE" | "CANCELLED";

const MS_PER_DAY = 86_400_000;

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function getNextWeekRange(today: Date): { startKey: string; endKey: string } {
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6);
  return { startKey: toDateKey(today), endKey: toDateKey(end) };
}

export function getCalendarDays(today: Date, weeks = 4): Date[] {
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function choreOccursOn(chore: Chore, date: Date): boolean {
  if (chore.frequency_type === "interval") {
    const anchor = parseDateKey(chore.anchor_date);
    const diffDays = Math.round((date.getTime() - anchor.getTime()) / MS_PER_DAY);
    return diffDays >= 0 && diffDays % (chore.interval_days ?? 1) === 0;
  }
  return (chore.days_of_week ?? []).includes(date.getDay());
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function describeFrequency(chore: Chore): string {
  if (chore.frequency_type === "interval") {
    return chore.interval_days === 1 ? "Every day" : `Every ${chore.interval_days} days`;
  }
  return (chore.days_of_week ?? [])
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAY_LABELS[d])
    .join(", ");
}
