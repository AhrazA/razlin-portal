"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ASSIGNEES, PLAYER_COOKIE } from "@/lib/constants";

export async function setPlayerIdentity(formData: FormData) {
  const player = String(formData.get("player") ?? "");
  if (!ASSIGNEES.includes(player as (typeof ASSIGNEES)[number])) return;

  const cookieStore = await cookies();
  cookieStore.set(PLAYER_COOKIE, player, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  const returnTo = String(formData.get("returnTo") ?? "/");
  revalidatePath(returnTo);
}
