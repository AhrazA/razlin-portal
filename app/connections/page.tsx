import Link from "next/link";
import { cookies } from "next/headers";
import { PLAYER_COOKIE } from "@/lib/constants";
import { getGameState, getTodaysPuzzle } from "@/lib/connections";
import { generateTodaysPuzzle } from "@/app/actions/connections";
import { ConnectionsGrid } from "@/components/connections-grid";
import { ConnectionsRules } from "@/components/connections-rules";
import { LiveSync } from "@/components/live-sync";
import { Button } from "@/components/ui/button";

export default async function ConnectionsPage() {
  const cookieStore = await cookies();
  // proxy.ts redirects to /login/player before this page can render without the cookie set
  const player = cookieStore.get(PLAYER_COOKIE)!.value;

  const puzzle = await getTodaysPuzzle();
  const state = puzzle ? await getGameState(puzzle) : null;

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6">
      <LiveSync />
      <div className="flex w-full max-w-lg items-center justify-between">
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm">
          ← Home
        </Button>
        <h1 className="font-heading text-2xl italic text-primary">Connections 🧩</h1>
        <Button render={<Link href="/connections/history" />} nativeButton={false} variant="ghost" size="sm">
          History
        </Button>
      </div>

      {!state ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🧩</span>
          <p className="max-w-xs text-sm text-muted-foreground">
            No puzzle yet today — they usually show up automatically, but you can grab one now.
          </p>
          <form action={generateTodaysPuzzle}>
            <Button type="submit" className="rounded-full px-8">
              Get today&apos;s puzzle
            </Button>
          </form>
        </div>
      ) : (
        <ConnectionsGrid
          puzzleId={state.puzzleId}
          words={state.words}
          answers={state.answers}
          solvedGroups={state.solvedGroups}
          guesses={state.guesses}
          mistakeCount={state.mistakeCount}
          isWon={state.isWon}
          isLost={state.isLost}
          player={player}
        />
      )}

      <ConnectionsRules />
    </div>
  );
}
