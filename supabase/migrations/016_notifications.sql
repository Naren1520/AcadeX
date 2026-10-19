-- Migration 016: notifications

CREATE TABLE notifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message        text NOT NULL,
  deep_link      text NOT NULL,
  trigger_event  text NOT NULL,
  is_read        boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read      ON notifications(recipient_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
