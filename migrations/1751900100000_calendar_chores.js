exports.up = (pgm) => {
  pgm.dropTable("chores");

  pgm.createTable("chores", {
    id: "id",
    title: { type: "text", notNull: true },
    emoji: { type: "text" },
    frequency_type: { type: "text", notNull: true },
    interval_days: { type: "integer" },
    days_of_week: { type: "integer[]" },
    anchor_date: { type: "date", notNull: true, default: pgm.func("current_date") },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.addConstraint("chores", "chores_frequency_type_check", {
    check: "frequency_type in ('interval', 'weekly')",
  });

  pgm.createTable("chore_occurrences", {
    id: "id",
    chore_id: {
      type: "integer",
      notNull: true,
      references: "chores",
      onDelete: "CASCADE",
    },
    date: { type: "date", notNull: true },
    assignee: { type: "text" },
    done: { type: "boolean", notNull: true, default: false },
  });

  pgm.addConstraint("chore_occurrences", "chore_occurrences_chore_date_unique", {
    unique: ["chore_id", "date"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("chore_occurrences");
  pgm.dropTable("chores");
};
