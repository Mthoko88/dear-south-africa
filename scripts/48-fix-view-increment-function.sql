-- Drop existing function if it exists
DROP FUNCTION IF EXISTS increment_story_view_count(uuid);
DROP FUNCTION IF EXISTS increment_story_view_count(p_story_id uuid);

-- Create the function to increment story view count
CREATE OR REPLACE FUNCTION increment_story_view_count(story_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE stories 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION increment_story_view_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_story_view_count(uuid) TO anon;
