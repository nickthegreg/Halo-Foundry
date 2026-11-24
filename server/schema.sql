-- Daily moon leaderboard: one row per player per day (their first attempt)
CREATE TABLE IF NOT EXISTS scores (
  day   TEXT    NOT NULL,   -- the daily moon's date, YYYY-MM-DD
  cid   TEXT    NOT NULL,   -- random id kept in the player's browser
  name  TEXT    NOT NULL,
  score INTEGER NOT NULL,
  mod   TEXT,               -- that day's moon modifier
  ver   INTEGER,            -- game update number
  iph   TEXT,               -- hashed IP, only for the per-day entry limit
  at    INTEGER,            -- posted at (ms)
  PRIMARY KEY (day, cid)
);
CREATE INDEX IF NOT EXISTS scores_by_day ON scores (day, score DESC);
