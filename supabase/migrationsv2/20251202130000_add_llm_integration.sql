/*
  # LLM Integration Schema Extensions

  This migration adds support for LLM integration features:
  - Parent system prompt preferences
  - LLM response caching for performance
  - Content moderation logging
  - LLM usage analytics

  Security:
    - Enable RLS on all new tables
    - Policies ensure parents can only access their own data
*/

-- Add system prompt preference to parents table
ALTER TABLE parents ADD COLUMN IF NOT EXISTS system_prompt_template TEXT DEFAULT 'dad'
  CHECK (system_prompt_template IN ('dad', 'mum', 'grandpa', 'grandma'));

-- LLM response cache table for performance optimization
CREATE TABLE IF NOT EXISTS llm_cache (
  cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  prompt_hash TEXT NOT NULL,
  response TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours'),
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Content moderation logs table
CREATE TABLE IF NOT EXISTS content_moderation_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_uuid UUID REFERENCES parents(parent_uuid) ON DELETE CASCADE,
  child_uuid UUID REFERENCES children(child_uuid) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('tile_body', 'tile_title', 'chat_message', 'gift_description')),
  content_text TEXT NOT NULL,
  moderation_result TEXT NOT NULL CHECK (moderation_result IN ('approved', 'flagged', 'rejected')),
  moderation_reason TEXT,
  moderated_by TEXT DEFAULT 'automated', -- 'automated' or admin user ID
  original_content TEXT,
  moderated_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- LLM usage analytics table
CREATE TABLE IF NOT EXISTS llm_usage_logs (
  usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_uuid UUID REFERENCES parents(parent_uuid) ON DELETE CASCADE,
  child_uuid UUID REFERENCES children(child_uuid) ON DELETE CASCADE,
  model TEXT NOT NULL,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('chat', 'content_generation', 'gift_suggestion')),
  tokens_prompt INTEGER DEFAULT 0,
  tokens_completion INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0, -- Cost in cents (USD)
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE llm_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for llm_cache (allow all authenticated users to read/write cache)
CREATE POLICY "Authenticated users can access LLM cache" ON llm_cache
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for content_moderation_logs
CREATE POLICY "Parents can view their moderation logs" ON content_moderation_logs
  FOR SELECT USING (
    parent_uuid IN (
      SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
    )
  );

CREATE POLICY "System can insert moderation logs" ON content_moderation_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for llm_usage_logs
CREATE POLICY "Parents can view their LLM usage" ON llm_usage_logs
  FOR SELECT USING (
    parent_uuid IN (
      SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
    )
  );

CREATE POLICY "System can insert LLM usage logs" ON llm_usage_logs
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_llm_cache_key ON llm_cache(cache_key);
CREATE INDEX idx_llm_cache_expires_at ON llm_cache(expires_at);
CREATE INDEX idx_llm_cache_last_accessed ON llm_cache(last_accessed_at);

CREATE INDEX idx_content_moderation_parent ON content_moderation_logs(parent_uuid);
CREATE INDEX idx_content_moderation_created_at ON content_moderation_logs(created_at);

CREATE INDEX idx_llm_usage_parent ON llm_usage_logs(parent_uuid);
CREATE INDEX idx_llm_usage_created_at ON llm_usage_logs(created_at);
CREATE INDEX idx_llm_usage_operation ON llm_usage_logs(operation_type);

-- Function to clean expired cache entries (call periodically)
CREATE OR REPLACE FUNCTION clean_expired_llm_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM llm_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update cache hit count
CREATE OR REPLACE FUNCTION update_cache_hit(cache_key_param TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE llm_cache
  SET hit_count = hit_count + 1, last_accessed_at = now()
  WHERE cache_key = cache_key_param;
END;
$$ LANGUAGE plpgsql;

-- Function to log LLM usage
CREATE OR REPLACE FUNCTION log_llm_usage(
  p_parent_uuid UUID,
  p_child_uuid UUID DEFAULT NULL,
  p_model TEXT,
  p_operation_type TEXT,
  p_tokens_prompt INTEGER DEFAULT 0,
  p_tokens_completion INTEGER DEFAULT 0,
  p_response_time_ms INTEGER DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  total_tokens INTEGER;
  cost_cents INTEGER;
  usage_id UUID;
BEGIN
  total_tokens := p_tokens_prompt + p_tokens_completion;

  -- Calculate cost (rough estimates - adjust based on actual pricing)
  -- GPT-4o-mini: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
  cost_cents := ((p_tokens_prompt * 15 + p_tokens_completion * 60) / 1000000);

  INSERT INTO llm_usage_logs (
    parent_uuid, child_uuid, model, operation_type,
    tokens_prompt, tokens_completion, total_tokens, cost_cents,
    response_time_ms, success, error_message
  ) VALUES (
    p_parent_uuid, p_child_uuid, p_model, p_operation_type,
    p_tokens_prompt, p_tokens_completion, total_tokens, cost_cents,
    p_response_time_ms, p_success, p_error_message
  ) RETURNING usage_id INTO usage_id;

  RETURN usage_id;
END;
$$ LANGUAGE plpgsql;