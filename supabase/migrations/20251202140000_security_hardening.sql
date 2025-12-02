-- Security Hardening Migration
-- Adds password hashing, audit logging, and rate limiting tables

-- Add password hashing columns to children table
ALTER TABLE children
ADD COLUMN password_hash TEXT,
ADD COLUMN password_salt TEXT,
ADD COLUMN password_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN login_attempts INTEGER DEFAULT 0,
ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;

-- Create audit logging table for security events
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'login_attempt', 'login_success', 'password_change', 'profile_update', 'account_delete', etc.
  resource_type TEXT NOT NULL, -- 'auth', 'profile', 'calendar', 'tile', etc.
  resource_id TEXT, -- UUID of the affected resource
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Additional context (old_value, new_value, error_message, etc.)
  success BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate limiting table
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address or user ID
  endpoint TEXT NOT NULL, -- API endpoint path
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  UNIQUE(identifier, endpoint)
);

-- Create sessions table for enhanced session management
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CSRF tokens table
CREATE TABLE csrf_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token_hash)
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_rate_limits_identifier_endpoint ON rate_limits(identifier, endpoint);
CREATE INDEX idx_rate_limits_window_start ON rate_limits(window_start);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_csrf_tokens_user_id ON csrf_tokens(user_id);
CREATE INDEX idx_csrf_tokens_expires_at ON csrf_tokens(expires_at);

-- RLS Policies for audit_logs (service role can insert, users can read their own)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for rate_limits (service role only)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages rate limits" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_sessions (users can view their own, service role manages)
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages sessions" ON user_sessions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for csrf_tokens (users can manage their own)
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own CSRF tokens" ON csrf_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_security_tables()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up expired rate limit entries (older than 1 hour)
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';

  -- Clean up expired sessions
  DELETE FROM user_sessions WHERE expires_at < NOW();

  -- Clean up expired CSRF tokens
  DELETE FROM csrf_tokens WHERE expires_at < NOW();

  -- Clean up old audit logs (keep last 90 days)
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL,
  p_success BOOLEAN DEFAULT true
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, resource_type, resource_id,
    ip_address, user_agent, metadata, success
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_metadata, p_success
  );
END;
$$;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_attempts INTEGER;
  blocked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if currently blocked
  SELECT blocked_until INTO blocked_until
  FROM rate_limits
  WHERE identifier = p_identifier AND endpoint = p_endpoint;

  IF blocked_until IS NOT NULL AND blocked_until > NOW() THEN
    RETURN false; -- Still blocked
  END IF;

  -- Count attempts in current window
  SELECT attempts INTO current_attempts
  FROM rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL;

  IF current_attempts IS NULL THEN
    -- First attempt
    INSERT INTO rate_limits (identifier, endpoint, attempts)
    VALUES (p_identifier, p_endpoint, 1);
    RETURN true;
  ELSIF current_attempts >= p_max_attempts THEN
    -- Block the identifier
    UPDATE rate_limits
    SET blocked_until = NOW() + (p_window_minutes || ' minutes')::INTERVAL
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    RETURN false;
  ELSE
    -- Increment attempts
    UPDATE rate_limits
    SET attempts = attempts + 1
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    RETURN true;
  END IF;
END;
$$;

-- Function to validate CSRF token
CREATE OR REPLACE FUNCTION validate_csrf_token(
  p_user_id UUID,
  p_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  token_hash TEXT;
BEGIN
  -- Hash the provided token
  SELECT encode(digest(p_token, 'sha256'), 'hex') INTO token_hash;

  -- Check if token exists and is not expired
  RETURN EXISTS (
    SELECT 1
    FROM csrf_tokens
    WHERE user_id = p_user_id
      AND token_hash = token_hash
      AND expires_at > NOW()
  );
END;
$$;