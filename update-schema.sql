-- Run this in your Supabase SQL Editor to add the new date columns to the existing members table
ALTER TABLE members
ADD COLUMN date_of_birth DATE,
ADD COLUMN date_of_consecration DATE;
