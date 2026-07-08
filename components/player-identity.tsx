import { setPlayerIdentity } from "@/app/actions/player";
import { Button } from "@/components/ui/button";
import { ASSIGNEES } from "@/lib/constants";

export function PlayerIdentity({
  emoji,
  heading,
  description,
  returnTo,
}: {
  emoji: string;
  heading: string;
  description: string;
  returnTo: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6 text-center">
      <span className="text-5xl">{emoji}</span>
      <h1 className="font-heading text-3xl italic text-primary">{heading}</h1>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      <form action={setPlayerIdentity} className="flex gap-3">
        <input type="hidden" name="returnTo" value={returnTo} />
        {ASSIGNEES.map((name) => (
          <Button key={name} type="submit" name="player" value={name} className="rounded-full px-8">
            {name}
          </Button>
        ))}
      </form>
    </div>
  );
}
