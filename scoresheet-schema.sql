-- ============================================================
-- Supabase Schema for "Scoresheet" Feature
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the scoresheet table
CREATE TABLE IF NOT EXISTS scoresheet (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE scoresheet ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Allow anyone to read the scoresheet (required for the public leaderboard)
CREATE POLICY "Anyone can read scoresheet"
  ON scoresheet FOR SELECT USING (true);

-- Allow anyone to insert/update the scoresheet (used by the admin page)
CREATE POLICY "Anyone can insert scoresheet"
  ON scoresheet FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update scoresheet"
  ON scoresheet FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Enable Realtime for the scoresheet table
-- This is REQUIRED for the live leaderboard updates to work on the frontend.
-- If the command below fails, you can also enable it via the Supabase Dashboard:
-- Database -> Replication -> 0 tables -> Toggle "scoresheet"
ALTER PUBLICATION supabase_realtime ADD TABLE scoresheet;

-- 5. Insert initial row
INSERT INTO scoresheet (id, data) 
VALUES ('current', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
