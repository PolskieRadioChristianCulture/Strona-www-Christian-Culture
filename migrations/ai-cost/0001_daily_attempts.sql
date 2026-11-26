CREATE TABLE IF NOT EXISTS ai_daily_attempts (
  day TEXT PRIMARY KEY NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts > 0)
);
