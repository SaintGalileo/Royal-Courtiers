-- SQL Migration for Sacred Records Feature

-- 1. Create the Sacred Records table
CREATE TABLE IF NOT EXISTS sacred_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_number INTEGER UNIQUE NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the User Progress table
-- Assumes your members table uses UUID for primary key
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES members(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, day_number)
);

-- 3. Add initial records (Seed Data)
INSERT INTO sacred_records (day_number, question, answer) VALUES
(1, 'What is the purpose of the daily seal?', 'The daily seal is a reminder of our devotion and the spiritual coverage we walk in every day.'),
(2, 'How many times should we meditate on the word?', 'Meditation should be constant, but dedicated quiet time twice a day (morning and evening) is recommended.'),
(3, 'What does the white attire represent?', 'Purity, readiness, and the outward sign of an inward consecration to the Universal Monarch.'),
(4, 'Why is the "Family" structure important?', 'Community provides the soil for spiritual growth; weights are shared and victories are multiplied.'),
(5, 'What is the "Sacred Breath"?', 'It is the conscious alignment of our physical life with the spiritual pulse of the heavens.')
ON CONFLICT (day_number) DO NOTHING;
