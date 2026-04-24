-- Add source_url column to stories table for imported articles
-- This stores the original URL when a story is imported from an external source

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN stories.source_url IS 'Original URL when story is imported from an external article';
