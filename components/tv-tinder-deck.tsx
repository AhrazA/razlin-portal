"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { vote } from "@/app/actions/tv-tinder";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TMDB_IMAGE_BASE, tmdbTitleUrl } from "@/lib/tmdb";
import { type TvTinderPick } from "@/lib/tv-tinder";

const SWIPE_THRESHOLD = 100;

function Poster({ pick }: { pick: TvTinderPick }) {
  return pick.poster_path ? (
    <>
      <Image
        src={`${TMDB_IMAGE_BASE}${pick.poster_path}`}
        alt=""
        aria-hidden
        fill
        sizes="(max-width: 448px) 92vw, 448px"
        className="pointer-events-none scale-110 object-cover blur-xl brightness-75"
        draggable={false}
      />
      <Image
        src={`${TMDB_IMAGE_BASE}${pick.poster_path}`}
        alt={pick.title}
        fill
        sizes="(max-width: 448px) 92vw, 448px"
        className="pointer-events-none object-contain"
        draggable={false}
        priority
      />
    </>
  ) : (
    <div className="flex size-full items-center justify-center bg-muted text-4xl">🎬</div>
  );
}

function Card({
  pick,
  onDecide,
  isTop,
}: {
  pick: TvTinderPick;
  onDecide: (decision: "like" | "dislike") => void;
  isTop: boolean;
}) {
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [leaving, setLeaving] = useState<"like" | "dislike" | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    if (!isTop || leaving) return;
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0 });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!start.current) return;
    setDrag({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
  }

  function handlePointerUp() {
    if (!start.current || !drag) return;
    start.current = null;
    if (Math.abs(drag.x) > SWIPE_THRESHOLD) {
      const decision = drag.x > 0 ? "like" : "dislike";
      setLeaving(decision);
      setTimeout(() => onDecide(decision), 150);
    } else {
      setDrag(null);
    }
  }

  const rotation = drag ? drag.x / 18 : 0;
  const flyX = leaving === "like" ? 600 : leaving === "dislike" ? -600 : (drag?.x ?? 0);
  const flyY = leaving ? 40 : (drag?.y ?? 0);
  const likeOpacity = drag && drag.x > 0 ? Math.min(drag.x / SWIPE_THRESHOLD, 1) : 0;
  const nopeOpacity = drag && drag.x < 0 ? Math.min(-drag.x / SWIPE_THRESHOLD, 1) : 0;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={cn(
        "absolute inset-0 flex touch-none flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl select-none",
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none scale-[0.96]"
      )}
      style={{
        transform: `translate(${flyX}px, ${flyY}px) rotate(${leaving ? (leaving === "like" ? 20 : -20) : rotation}deg)`,
        transition: drag && !leaving ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
        opacity: leaving ? 0 : 1,
      }}
    >
      <div className="relative min-h-0 flex-[2] overflow-hidden bg-muted">
        <Poster pick={pick} />
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2 py-0.5 text-xs font-medium text-primary shadow">
          {pick.media_type === "movie" ? "🎬 Movie" : "📺 TV"}
        </span>
        <div
          className="absolute top-6 left-6 -rotate-12 rounded-lg border-4 border-primary px-3 py-1 text-2xl font-bold text-primary uppercase"
          style={{ opacity: likeOpacity }}
        >
          Like
        </div>
        <div
          className="absolute top-6 right-6 rotate-12 rounded-lg border-4 border-muted-foreground px-3 py-1 text-2xl font-bold text-muted-foreground uppercase"
          style={{ opacity: nopeOpacity }}
        >
          Nope
        </div>
      </div>
      <div className="flex min-h-0 flex-[1] flex-col gap-2 overflow-hidden bg-card p-5">
        <div className="flex items-start justify-between gap-2">
          <h2 className="line-clamp-2 font-heading text-2xl leading-tight italic text-primary">
            {pick.title}
          </h2>
          <a
            href={tmdbTitleUrl(pick.media_type, pick.tmdb_id)}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            className="mt-1 shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-primary"
          >
            TMDB ↗
          </a>
        </div>
        {pick.overview && (
          <p className="line-clamp-3 text-sm text-muted-foreground">{pick.overview}</p>
        )}
      </div>
    </div>
  );
}

export function TvTinderDeck({ picks, voter }: { picks: TvTinderPick[]; voter: string }) {
  const [stack, setStack] = useState(picks);
  const [, startTransition] = useTransition();

  function decide(pickId: number, decision: "like" | "dislike") {
    setStack((prev) => prev.filter((p) => p.id !== pickId));
    startTransition(() => {
      vote(pickId, voter, decision);
    });
  }

  if (stack.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <span className="text-4xl">✨</span>
        <p className="text-sm text-muted-foreground">
          You&apos;re all caught up — check back tomorrow for new picks.
        </p>
      </div>
    );
  }

  const visible = stack.slice(0, 3);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative aspect-[3/4] max-h-[65vh] w-full max-w-md">
        {visible
          .slice()
          .reverse()
          .map((pick) => (
            <Card
              key={pick.id}
              pick={pick}
              isTop={pick.id === visible[0].id}
              onDecide={(decision) => decide(pick.id, decision)}
            />
          ))}
      </div>
      <div className="flex gap-8">
        <Button
          variant="outline"
          size="lg"
          className="size-16 rounded-full p-0 text-3xl"
          onClick={() => decide(visible[0].id, "dislike")}
        >
          ✕
        </Button>
        <Button
          size="lg"
          className="size-16 rounded-full p-0 text-3xl"
          onClick={() => decide(visible[0].id, "like")}
        >
          ♥
        </Button>
      </div>
    </div>
  );
}
