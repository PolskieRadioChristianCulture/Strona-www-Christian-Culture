-- Apply to the existing milion-db. The radio counter's tables and rows are unaffected.
CREATE TABLE IF NOT EXISTS prayer_40dm_confirmations (
  day TEXT NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (day, token)
) WITHOUT ROWID;
