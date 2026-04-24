-- Create function to send notification when someone comments on a story
CREATE OR REPLACE FUNCTION notify_story_comment()
RETURNS TRIGGER AS $$
DECLARE
  story_owner_id UUID;
  story_title TEXT;
  commenter_name TEXT;
BEGIN
  -- Get the story owner and title
  SELECT user_id, title INTO story_owner_id, story_title
  FROM stories
  WHERE id = NEW.story_id;
  
  -- Don't notify if user comments on their own story
  IF story_owner_id = NEW.author_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter's name
  SELECT COALESCE(full_name, username, 'Someone') INTO commenter_name
  FROM profiles
  WHERE user_id = NEW.author_id;
  
  -- Create notification for story owner
  INSERT INTO notifications (user_id, type, title, message, related_story_id, related_comment_id, read)
  VALUES (
    story_owner_id,
    'comment',
    'New comment on your story',
    commenter_name || ' commented on "' || COALESCE(LEFT(story_title, 50), 'your story') || '"',
    NEW.story_id,
    NEW.id,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send notification when someone reacts to a story
CREATE OR REPLACE FUNCTION notify_story_reaction()
RETURNS TRIGGER AS $$
DECLARE
  story_owner_id UUID;
  story_title TEXT;
  reactor_name TEXT;
  reaction_emoji TEXT;
BEGIN
  -- Get the story owner and title
  SELECT user_id, title INTO story_owner_id, story_title
  FROM stories
  WHERE id = NEW.story_id;
  
  -- Don't notify if user reacts to their own story
  IF story_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get reactor's name
  SELECT COALESCE(full_name, username, 'Someone') INTO reactor_name
  FROM profiles
  WHERE user_id = NEW.user_id;
  
  -- Map reaction type to emoji
  reaction_emoji := CASE NEW.reaction_type
    WHEN 'empathy' THEN '💙'
    WHEN 'support' THEN '🤗'
    WHEN 'inspiring' THEN '✨'
    WHEN 'relatable' THEN '🤝'
    WHEN 'brave' THEN '💪'
    ELSE '❤️'
  END;
  
  -- Create notification for story owner
  INSERT INTO notifications (user_id, type, title, message, related_story_id, read)
  VALUES (
    story_owner_id,
    'reaction',
    'New reaction on your story',
    reactor_name || ' reacted ' || reaction_emoji || ' to "' || COALESCE(LEFT(story_title, 50), 'your story') || '"',
    NEW.story_id,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send notification when someone replies to a comment
CREATE OR REPLACE FUNCTION notify_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_comment_author_id UUID;
  replier_name TEXT;
  story_title TEXT;
BEGIN
  -- Only process if this is a reply (has parent_id)
  IF NEW.parent_id IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Get the parent comment author
  SELECT author_id INTO parent_comment_author_id
  FROM comments
  WHERE id = NEW.parent_id;
  
  -- Don't notify if user replies to their own comment
  IF parent_comment_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;
  
  -- Get replier's name
  SELECT COALESCE(full_name, username, 'Someone') INTO replier_name
  FROM profiles
  WHERE user_id = NEW.author_id;
  
  -- Get story title
  SELECT title INTO story_title
  FROM stories
  WHERE id = NEW.story_id;
  
  -- Create notification for parent comment author
  INSERT INTO notifications (user_id, type, title, message, related_story_id, related_comment_id, read)
  VALUES (
    parent_comment_author_id,
    'reply',
    'New reply to your comment',
    replier_name || ' replied to your comment on "' || COALESCE(LEFT(story_title, 50), 'a story') || '"',
    NEW.story_id,
    NEW.id,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_comment_created ON comments;
DROP TRIGGER IF EXISTS on_reaction_created ON story_reactions;
DROP TRIGGER IF EXISTS on_comment_reply ON comments;

-- Create triggers
CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_story_comment();

CREATE TRIGGER on_reaction_created
  AFTER INSERT ON story_reactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_story_reaction();

CREATE TRIGGER on_comment_reply
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_reply();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION notify_story_comment() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_story_reaction() TO authenticated;
GRANT EXECUTE ON FUNCTION notify_comment_reply() TO authenticated;

-- Ensure notifications can be inserted by the triggers
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);
