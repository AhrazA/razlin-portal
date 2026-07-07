exports.up = (pgm) => {
  pgm.addColumn("chore_occurrences", {
    status: { type: "text", notNull: true, default: "PENDING" },
  });

  pgm.sql(
    "update chore_occurrences set status = case when done then 'DONE' else 'PENDING' end"
  );

  pgm.addConstraint("chore_occurrences", "chore_occurrences_status_check", {
    check: "status in ('PENDING', 'DONE', 'CANCELLED')",
  });

  pgm.dropColumn("chore_occurrences", "done");
};

exports.down = (pgm) => {
  pgm.addColumn("chore_occurrences", {
    done: { type: "boolean", notNull: true, default: false },
  });

  pgm.sql("update chore_occurrences set done = (status = 'DONE')");

  pgm.dropConstraint("chore_occurrences", "chore_occurrences_status_check");
  pgm.dropColumn("chore_occurrences", "status");
};
