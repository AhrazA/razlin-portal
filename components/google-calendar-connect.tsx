import { Button } from "@/components/ui/button";

export function GoogleCalendarConnect({
  connected,
  people,
}: {
  connected: string[];
  people: readonly string[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
      <span className="text-xs text-muted-foreground">Google Calendar</span>
      {people.map((person) => {
        const isConnected = connected.includes(person);
        return isConnected ? (
          <form key={person} method="POST" action={`/api/google/disconnect?person=${person}`}>
            <Button variant="outline" size="sm" type="submit" className="rounded-full">
              {person} connected ✓
            </Button>
          </form>
        ) : (
          <Button
            key={person}
            render={<a href={`/api/google/connect?person=${person}`} />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="rounded-full"
          >
            Connect {person}
          </Button>
        );
      })}
    </div>
  );
}
