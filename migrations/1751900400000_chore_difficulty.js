exports.up = (pgm) => {
  pgm.addColumn("chores", {
    difficulty: { type: "text", notNull: true, default: "EASY" },
  });

  pgm.addConstraint("chores", "chores_difficulty_check", {
    check: "difficulty in ('EASY', 'MEDIUM', 'HARD')",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint("chores", "chores_difficulty_check");
  pgm.dropColumn("chores", "difficulty");
};
