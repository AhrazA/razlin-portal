exports.up = (pgm) => {
  pgm.addColumn("connections_puzzles", {
    served_at: { type: "timestamptz" },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("connections_puzzles", "served_at");
};
