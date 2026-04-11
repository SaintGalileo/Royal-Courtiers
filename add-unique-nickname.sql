-- Run this in your Supabase SQL Editor to ensure nicknames are unique
ALTER TABLE members ADD CONSTRAINT members_nick_name_key UNIQUE (nick_name);
