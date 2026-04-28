-- Create a single RPC function that handles both tracking and incrementing views
-- This function uses SECURITY DEFINER to bypass RLS

CREATE OR REPLACE FUNCTION track_story_view(
  p_story_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  view_exists BOOLEAN;
BEGIN
  -- Check if view already exists
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM story_views 
      WHERE story_id = p_story_id AND user_id = p_user_id
    ) INTO view_exists;
  ELSIF p_session_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM story_views 
      WHERE story_id = p_story_id AND session_id = p_session_id
    ) INTO view_exists;
  ELSE
    -- No identifier provided, always count as new view
    view_exists := FALSE;
  END IF;

  -- If view doesn't exist, record it and increment count
  IF NOT view_exists THEN
    -- Insert view record
    INSERT INTO story_views (story_id, user_id, session_id)
    VALUES (p_story_id, p_user_id, p_session_id)
    ON CONFLICT DO NOTHING;

    -- Increment view count
    UPDATE stories 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = p_story_id;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Grant execute permission to everyone (including anonymous users)
GRANT EXECUTE ON FUNCTION track_story_view(UUID, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION track_story_view(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_story_view(UUID, UUID, TEXT) TO public;
