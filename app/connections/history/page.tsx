import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPuzzleHistory } from "@/lib/connections";

export default async function ConnectionsHistoryPage() {
  const history = await getPuzzleHistory();

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button render={<Link href="/connections" />} nativeButton={false} variant="ghost" size="sm">
          ← Today
        </Button>
        <h1 className="font-heading text-2xl italic text-primary">Past boards</h1>
        <span className="w-14" />
      </div>

      {history.length === 0 ? (
        <p className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          No past boards yet — finish today&apos;s puzzle and check back tomorrow.
        </p>
      ) : (
        <ul className="space-y-2">
          {history.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/connections/history/${entry.id}`}
                className="block rounded-xl border bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/20"
              >
                {new Date(`${entry.served_on}T00:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
