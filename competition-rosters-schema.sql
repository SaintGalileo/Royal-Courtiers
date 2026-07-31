-- ============================================================
-- Supabase Schema for "Competition Rosters" Feature
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create the competition_rosters table
CREATE TABLE IF NOT EXISTS competition_rosters (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE competition_rosters ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
CREATE POLICY "Anyone can read competition_rosters"
  ON competition_rosters FOR SELECT USING (true);

CREATE POLICY "Anyone can insert competition_rosters"
  ON competition_rosters FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update competition_rosters"
  ON competition_rosters FOR UPDATE USING (true) WITH CHECK (true);

-- 4. Insert initial row
INSERT INTO competition_rosters (id, data)
VALUES ('current', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
