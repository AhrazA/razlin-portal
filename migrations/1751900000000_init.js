exports.up = (pgm) => {
  pgm.createTable("chores", {
    id: "id",
    title: { type: "text", notNull: true },
    assignee: { type: "text" },
    done: { type: "boolean", notNull: true, default: false },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("chores");
};
