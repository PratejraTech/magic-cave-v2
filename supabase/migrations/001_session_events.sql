-- Session Events Table for D1 Database
-- This schema is for Cloudflare D1, not Supabase
-- Use this as reference when creating the D1 database

CREATE TABLE IF NOT EXISTS session_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'auth', 'tile_open', 'chat', 'video', 'surprise', etc.
  event_data TEXT, -- JSON string with event-specific data
  ip TEXT,
  user_id TEXT, -- 'harper', 'guest', or sessionId for normal users
  timestamp TEXT NOT NULL -- ISO timestamp
);

CREATE INDEX IF NOT EXISTS idx_session_id ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON session_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_id ON session_events(user_id);
CREATE INDEX IF NOT EXISTS idx_event_type ON session_events(event_type);

