-- Run in Supabase SQL Editor to store live match scores (goals / sets / games / points).
CREATE TABLE IF NOT EXISTS match_results (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO match_results (id, data)
VALUES ('current', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Reload PostgREST schema cache so the new table is recognized immediately
NOTIFY pgrst, 'reload schema';
