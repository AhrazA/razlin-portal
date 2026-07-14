const TMDB_BASE = "https://api.themoviedb.org/3";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w780";

export function tmdbTitleUrl(mediaType: "movie" | "tv", tmdbId: number): string {
  return `https://www.themoviedb.org/${mediaType}/${tmdbId}`;
}

export type TmdbTrendingItem = {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  adult?: boolean;
};

async function tmdbFetch<T>(path: string): Promise<T> {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_ACCESS_TOKEN is not configured");

  const res = await fetch(`${TMDB_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status} ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchTrending(
  window: "day" | "week",
  page: number
): Promise<TmdbTrendingItem[]> {
  const data = await tmdbFetch<{ results: TmdbTrendingItem[] }>(
    `/trending/all/${window}?page=${page}`
  );
  return data.results;
}
