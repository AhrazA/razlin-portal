exports.up = (pgm) => {
  pgm.createTable("push_subscriptions", {
    id: "id",
    endpoint: { type: "text", notNull: true, unique: true },
    p256dh: { type: "text", notNull: true },
    auth: { type: "text", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("push_subscriptions");
};
