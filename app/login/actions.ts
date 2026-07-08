"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PLAYER_COOKIE } from "@/lib/constants";

export async function login(formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (passcode !== process.env.APP_PASSCODE) {
    redirect(`/login?error=1&from=${encodeURIComponent(from)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set("passcode", passcode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  if (!cookieStore.get(PLAYER_COOKIE)?.value) {
    redirect(`/login/player?from=${encodeURIComponent(from)}`);
  }

  redirect(from);
}
