"use server";

import { revalidatePath } from "next/cache";
import { ASSIGNEES } from "@/lib/constants";
import { pickDailyPuzzle, submitGuess as submitGuessInDb } from "@/lib/connections";

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
