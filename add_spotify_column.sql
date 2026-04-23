-- Run this in your Supabase SQL Editor to support the Spotify feature
ALTER TABLE members ADD COLUMN IF NOT EXISTS favorite_song JSONB DEFAULT NULL;
