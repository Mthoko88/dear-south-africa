-- Add draft functionality to stories table
ALTER TABLE stories ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Update existing stories to be published
UPDATE stories SET is_published = true WHERE is_published IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(is_published);
CREATE INDEX IF NOT EXISTS idx_stories_user_published ON stories(user_id, is_published);

-- Update RLS policies to handle drafts
DROP POLICY IF EXISTS "Users can view published stories" ON stories;
CREATE POLICY "Users can view published stories or their own drafts" ON stories
  FOR SELECT USING (
    is_published = true OR 
    auth.uid() = user_id
  );

-- Policy for inserting stories (including drafts)
DROP POLICY IF EXISTS "Users can insert their own stories" ON stories;
CREATE POLICY "Users can insert their own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for updating stories (including publishing drafts)
DROP POLICY IF EXISTS "Users can update their own stories" ON stories;
CREATE POLICY "Users can update their own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy for deleting stories
DROP POLICY IF EXISTS "Users can delete their own stories" ON stories;
CREATE POLICY "Users can delete their own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);
