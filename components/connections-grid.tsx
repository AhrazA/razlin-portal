"use client";

import { useState, useTransition } from "react";
import { requestNewPuzzle, submitGuess } from "@/app/actions/connections";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ConnectionsGuess, type ConnectionsGroup, type ConnectionsBoardWord } from "@/lib/connections";

const LEVEL_STYLES = [
  "bg-yellow-200 text-yellow-900",
  "bg-green-200 text-green-900",
  "bg-blue-200 text-blue-900",
  "bg-purple-200 text-purple-900",
];

export function ConnectionsGrid({
  puzzleId,
  words,
  solvedGroups,
  guesses,
  mistakeCount,
  isWon,
  isLost,
  player,
}: {
  puzzleId: number;
  words: ConnectionsBoardWord[];
  solvedGroups: ConnectionsGroup[];
  guesses: ConnectionsGuess[];
  mistakeCount: number;
  isWon: boolean;
  isLost: boolean;
  player: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [newPuzzleError, setNewPuzzleError] = useState<string | null>(null);

  const remaining = words.filter((w) => w.solvedLevel === null);
  const solvedByLevel = [...solvedGroups].sort((a, b) => a.level - b.level);
  const finished = isWon || isLost;

  function toggle(word: string) {
    if (isPending || finished) return;
    setSelected((prev) => {
      if (prev.includes(word)) return prev.filter((w) => w !== word);
      if (prev.length >= 4) return prev;
      return [...prev, word];
    });
  }

  function submit() {
    if (selected.length !== 4 || isPending) return;
    const guess = selected;
    startTransition(async () => {
      const result = await submitGuess(puzzleId, player, guess);
      setSelected([]);
      if (result && !result.correct) {
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    });
  }

  function getNewPuzzle() {
    if (isPending) return;
    setNewPuzzleError(null);
    startTransition(async () => {
      const result = await requestNewPuzzle();
      if (!result.ok) setNewPuzzleError(result.error ?? "Couldn't get a new puzzle");
    });
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4">
      <div className="flex w-full flex-col gap-2">
        {solvedByLevel.map((group) => (
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

      {!finished && remaining.length > 0 && (
        <div
          className={cn("grid w-full grid-cols-4 gap-2", shake && "animate-[shake_0.4s_ease-in-out]")}
        >
          {remaining.map(({ word }) => (
            <button
              key={word}
              type="button"
              disabled={isPending}
              onClick={() => toggle(word)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border p-1 text-center text-xs font-semibold uppercase transition-colors",
                selected.includes(word)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card hover:bg-accent/20"
              )}
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {!finished && (
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Mistakes</span>
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-2.5 rounded-full",
                  i < mistakeCount ? "bg-destructive" : "bg-muted"
                )}
              />
            ))}
          </div>
          <Button
            size="sm"
            disabled={selected.length !== 4 || isPending}
            onClick={submit}
            className="rounded-full px-6"
          >
            Submit
          </Button>
        </div>
      )}

      {finished && (
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-2xl">{isWon ? "🎉" : "😔"}</span>
          <p className="text-sm text-muted-foreground">
            {isWon
              ? `Solved with ${mistakeCount} mistake${mistakeCount === 1 ? "" : "s"}.`
              : "Out of guesses."}
          </p>
          <Button
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={getNewPuzzle}
            className="rounded-full px-6"
          >
            Get a new puzzle
          </Button>
          {newPuzzleError && <p className="text-xs text-destructive">{newPuzzleError}</p>}
        </div>
      )}

      {guesses.length > 0 && (
        <div className="w-full space-y-1.5 rounded-xl border bg-card p-3">
          <h2 className="text-xs font-medium text-muted-foreground">Guess history</h2>
          <ul className="space-y-1 text-xs">
            {guesses
              .slice()
              .reverse()
              .map((g) => (
                <li key={g.id} className="flex items-center gap-1.5 text-muted-foreground">
                  <span>{g.correct ? "✅" : "❌"}</span>
                  <span className="font-medium text-foreground">{g.guessed_by}</span>
                  <span className="truncate">
                    {g.correct ? g.matched_group : g.words.join(", ")}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
