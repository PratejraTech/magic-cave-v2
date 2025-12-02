/*
  # Expanded Advent Calendar Schema v2.0

  This migration creates the new multi-user, parent-child calendar system.
  The existing advent_days table is preserved for backward compatibility but marked as deprecated.

  New Tables:
    - parents: Parent accounts with authentication
    - children: Child profiles linked to parents
    - templates: Calendar styling templates
    - calendars: Calendar instances for children
    - calendar_tiles: Individual tiles within calendars
    - analytics_events: Usage analytics
    - audit_logs: Change tracking (optional)

  Security:
    - Enable RLS on all tables
    - Policies ensure parents can only access their own data
    - Children can only access their assigned calendar
*/

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  parent_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  auth_provider TEXT NOT NULL CHECK (auth_provider IN ('google', 'facebook', 'email_magic_link')),
  auth_provider_id TEXT,
  family_uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Children table
CREATE TABLE IF NOT EXISTS children (
  child_uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_uuid UUID NOT NULL REFERENCES parents(parent_uuid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birthdate DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other', 'unspecified')),
  interests JSONB DEFAULT '{}',
  selected_template UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  retired BOOLEAN DEFAULT false
);

-- Calendars table
CREATE TABLE IF NOT EXISTS calendars (
  calendar_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_uuid UUID NOT NULL REFERENCES children(child_uuid) ON DELETE CASCADE,
  parent_uuid UUID NOT NULL REFERENCES parents(parent_uuid) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(template_id),
  share_uuid UUID UNIQUE,
  is_published BOOLEAN DEFAULT false,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  version INTEGER DEFAULT 1,
  last_tile_opened INTEGER DEFAULT 0 CHECK (last_tile_opened >= 0 AND last_tile_opened <= 25),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for one calendar per child
ALTER TABLE calendars ADD CONSTRAINT unique_calendar_per_child UNIQUE (child_uuid);

-- Calendar tiles table
CREATE TABLE IF NOT EXISTS calendar_tiles (
  tile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(calendar_id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 25),
  title TEXT,
  body TEXT,
  media_url TEXT,
  gift JSONB,
  gift_unlocked BOOLEAN DEFAULT false,
  note_from_child TEXT,
  opened_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add unique constraint for one tile per day per calendar
ALTER TABLE calendar_tiles ADD CONSTRAINT unique_tile_per_day_per_calendar UNIQUE (calendar_id, day);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES calendars(calendar_id) ON DELETE CASCADE,
  parent_uuid UUID REFERENCES parents(parent_uuid) ON DELETE CASCADE,
  child_uuid UUID REFERENCES children(child_uuid) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs table (optional)
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default templates
INSERT INTO templates (template_id, name, description, metadata) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'Pastel Dreams', 'Soft pastel colors with dreamy illustrations', '{
    "colors": {"primary": "#FFB3BA", "secondary": "#BAFFC9", "accent": "#BAE1FF"},
    "fonts": {"heading": "Comic Sans MS", "body": "Arial"},
    "icons": ["butterfly", "star", "heart"],
    "layout": "rounded_tiles",
    "gradients": {
      "tileBackground": "linear-gradient(135deg, #FFB3BA 0%, #BAFFC9 100%)",
      "tileHover": "linear-gradient(135deg, #BAFFC9 0%, #BAE1FF 100%)"
    },
    "animations": {
      "tileHover": "transform scale-105 transition-all duration-300",
      "tileClick": "animate-pulse"
    }
  }'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Adventure Boy', 'Bold colors with adventure-themed graphics', '{
    "colors": {"primary": "#FF6B35", "secondary": "#F7931E", "accent": "#FFD23F"},
    "fonts": {"heading": "Impact", "body": "Verdana"},
    "icons": ["mountain", "compass", "telescope"],
    "layout": "square_tiles",
    "gradients": {
      "tileBackground": "linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)",
      "tileHover": "linear-gradient(135deg, #F7931E 0%, #FFD23F 100%)"
    },
    "animations": {
      "tileHover": "transform scale-110 shadow-lg transition-all duration-200",
      "tileClick": "animate-bounce"
    }
  }'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Rainbow Fantasy', 'Bright rainbow colors with magical elements', '{
    "colors": {"primary": "#FF0080", "secondary": "#8000FF", "accent": "#00FF80"},
    "fonts": {"heading": "Fantasy", "body": "Georgia"},
    "icons": ["unicorn", "rainbow", "castle"],
    "layout": "hexagon_tiles",
    "gradients": {
      "tileBackground": "linear-gradient(135deg, #FF0080 0%, #8000FF 50%, #00FF80 100%)",
      "tileHover": "linear-gradient(135deg, #8000FF 0%, #00FF80 50%, #FF0080 100%)"
    },
    "animations": {
      "tileHover": "transform scale-105 rotate-1 transition-all duration-500",
      "tileClick": "animate-spin"
    }
  }')
ON CONFLICT (template_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_tiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parents table
CREATE POLICY "Parents can read their own data" ON parents
  FOR SELECT USING (auth.uid()::text = parent_uuid::text);

CREATE POLICY "Parents can update their own data" ON parents
  FOR UPDATE USING (auth.uid()::text = parent_uuid::text);

-- RLS Policies for children table
CREATE POLICY "Parents can manage their children" ON children
  FOR ALL USING (
    parent_uuid IN (
      SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
    )
  );

-- RLS Policies for calendars table
CREATE POLICY "Parents and children can access their calendars" ON calendars
  FOR SELECT USING (
    parent_uuid IN (
      SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
    ) OR
    child_uuid IN (
      SELECT child_uuid FROM children WHERE auth.uid()::text = child_uuid::text
    )
  );

CREATE POLICY "Parents can manage their calendars" ON calendars
  FOR ALL USING (
    parent_uuid IN (
      SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
    )
  );

-- RLS Policies for calendar_tiles table
CREATE POLICY "Parents and children can access their tiles" ON calendar_tiles
  FOR SELECT USING (
    calendar_id IN (
      SELECT calendar_id FROM calendars WHERE
        parent_uuid IN (
          SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
        ) OR
        child_uuid IN (
          SELECT child_uuid FROM children WHERE auth.uid()::text = child_uuid::text
        )
    )
  );

CREATE POLICY "Parents can manage their tiles" ON calendar_tiles
  FOR ALL USING (
    calendar_id IN (
      SELECT calendar_id FROM calendars WHERE
        parent_uuid IN (
          SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
        )
    )
  );

-- RLS Policies for templates (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read templates" ON templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for analytics_events
CREATE POLICY "Parents can view their analytics" ON analytics_events
  FOR SELECT USING (
    parent_uuid IN (
      SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
    )
  );

-- Indexes for performance
CREATE INDEX idx_children_parent_uuid ON children(parent_uuid);
CREATE INDEX idx_calendars_child_uuid ON calendars(child_uuid);
CREATE INDEX idx_calendars_parent_uuid ON calendars(parent_uuid);
CREATE INDEX idx_calendar_tiles_calendar_id ON calendar_tiles(calendar_id);
CREATE INDEX idx_calendar_tiles_day ON calendar_tiles(day);
CREATE INDEX idx_analytics_events_calendar_id ON analytics_events(calendar_id);
CREATE INDEX idx_analytics_events_parent_uuid ON analytics_events(parent_uuid);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendars_updated_at BEFORE UPDATE ON calendars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_tiles_updated_at BEFORE UPDATE ON calendar_tiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();