/*
  # Notification Schedules Table
  Stores scheduled notifications for calendar tiles
*/

CREATE TABLE IF NOT EXISTS notification_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID NOT NULL REFERENCES calendars(calendar_id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 25),
  scheduled_time TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  notification_type TEXT NOT NULL DEFAULT 'tile_available' CHECK (notification_type IN ('tile_available', 'gift_unlocked', 'calendar_complete')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled', 'failed')),
  delivery_methods TEXT[] DEFAULT ARRAY['push', 'email'],
  retry_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint to prevent duplicate schedules
ALTER TABLE notification_schedules ADD CONSTRAINT unique_calendar_day_schedule
  UNIQUE (calendar_id, day, notification_type);

-- Indexes for performance
CREATE INDEX idx_notification_schedules_calendar_id ON notification_schedules(calendar_id);
CREATE INDEX idx_notification_schedules_status ON notification_schedules(status);
CREATE INDEX idx_notification_schedules_scheduled_time ON notification_schedules(scheduled_time);
CREATE INDEX idx_notification_schedules_status_time ON notification_schedules(status, scheduled_time);

-- Enable RLS
ALTER TABLE notification_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Parents can manage their notification schedules" ON notification_schedules
  FOR ALL USING (
    calendar_id IN (
      SELECT calendar_id FROM calendars
      WHERE parent_uuid IN (
        SELECT parent_uuid FROM parents WHERE auth.uid()::text = parent_uuid::text
      )
    )
  );

-- Function to automatically schedule notifications when calendar is created
CREATE OR REPLACE FUNCTION schedule_calendar_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Only schedule if notifications are enabled for this calendar
  IF NEW.settings->>'notifications_enabled' = 'true' THEN
    -- Schedule notifications for all 25 days
    FOR day_counter IN 1..25 LOOP
      INSERT INTO notification_schedules (
        calendar_id,
        day,
        scheduled_time,
        timezone,
        notification_type
      ) VALUES (
        NEW.calendar_id,
        day_counter,
        -- Schedule at midnight in the parent's timezone (placeholder - would need timezone logic)
        (CURRENT_DATE + INTERVAL '1 day' * (day_counter - 1) + INTERVAL '0 hours'),
        COALESCE(NEW.settings->>'timezone', 'UTC'),
        'tile_available'
      )
      ON CONFLICT (calendar_id, day, notification_type) DO NOTHING;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically schedule notifications
CREATE TRIGGER trigger_schedule_calendar_notifications
  AFTER INSERT ON calendars
  FOR EACH ROW
  EXECUTE FUNCTION schedule_calendar_notifications();

-- Function to update notification status when sent
CREATE OR REPLACE FUNCTION update_notification_status(
  p_schedule_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE notification_schedules
  SET
    status = p_status,
    last_attempt_at = CASE WHEN p_status IN ('sent', 'failed') THEN now() ELSE last_attempt_at END,
    retry_count = CASE WHEN p_status = 'failed' THEN retry_count + 1 ELSE retry_count END,
    error_message = p_error_message,
    updated_at = now()
  WHERE schedule_id = p_schedule_id;
END;
$$ LANGUAGE plpgsql;