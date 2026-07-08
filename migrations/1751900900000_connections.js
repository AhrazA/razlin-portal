exports.up = (pgm) => {
  pgm.createTable("connections_puzzles", {
    id: "id",
    source_id: { type: "integer", notNull: true, unique: true },
    source_date: { type: "date" },
    answers: { type: "jsonb", notNull: true },
    served_on: { type: "date" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createIndex("connections_puzzles", "served_on");

  pgm.createTable("connections_guesses", {
    id: "id",
    puzzle_id: {
      type: "integer",
      notNull: true,
      references: "connections_puzzles",
      onDelete: "cascade",
    },
    guessed_by: { type: "text", notNull: true },
    words: { type: "text[]", notNull: true },
    correct: { type: "boolean", notNull: true },
    matched_group: { type: "text" },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.createIndex("connections_guesses", "puzzle_id");
};

exports.down = (pgm) => {
  pgm.dropTable("connections_guesses");
  pgm.dropTable("connections_puzzles");
};
