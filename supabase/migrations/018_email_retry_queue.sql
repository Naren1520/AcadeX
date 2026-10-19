-- Migration 018: email_retry_queue

CREATE TABLE email_retry_queue (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  subject         text NOT NULL,
  body_html       text NOT NULL,
  trigger_event   text NOT NULL,
  attempt_count   integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  exhausted       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_retry_pending ON email_retry_queue(next_attempt_at)
  WHERE NOT exhausted;

CREATE TRIGGER email_retry_queue_updated_at
  BEFORE UPDATE ON email_retry_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE email_retry_queue ENABLE ROW LEVEL SECURITY;
