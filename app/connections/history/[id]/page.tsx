import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConnectionsHistoryBoard } from "@/components/connections-history-board";
import { getPuzzleById, getRevealedBoard } from "@/lib/connections";

export default async function ConnectionsHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const puzzleId = Number(id);
  const puzzle = Number.isFinite(puzzleId) ? await getPuzzleById(puzzleId) : null;
  if (!puzzle) notFound();

  const words = getRevealedBoard(puzzle);

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 bg-gradient-to-br from-background via-secondary/40 to-accent/30 p-6">
      <div className="flex w-full max-w-lg items-center justify-between">
        <Button
          render={<Link href="/connections/history" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          ← Past boards
        </Button>
        <h1 className="font-heading text-2xl italic text-primary">Connections 🧩</h1>
        <span className="w-14" />
      </div>

      <ConnectionsHistoryBoard words={words} />
    </div>
  );
}
