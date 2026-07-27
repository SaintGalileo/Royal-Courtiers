-- ============================================================
-- Sacred Records Gamification
-- Run in Supabase SQL Editor
-- ============================================================

-- Question pool per sacred record
CREATE TABLE IF NOT EXISTS sacred_record_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES sacred_records(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('a', 'b')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sacred_record_questions_record_id_idx
  ON sacred_record_questions (record_id);

ALTER TABLE sacred_record_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sacred_record_questions"
  ON sacred_record_questions FOR SELECT USING (true);

CREATE POLICY "Anyone can insert sacred_record_questions"
  ON sacred_record_questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update sacred_record_questions"
  ON sacred_record_questions FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete sacred_record_questions"
  ON sacred_record_questions FOR DELETE USING (true);

-- Progress: ensure fractional points + audit payload
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS quiz_scores JSONB;

-- points_earned should allow decimals (safe if already numeric)
DO $$
BEGIN
  ALTER TABLE user_progress
    ALTER COLUMN points_earned TYPE NUMERIC(8,2)
    USING points_earned::numeric(8,2);
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

-- ============================================================
-- Clean slate: wipe all Sacred Records progress / scores
-- Does NOT delete sacred_records or sacred_record_questions.
-- ============================================================
DELETE FROM user_progress;
