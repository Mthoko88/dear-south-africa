-- Create diary entries table for private journaling
CREATE TABLE IF NOT EXISTS public.diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255),
    content TEXT NOT NULL,
    mood VARCHAR(50), -- happy, sad, anxious, hopeful, grateful, angry, confused, excited, peaceful, overwhelmed, proud, lonely, content
    mood_intensity INTEGER CHECK (mood_intensity >= 1 AND mood_intensity <= 10), -- 1-10 scale
    category VARCHAR(100), -- personal, work, family, health, goals, reflection, gratitude, challenges
    tags TEXT[], -- custom tags for organization
    location VARCHAR(255),
    is_milestone BOOLEAN DEFAULT false, -- mark important moments
    entry_date DATE NOT NULL, -- allows backdating entries
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS - diary entries are completely private
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own diary entries
CREATE POLICY "Users can view own diary entries" ON public.diary_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diary entries" ON public.diary_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diary entries" ON public.diary_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diary entries" ON public.diary_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_entry_date ON public.diary_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_mood ON public.diary_entries(mood);
CREATE INDEX IF NOT EXISTS idx_diary_entries_category ON public.diary_entries(category);
CREATE INDEX IF NOT EXISTS idx_diary_entries_milestone ON public.diary_entries(is_milestone);

-- Create diary statistics view for user insights
CREATE OR REPLACE VIEW public.diary_user_stats AS
SELECT 
    user_id,
    COUNT(*) as total_entries,
    COUNT(CASE WHEN entry_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as entries_this_week,
    COUNT(CASE WHEN entry_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as entries_this_month,
    COUNT(CASE WHEN is_milestone = true THEN 1 END) as milestone_count,
    AVG(mood_intensity) as avg_mood_intensity,
    MODE() WITHIN GROUP (ORDER BY mood) as most_common_mood,
    MIN(entry_date) as first_entry_date,
    MAX(entry_date) as last_entry_date
FROM public.diary_entries
GROUP BY user_id;

-- Add RLS to the view
ALTER VIEW public.diary_user_stats SET (security_invoker = true);

-- Update function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_diary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_diary_entries_updated_at ON public.diary_entries;
CREATE TRIGGER update_diary_entries_updated_at
    BEFORE UPDATE ON public.diary_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_diary_updated_at();
