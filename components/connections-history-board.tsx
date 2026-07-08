import { cn } from "@/lib/utils";
import { type ConnectionsBoardWord } from "@/lib/connections";

const LEVEL_STYLES = [
  "bg-yellow-200 text-yellow-900",
  "bg-green-200 text-green-900",
  "bg-blue-200 text-blue-900",
  "bg-purple-200 text-purple-900",
];

export function ConnectionsHistoryBoard({ words }: { words: ConnectionsBoardWord[] }) {
  return (
    <div className="grid w-full max-w-lg grid-cols-4 gap-2">
      {words.map(({ word, solvedLevel }) => (
        <div
          key={word}
          className={cn(
            "flex aspect-square items-center justify-center rounded-lg p-1 text-center text-xs font-semibold uppercase",
            solvedLevel !== null ? (LEVEL_STYLES[solvedLevel] ?? "bg-muted") : "bg-card"
          )}
        >
          {word}
        </div>
      ))}
    </div>
  );
}
