-- ============================================================
-- Supabase Schema for "Match Results" Feature
-- Run this in your Supabase SQL Editor
-- Safe to re-run if the table already exists.
-- ============================================================

-- 1. Create the match_results table
CREATE TABLE IF NOT EXISTS match_results (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
DROP POLICY IF EXISTS "Anyone can read match_results" ON match_results;
CREATE POLICY "Anyone can read match_results"
  ON match_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert match_results" ON match_results;
CREATE POLICY "Anyone can insert match_results"
  ON match_results FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update match_results" ON match_results;
CREATE POLICY "Anyone can update match_results"
  ON match_results FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Enable Realtime for the match_results table
-- REQUIRED for live score updates on the Sports Arena and Extracurriculars pages.
-- If this fails, enable it via Supabase Dashboard:
-- Database -> Replication -> Toggle "match_results"
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE match_results;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- 5. Insert initial row
INSERT INTO match_results (id, data)
VALUES ('current', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 6. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
