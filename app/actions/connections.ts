"use server";

import { revalidatePath } from "next/cache";
import { ASSIGNEES } from "@/lib/constants";
import {
  pickDailyPuzzle,
  requestNewPuzzle as requestNewPuzzleInDb,
  submitGuess as submitGuessInDb,
} from "@/lib/connections";

export async function submitGuess(puzzleId: number, guessedBy: string, words: string[]) {
  if (!ASSIGNEES.includes(guessedBy as (typeof ASSIGNEES)[number])) return null;
  if (words.length !== 4) return null;

  const result = await submitGuessInDb(puzzleId, guessedBy, words);
  revalidatePath("/connections");
  return result;
}

export async function generateTodaysPuzzle() {
  await pickDailyPuzzle();
  revalidatePath("/connections");
}

export async function requestNewPuzzle() {
  try {
    await requestNewPuzzleInDb();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Couldn't get a new puzzle" };
  }
  revalidatePath("/connections");
  return { ok: true };
}
