"use server";

import { revalidatePath } from "next/cache";
import { ASSIGNEES } from "@/lib/constants";
import { castVote as castVoteInDb, generateDailyBatch } from "@/lib/tv-tinder";

export async function vote(pickId: number, voter: string, decision: "like" | "dislike") {
  if (!ASSIGNEES.includes(voter as (typeof ASSIGNEES)[number])) return;
  await castVoteInDb(pickId, voter, decision);
  revalidatePath("/tv-tinder");
}

export async function generateTodaysBatch() {
  await generateDailyBatch();
  revalidatePath("/tv-tinder");
}
