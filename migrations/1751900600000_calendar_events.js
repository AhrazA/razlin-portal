exports.up = (pgm) => {
  pgm.createTable("calendar_events", {
    id: "id",
    google_event_id: { type: "text", notNull: true },
    person: { type: "text", notNull: true },
    title: { type: "text", notNull: true },
    date: { type: "date", notNull: true },
    synced_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.addConstraint("calendar_events", "calendar_events_person_event_unique", {
    unique: ["person", "google_event_id"],
  });

  pgm.createIndex("calendar_events", ["date"]);
};

exports.down = (pgm) => {
  pgm.dropTable("calendar_events");
};
