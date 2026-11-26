CREATE TABLE IF NOT EXISTS ai_feedback (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('opinion', 'thumbs_up', 'thumbs_down', 'favorite')),
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  category TEXT NOT NULL DEFAULT 'brak',
  comment TEXT NOT NULL DEFAULT '',
  assistant_id TEXT NOT NULL DEFAULT 'ai-dla-jezusa',
  mode TEXT NOT NULL DEFAULT 'CC Auto',
  model_id TEXT NOT NULL DEFAULT 'auto',
  prompt_excerpt TEXT NOT NULL DEFAULT '',
  reply_excerpt TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_created_at ON ai_feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_kind ON ai_feedback (kind);
