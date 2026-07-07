"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ASSIGNEES, TV_TINDER_VOTER_COOKIE } from "@/lib/constants";
import { castVote as castVoteInDb, generateDailyBatch } from "@/lib/tv-tinder";

export async function setVoterIdentity(formData: FormData) {
  const voter = String(formData.get("voter") ?? "");
  if (!ASSIGNEES.includes(voter as (typeof ASSIGNEES)[number])) return;

  const cookieStore = await cookies();
  cookieStore.set(TV_TINDER_VOTER_COOKIE, voter, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/tv-tinder");
}

export async function vote(pickId: number, voter: string, decision: "like" | "dislike") {
  if (!ASSIGNEES.includes(voter as (typeof ASSIGNEES)[number])) return;
  await castVoteInDb(pickId, voter, decision);
  revalidatePath("/tv-tinder");
}

export async function generateTodaysBatch() {
  await generateDailyBatch();
  revalidatePath("/tv-tinder");
}
