-- Session Events Table for Supabase PostgreSQL
-- Analytics and event tracking for user sessions

CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'auth', 'tile_open', 'chat', 'video', 'surprise', etc.
  event_data JSONB, -- JSON data with event-specific information
  ip INET, -- IP address as PostgreSQL INET type
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Reference to Supabase auth users
  user_identifier TEXT, -- 'harper', 'guest', or sessionId for anonymous users
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_events_session_id ON session_events(session_id);
CREATE INDEX IF NOT EXISTS idx_session_events_created_at ON session_events(created_at);
CREATE INDEX IF NOT EXISTS idx_session_events_user_id ON session_events(user_id);
CREATE INDEX IF NOT EXISTS idx_session_events_event_type ON session_events(event_type);
CREATE INDEX IF NOT EXISTS idx_session_events_user_identifier ON session_events(user_identifier);

-- Enable Row Level Security
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own session events" ON session_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all session events" ON session_events
  FOR ALL USING (auth.role() = 'service_role');

-- Function to log session events
CREATE OR REPLACE FUNCTION log_session_event(
  p_session_id TEXT,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT NULL,
  p_ip INET DEFAULT NULL,
  p_user_identifier TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO session_events (
    session_id, event_type, event_data, ip, user_id, user_identifier
  ) VALUES (
    p_session_id, p_event_type, p_event_data, p_ip, auth.uid(), p_user_identifier
  ) RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

