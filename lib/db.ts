import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __sql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  global.__sql ??
  postgres(process.env.DATABASE_URL!, {
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  global.__sql = sql;
}
