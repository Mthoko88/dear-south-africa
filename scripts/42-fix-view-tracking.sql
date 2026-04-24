-- Fix view tracking for anonymous users

-- Ensure RLS is enabled
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on story_views
DROP POLICY IF EXISTS "Users can create story views" ON story_views;
DROP POLICY IF EXISTS "Anyone can create story views" ON story_views;
DROP POLICY IF EXISTS "Users can view story views" ON story_views;
DROP POLICY IF EXISTS "Anyone can view story views" ON story_views;
DROP POLICY IF EXISTS "Allow anonymous inserts" ON story_views;
DROP POLICY IF EXISTS "Allow all inserts" ON story_views;
DROP POLICY IF EXISTS "Allow all selects" ON story_views;

-- Create permissive policies for story_views
CREATE POLICY "story_views_insert_policy" ON story_views
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "story_views_select_policy" ON story_views
  FOR SELECT 
  TO anon, authenticated
  USING (true);

-- Recreate the increment function with proper permissions
DROP FUNCTION IF EXISTS increment_story_view_count(UUID);

CREATE OR REPLACE FUNCTION increment_story_view_count(p_story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to both anonymous and authenticated users
GRANT EXECUTE ON FUNCTION increment_story_view_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_story_view_count(UUID) TO authenticated;

-- Also ensure stories table can be updated for view_count
-- Create policy to allow updating view_count only
DROP POLICY IF EXISTS "Anyone can increment view count" ON stories;

CREATE POLICY "Anyone can increment view count" ON stories
  FOR UPDATE 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
