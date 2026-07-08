import Link from "next/link";
import { cookies } from "next/headers";
import { PLAYER_COOKIE } from "@/lib/constants";
import { getMatches, getTodaysBatch, getUnvotedPicksForVoter } from "@/lib/tv-tinder";
import { generateTodaysBatch } from "@/app/actions/tv-tinder";
import { PlayerIdentity } from "@/components/player-identity";
import { TvTinderDeck } from "@/components/tv-tinder-deck";
import { TvTinderMatches } from "@/components/tv-tinder-matches";
import { Button } from "@/components/ui/button";

export default async function TvTinderPage() {
  const cookieStore = await cookies();
  const voter = cookieStore.get(PLAYER_COOKIE)?.value;

  if (!voter) {
    return (
      <PlayerIdentity
        emoji="🍿"
        heading="Who's swiping?"
        description="This just remembers you on this device — your votes stay hidden from the other person until it's a match."
        returnTo="/tv-tinder"
      />
    );
  }

  const [batch, picks, matches] = await Promise.all([
    getTodaysBatch(),
    getUnvotedPicksForVoter(voter),
    getMatches(),
  ]);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6">
      <div className="flex w-full max-w-md items-center justify-between">
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm">
          ← Home
        </Button>
        <h1 className="font-heading text-2xl italic text-primary">TV Tinder 🍿</h1>
        <span className="w-14" />
      </div>

      {batch.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🎬</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            No picks yet today — they usually show up automatically, but you can grab a set now.
          </p>
          <form action={generateTodaysBatch}>
            <Button type="submit" className="rounded-full px-8">
              Get today&apos;s picks
            </Button>
          </form>
        </div>
      ) : (
        <TvTinderDeck picks={picks} voter={voter} />
      )}

      <TvTinderMatches matches={matches} />
    </div>
  );
}
