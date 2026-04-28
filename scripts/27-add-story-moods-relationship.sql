-- Add story_moods table with proper foreign key relationship
CREATE TABLE IF NOT EXISTS story_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  mood VARCHAR(30) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_story_moods_story_id ON story_moods(story_id);
CREATE INDEX IF NOT EXISTS idx_story_moods_mood ON story_moods(mood);

-- Enable RLS
ALTER TABLE story_moods ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can view all story moods" ON story_moods FOR SELECT USING (true);
CREATE POLICY "Authors can manage their story moods" ON story_moods FOR ALL USING (
  EXISTS (
    SELECT 1 FROM stories 
    WHERE stories.id = story_moods.story_id 
    AND stories.author_id = auth.uid()
  )
);

-- Insert some sample moods for existing stories
INSERT INTO story_moods (story_id, mood)
SELECT 
  id,
  CASE 
    WHEN category = 'Mental Health' THEN 'Healing'
    WHEN category = 'Personal Growth' THEN 'Inspiring'
    WHEN category = 'Family & Relationships' THEN 'Reflective'
    WHEN category = 'Career & Work' THEN 'Determined'
    WHEN category = 'Community' THEN 'Hopeful'
    WHEN category = 'Overcoming Challenges' THEN 'Empowering'
    ELSE 'Contemplative'
  END
FROM stories
WHERE id NOT IN (SELECT DISTINCT story_id FROM story_moods WHERE story_id IS NOT NULL);

-- Add a second mood for some stories to show variety
INSERT INTO story_moods (story_id, mood)
SELECT 
  id,
  CASE 
    WHEN category = 'Mental Health' THEN 'Vulnerable'
    WHEN category = 'Personal Growth' THEN 'Grateful'
    WHEN category = 'Family & Relationships' THEN 'Hopeful'
    WHEN category = 'Career & Work' THEN 'Celebratory'
    WHEN category = 'Community' THEN 'Inspiring'
    WHEN category = 'Overcoming Challenges' THEN 'Determined'
    ELSE 'Reflective'
  END
FROM stories
WHERE random() < 0.6; -- Add second mood to ~60% of stories
