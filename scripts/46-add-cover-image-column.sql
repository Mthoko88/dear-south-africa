-- Add cover_image column to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Add comment explaining the column
COMMENT ON COLUMN stories.cover_image IS 'URL to AI-generated or user-uploaded cover image for the story';
