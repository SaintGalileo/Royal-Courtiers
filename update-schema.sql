-- Run this in your Supabase SQL Editor to add the new date columns to the existing members table
ALTER TABLE members
ADD COLUMN date_of_birth DATE,
ADD COLUMN date_of_consecration DATE;

-- Chest-based shirt sizing (required for shirt size picker)
ALTER TABLE members ADD COLUMN IF NOT EXISTS shirt_chest_inches NUMERIC;

-- Reload PostgREST schema cache so the new column is recognized immediately
NOTIFY pgrst, 'reload schema';
