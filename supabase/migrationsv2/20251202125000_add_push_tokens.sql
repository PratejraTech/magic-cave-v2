/*
  # User Push Tokens Table
  Stores FCM tokens for push notifications
*/

CREATE TABLE IF NOT EXISTS user_push_tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  device_info JSONB, -- browser, OS, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fcm_token)
);

-- Indexes
CREATE INDEX idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX idx_user_push_tokens_fcm_token ON user_push_tokens(fcm_token);

-- Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own push tokens" ON user_push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Function to register push token
CREATE OR REPLACE FUNCTION register_push_token(
  p_user_id UUID,
  p_fcm_token TEXT,
  p_device_info JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO user_push_tokens (user_id, fcm_token, device_info)
  VALUES (p_user_id, p_fcm_token, p_device_info)
  ON CONFLICT (user_id, fcm_token) DO UPDATE SET
    device_info = EXCLUDED.device_info,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;