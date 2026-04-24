-- Create a function to safely increment story view count
CREATE OR REPLACE FUNCTION increment_story_view_count(story_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE stories 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION increment_story_view_count(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_story_view_count(UUID) TO authenticated;
