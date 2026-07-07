import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { ASSIGNEES } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const person = request.nextUrl.searchParams.get("person") ?? "";
  if (ASSIGNEES.includes(person as (typeof ASSIGNEES)[number])) {
    await sql`delete from google_accounts where person = ${person}`;
    revalidatePath("/chores");
  }
  return NextResponse.redirect(new URL("/chores", request.nextUrl.origin));
}
