import { sql } from "@/lib/db";

export type ConnectionsGroup = {
  level: number;
  group: string;
  members: string[];
};

export type ConnectionsPuzzle = {
  id: number;
  answers: ConnectionsGroup[];
};

export type ConnectionsHistoryEntry = {
  id: number;
  served_on: string;
};

export type ConnectionsGuess = {
  id: number;
  guessed_by: string;
  words: string[];
  correct: boolean;
  matched_group: string | null;
  created_at: string;
};

export type ConnectionsBoardWord = {
  word: string;
  solvedLevel: number | null;
};

export type ConnectionsState = {
  puzzleId: number;
  words: ConnectionsBoardWord[];
  answers: ConnectionsGroup[];
  solvedGroups: ConnectionsGroup[];
  guesses: ConnectionsGuess[];
  mistakeCount: number;
  isWon: boolean;
  isLost: boolean;
};

const MAX_MISTAKES = 4;

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  let state = seed || 1;
  function next() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  }
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRevealedBoard(puzzle: ConnectionsPuzzle): ConnectionsBoardWord[] {
  const levelByWord = new Map<string, number>();
  for (const group of puzzle.answers) {
    for (const word of group.members) levelByWord.set(word, group.level);
  }

  const allWords = seededShuffle(
    puzzle.answers.flatMap((a) => a.members),
    puzzle.id
  );
  return allWords.map((word) => ({
    word,
    solvedLevel: levelByWord.get(word) ?? null,
  }));
}

export async function pickDailyPuzzle(): Promise<ConnectionsPuzzle | null> {
  const existing = await getTodaysPuzzle();
  if (existing) return existing;

  return servePuzzle();
}

export async function getTodaysPuzzle(): Promise<ConnectionsPuzzle | null> {
  const todayKey = toDateKey(new Date());
  const [puzzle] = await sql<ConnectionsPuzzle[]>`
    select id, answers from connections_puzzles
    where served_on = ${todayKey}
    order by served_at desc nulls last, id desc
    limit 1
  `;
  return puzzle ?? null;
}

export async function getPuzzleHistory(): Promise<ConnectionsHistoryEntry[]> {
  return sql<ConnectionsHistoryEntry[]>`
    select p.id, p.served_on::text as served_on
    from connections_puzzles p
    where p.served_on is not null
      and (
        (
          select count(distinct g.matched_group) from connections_guesses g
          where g.puzzle_id = p.id and g.correct
        ) >= jsonb_array_length(p.answers)
        or (
          select count(*) from connections_guesses g
          where g.puzzle_id = p.id and not g.correct
        ) >= ${MAX_MISTAKES}
      )
    order by p.served_at desc nulls last, p.id desc
  `;
}

export async function getPuzzleById(id: number): Promise<ConnectionsPuzzle | null> {
  const [puzzle] = await sql<ConnectionsPuzzle[]>`
    select id, answers from connections_puzzles
    where id = ${id} and served_on is not null
  `;
  return puzzle ?? null;
}

async function servePuzzle(): Promise<ConnectionsPuzzle | null> {
  const todayKey = toDateKey(new Date());
  const [picked] = await sql<ConnectionsPuzzle[]>`
    update connections_puzzles
    set served_on = ${todayKey}, served_at = now()
    where id = (
      select id from connections_puzzles
      where served_on is null
      order by random()
      limit 1
    )
    returning id, answers
  `;

  return picked ?? null;
}

export async function requestNewPuzzle(): Promise<ConnectionsPuzzle | null> {
  const current = await getTodaysPuzzle();
  if (current) {
    const state = await getGameState(current);
    if (!state.isWon && !state.isLost) {
      throw new Error("Today's puzzle isn't finished yet");
    }
  }

  const picked = await servePuzzle();
  if (!picked) throw new Error("No more puzzles left to serve");
  return picked;
}

async function getGuesses(puzzleId: number): Promise<ConnectionsGuess[]> {
  return sql<ConnectionsGuess[]>`
    select id, guessed_by, words, correct, matched_group, created_at::text as created_at
    from connections_guesses
    where puzzle_id = ${puzzleId}
    order by created_at asc
  `;
}

export async function getGameState(puzzle: ConnectionsPuzzle): Promise<ConnectionsState> {
  const guesses = await getGuesses(puzzle.id);

  const solvedGroupNames = new Set(
    guesses.filter((g) => g.correct && g.matched_group).map((g) => g.matched_group)
  );
  const solvedGroups = puzzle.answers.filter((a) => solvedGroupNames.has(a.group));
  const mistakeCount = guesses.filter((g) => !g.correct).length;

  const solvedLevelByWord = new Map<string, number>();
  for (const group of solvedGroups) {
    for (const word of group.members) solvedLevelByWord.set(word, group.level);
  }

  const words: ConnectionsBoardWord[] = getRevealedBoard(puzzle).map(({ word }) => ({
    word,
    solvedLevel: solvedLevelByWord.get(word) ?? null,
  }));

  const isWon = solvedGroups.length === puzzle.answers.length;
  const isLost = !isWon && mistakeCount >= MAX_MISTAKES;

  return {
    puzzleId: puzzle.id,
    words,
    answers: puzzle.answers,
    solvedGroups,
    guesses,
    mistakeCount,
    isWon,
    isLost,
  };
}

export async function submitGuess(
  puzzleId: number,
  guessedBy: string,
  words: string[]
): Promise<{ correct: boolean; matchedGroup: string | null }> {
  const [puzzle] = await sql<ConnectionsPuzzle[]>`
    select id, answers from connections_puzzles where id = ${puzzleId}
  `;
  if (!puzzle) throw new Error("Puzzle not found");

  const state = await getGameState(puzzle);
  if (state.isWon || state.isLost) {
    throw new Error("This puzzle is already finished");
  }

  const normalized = new Set(words.map((w) => w.toUpperCase()));
  const match = puzzle.answers.find(
    (group) =>
      group.members.length === normalized.size &&
      group.members.every((m) => normalized.has(m.toUpperCase()))
  );

  await sql`
    insert into connections_guesses (puzzle_id, guessed_by, words, correct, matched_group)
    values (${puzzleId}, ${guessedBy}, ${words}, ${!!match}, ${match?.group ?? null})
  `;

  return { correct: !!match, matchedGroup: match?.group ?? null };
}
