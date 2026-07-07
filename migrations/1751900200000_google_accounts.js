exports.up = (pgm) => {
  pgm.createTable("google_accounts", {
    person: { type: "text", primaryKey: true },
    access_token: { type: "text", notNull: true },
    refresh_token: { type: "text", notNull: true },
    expiry: { type: "timestamptz", notNull: true },
    calendar_id: { type: "text", notNull: true, default: "primary" },
    connected_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("google_accounts");
};
