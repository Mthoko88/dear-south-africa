-- Update story_views table to track anonymous users
-- Add session_id column for anonymous user tracking

ALTER TABLE story_views ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_story_views_session ON story_views(story_id, session_id);
CREATE INDEX IF NOT EXISTS idx_story_views_user ON story_views(story_id, user_id);

-- Update RLS policies to allow anonymous inserts
DROP POLICY IF EXISTS "Users can create story views" ON story_views;
DROP POLICY IF EXISTS "Anyone can create story views" ON story_views;

CREATE POLICY "Anyone can create story views" ON story_views
  FOR INSERT 
  WITH CHECK (true);

-- Keep the select policy
DROP POLICY IF EXISTS "Users can view story views" ON story_views;

CREATE POLICY "Anyone can view story views" ON story_views
  FOR SELECT 
  USING (true);
