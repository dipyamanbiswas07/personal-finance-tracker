-- Heartbeat table for the Supabase Keep Alive GitHub Action (.github/workflows/keep-alive.yml).
-- Previously created manually in the dashboard; this migration brings it under version control.
CREATE TABLE IF NOT EXISTS keep_alive (
  id INTEGER PRIMARY KEY,
  last_ping TIMESTAMPTZ NOT NULL
);

ALTER TABLE keep_alive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can upsert heartbeat"
  ON keep_alive FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
