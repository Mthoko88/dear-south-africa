-- Add audio support to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS story_type TEXT DEFAULT 'written' CHECK (story_type IN ('written', 'voice'));

-- Update existing stories to be 'written' type
UPDATE stories SET story_type = 'written' WHERE story_type IS NULL;

COMMENT ON COLUMN stories.audio_url IS 'URL to audio file stored in Vercel Blob for voice stories';
COMMENT ON COLUMN stories.story_type IS 'Type of story: written (text content) or voice (audio recording)';
