exports.up = (pgm) => {
  pgm.createTable("tv_tinder_picks", {
    id: "id",
    tmdb_id: { type: "integer", notNull: true },
    media_type: { type: "text", notNull: true },
    title: { type: "text", notNull: true },
    poster_path: { type: "text" },
    overview: { type: "text" },
    release_date: { type: "text" },
    vote_average: { type: "numeric" },
    batch_date: { type: "date", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.addConstraint("tv_tinder_picks", "tv_tinder_picks_media_type_check", {
    check: "media_type in ('movie', 'tv')",
  });

  pgm.addConstraint("tv_tinder_picks", "tv_tinder_picks_tmdb_unique", {
    unique: ["tmdb_id", "media_type"],
  });

  pgm.createIndex("tv_tinder_picks", "batch_date");

  pgm.createTable("tv_tinder_votes", {
    id: "id",
    pick_id: {
      type: "integer",
      notNull: true,
      references: "tv_tinder_picks",
      onDelete: "cascade",
    },
    voter: { type: "text", notNull: true },
    vote: { type: "text", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.addConstraint("tv_tinder_votes", "tv_tinder_votes_vote_check", {
    check: "vote in ('like', 'dislike')",
  });

  pgm.addConstraint("tv_tinder_votes", "tv_tinder_votes_unique", {
    unique: ["pick_id", "voter"],
  });
};

exports.down = (pgm) => {
  pgm.dropTable("tv_tinder_votes");
  pgm.dropTable("tv_tinder_picks");
};
