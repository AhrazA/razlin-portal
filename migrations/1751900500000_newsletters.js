exports.up = (pgm) => {
  pgm.createTable("newsletters", {
    id: "id",
    week_start: { type: "date", notNull: true },
    week_end: { type: "date", notNull: true },
    content: { type: "text", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("newsletters");
};
