import postgres from "postgres";

const SOURCE_URL =
  "https://raw.githubusercontent.com/Eyefyre/NYT-Connections-Answers/main/connections.json";

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });

  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Failed to fetch puzzle bank: ${res.status}`);
  const puzzles = await res.json();

  let inserted = 0;
  for (const puzzle of puzzles) {
    const result = await sql`
      insert into connections_puzzles (source_id, source_date, answers)
      values (${puzzle.id}, ${puzzle.date}, ${sql.json(puzzle.answers)})
      on conflict (source_id) do nothing
      returning id
    `;
    if (result.length > 0) inserted += 1;
  }

  console.log(`Imported ${inserted} new puzzles (${puzzles.length} total in source).`);
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
