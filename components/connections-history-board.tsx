import { cn } from "@/lib/utils";
import { type ConnectionsGroup } from "@/lib/connections";

const LEVEL_STYLES = [
  "bg-yellow-200 text-yellow-900",
  "bg-green-200 text-green-900",
  "bg-blue-200 text-blue-900",
  "bg-purple-200 text-purple-900",
];

export function ConnectionsHistoryBoard({ answers }: { answers: ConnectionsGroup[] }) {
  const sorted = [...answers].sort((a, b) => a.level - b.level);

  return (
    <div className="flex w-full max-w-lg flex-col gap-2">
      {sorted.map((group) => (
        <div
          key={group.group}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl py-3 text-center",
            LEVEL_STYLES[group.level] ?? "bg-muted"
          )}
        >
          <span className="text-xs font-semibold tracking-wide uppercase">{group.group}</span>
          <span className="text-sm">{group.members.join(", ")}</span>
        </div>
      ))}
    </div>
  );
}
