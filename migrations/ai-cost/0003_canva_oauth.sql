CREATE TABLE IF NOT EXISTS canva_oauth_states (
  state TEXT PRIMARY KEY NOT NULL,
  code_verifier TEXT NOT NULL,
  return_to TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_canva_oauth_states_exp ON canva_oauth_states (expires_at);

CREATE TABLE IF NOT EXISTS canva_oauth_sessions (
  session_id TEXT PRIMARY KEY NOT NULL,
  canva_user_id TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  scopes TEXT NOT NULL DEFAULT '',
  tokens_enc TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_canva_oauth_sessions_exp ON canva_oauth_sessions (expires_at);
