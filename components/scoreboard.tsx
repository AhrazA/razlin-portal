import { ASSIGNEES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Scoreboard({ scores }: { scores: Record<string, number> }) {
  const ranked = ASSIGNEES.map((name) => ({ name, points: scores[name] ?? 0 })).sort(
    (a, b) => b.points - a.points
  );
  const topScore = ranked[0]?.points ?? 0;

  return (
    <div className="space-y-2 rounded-2xl border bg-card p-4">
      <h2 className="text-sm font-medium text-muted-foreground">Scoreboard</h2>
      <div className="flex gap-2">
        {ranked.map((entry) => (
          <div
            key={entry.name}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-xl border px-3 py-2.5",
              entry.points > 0 && entry.points === topScore
                ? "border-primary bg-primary/10"
                : "bg-background"
            )}
          >
            <span className="text-xs font-medium text-muted-foreground">
              {entry.points > 0 && entry.points === topScore ? "🏆 " : ""}
              {entry.name}
            </span>
            <span className="font-heading text-2xl italic text-primary">{entry.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
