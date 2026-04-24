-- Add media columns to stories table for multiple images and video
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN stories.media_urls IS 'JSON array of image URLs for the story gallery';
COMMENT ON COLUMN stories.video_url IS 'Optional video URL for the story';
