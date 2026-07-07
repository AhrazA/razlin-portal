import { setVoterIdentity } from "@/app/actions/tv-tinder";
import { Button } from "@/components/ui/button";
import { ASSIGNEES } from "@/lib/constants";

export function TvTinderIdentity() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6 text-center">
      <span className="text-5xl">🍿</span>
      <h1 className="font-heading text-3xl italic text-primary">Who&apos;s swiping?</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        This just remembers you on this device — your votes stay hidden from the other person
        until it&apos;s a match.
      </p>
      <form action={setVoterIdentity} className="flex gap-3">
        {ASSIGNEES.map((name) => (
          <Button key={name} type="submit" name="voter" value={name} className="rounded-full px-8">
            {name}
          </Button>
        ))}
      </form>
    </div>
  );
}
