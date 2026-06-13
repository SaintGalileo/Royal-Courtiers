-- Run in Supabase SQL Editor to add chest measurement support for existing databases.
ALTER TABLE members ADD COLUMN IF NOT EXISTS shirt_chest_inches NUMERIC;

-- Reload PostgREST schema cache so the new column is recognized immediately
NOTIFY pgrst, 'reload schema';
