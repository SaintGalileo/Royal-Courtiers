-- ============================================================
-- Supabase Schema for "Virgins" App
-- Run this ENTIRE script in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New Query → Paste → Run)
-- ============================================================

-- 1. MEMBERS TABLE (created first since access_codes references it)
CREATE TABLE IF NOT EXISTS members (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code                VARCHAR(6) NOT NULL UNIQUE,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  nick_name           TEXT DEFAULT '',
  gender              TEXT NOT NULL CHECK (gender IN ('Brother', 'Sister')),
  date_of_birth       DATE,
  date_of_consecration DATE,
  nation_of_origin    TEXT NOT NULL,
  state_of_origin     TEXT NOT NULL,
  nation_of_residence TEXT NOT NULL,
  state_of_residence  TEXT NOT NULL,
  shirt_size          TEXT NOT NULL,
  talents             TEXT[] DEFAULT '{}',
  photo_url           TEXT DEFAULT '',
  family              TEXT DEFAULT '',
  pin                 VARCHAR(4) DEFAULT NULL,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 2. ACCESS CODES TABLE
CREATE TABLE IF NOT EXISTS access_codes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code        VARCHAR(6) NOT NULL UNIQUE,
  is_used     BOOLEAN DEFAULT FALSE,
  used_by     UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  used_at     TIMESTAMPTZ
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes (code);
CREATE INDEX IF NOT EXISTS idx_members_code ON members (code);

-- 4. ROW LEVEL SECURITY
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read access codes"
  ON access_codes FOR SELECT USING (true);

CREATE POLICY "Anyone can update access codes during signup"
  ON access_codes FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can insert members"
  ON members FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read members"
  ON members FOR SELECT USING (true);

CREATE POLICY "Anyone can update members"
  ON members FOR UPDATE USING (true) WITH CHECK (true);

-- 5. GENERATE 50 RANDOM ACCESS CODES
-- Change 50 to however many you need.
INSERT INTO access_codes (code)
SELECT
  string_agg(
    substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ceil(random() * 36)::int, 1),
    ''
  )
FROM generate_series(1, 50),
     generate_series(1, 6) AS chars(n)
GROUP BY generate_series
ON CONFLICT (code) DO NOTHING;
