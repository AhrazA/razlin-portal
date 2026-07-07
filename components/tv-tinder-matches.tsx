import Image from "next/image";
import { TMDB_IMAGE_BASE } from "@/lib/tmdb";
import { type TvTinderMatch } from "@/lib/tv-tinder";

export function TvTinderMatches({ matches }: { matches: TvTinderMatch[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="w-full max-w-md space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground">It&apos;s a match! 🎉</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {matches.map((match) => (
          <div key={match.id} className="w-20 shrink-0 space-y-1">
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl border bg-muted">
              {match.poster_path ? (
                <Image
                  src={`${TMDB_IMAGE_BASE}${match.poster_path}`}
                  alt={match.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xl">🎬</div>
              )}
            </div>
            <p className="line-clamp-2 text-center text-[11px] leading-tight text-muted-foreground">
              {match.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
