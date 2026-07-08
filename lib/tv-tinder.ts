import { sql } from "@/lib/db";
import { ASSIGNEES } from "@/lib/constants";
import { fetchTrending, type TmdbTrendingItem } from "@/lib/tmdb";

export type TvTinderPick = {
  id: number;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  overview: string | null;
  release_date: string | null;
  vote_average: string | null;
  batch_date: string;
};

export type TvTinderMatch = TvTinderPick & { matched_at: string };

const BATCH_SIZE = 10;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function generateDailyBatch(size = BATCH_SIZE): Promise<TvTinderPick[]> {
  const todayKey = toDateKey(new Date());

  const existing = await sql<TvTinderPick[]>`
    select id, tmdb_id, media_type, title, poster_path, overview,
      release_date, vote_average::text as vote_average, batch_date::text as batch_date
    from tv_tinder_picks where batch_date = ${todayKey}
  `;
  if (existing.length > 0) return [];

  const seen = await sql<{ tmdb_id: number; media_type: string }[]>`
    select tmdb_id, media_type from tv_tinder_picks
  `;
  const seenKeys = new Set(seen.map((s) => `${s.media_type}:${s.tmdb_id}`));

  const candidates: TmdbTrendingItem[] = [];
  for (const window of ["day", "week"] as const) {
    for (let page = 1; page <= 5 && candidates.length < size * 4; page += 1) {
      const results = await fetchTrending(window, page);
      candidates.push(...results);
    }
  }

  const fresh = candidates.filter(
    (item) =>
      (item.media_type === "movie" || item.media_type === "tv") &&
      !item.adult &&
      item.poster_path &&
      !seenKeys.has(`${item.media_type}:${item.id}`)
  );

  const deduped = new Map(fresh.map((item) => [`${item.media_type}:${item.id}`, item]));
  const shuffled = Array.from(deduped.values()).sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, size);

  const inserted: TvTinderPick[] = [];
  for (const item of chosen) {
    const [row] = await sql<TvTinderPick[]>`
      insert into tv_tinder_picks (
        tmdb_id, media_type, title, poster_path, overview, release_date, vote_average, batch_date
      ) values (
        ${item.id}, ${item.media_type}, ${item.title ?? item.name ?? "Untitled"},
        ${item.poster_path}, ${item.overview}, ${item.release_date ?? item.first_air_date ?? null},
        ${item.vote_average}, ${todayKey}
      )
      on conflict (tmdb_id, media_type) do nothing
      returning id, tmdb_id, media_type, title, poster_path, overview,
        release_date, vote_average::text as vote_average, batch_date::text as batch_date
    `;
    if (row) inserted.push(row);
  }

  return inserted;
}

export async function getTodaysBatch(): Promise<TvTinderPick[]> {
  const todayKey = toDateKey(new Date());
  return sql<TvTinderPick[]>`
    select id, tmdb_id, media_type, title, poster_path, overview,
      release_date, vote_average::text as vote_average, batch_date::text as batch_date
    from tv_tinder_picks
    where batch_date = ${todayKey}
    order by id asc
  `;
}

export async function getUnvotedPicksForVoter(voter: string): Promise<TvTinderPick[]> {
  const todayKey = toDateKey(new Date());
  return sql<TvTinderPick[]>`
    select p.id, p.tmdb_id, p.media_type, p.title, p.poster_path, p.overview,
      p.release_date, p.vote_average::text as vote_average, p.batch_date::text as batch_date
    from tv_tinder_picks p
    where p.batch_date = ${todayKey}
      and not exists (
        select 1 from tv_tinder_votes v where v.pick_id = p.id and v.voter = ${voter}
      )
    order by p.id asc
  `;
}

export async function getMatches(): Promise<TvTinderMatch[]> {
  return sql<TvTinderMatch[]>`
    select p.id, p.tmdb_id, p.media_type, p.title, p.poster_path, p.overview,
      p.release_date, p.vote_average::text as vote_average, p.batch_date::text as batch_date,
      max(v.created_at)::text as matched_at
    from tv_tinder_picks p
    join tv_tinder_votes v on v.pick_id = p.id and v.vote = 'like'
    group by p.id
    having count(distinct v.voter) = ${ASSIGNEES.length}
    order by matched_at desc
  `;
}

export async function castVote(pickId: number, voter: string, vote: "like" | "dislike") {
  await sql`
    insert into tv_tinder_votes (pick_id, voter, vote)
    values (${pickId}, ${voter}, ${vote})
    on conflict (pick_id, voter) do update set vote = excluded.vote
  `;
}
