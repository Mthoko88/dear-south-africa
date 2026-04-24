-- Add organisation_id to stories table
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS organisation_id uuid REFERENCES organisations(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stories_organisation_id ON stories(organisation_id);

-- Update RLS policy to allow organisations to post
-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Users can insert their own stories" ON stories;

-- Create new insert policy that allows both individual and org posts
CREATE POLICY "Users can insert their own stories" ON stories
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (
      organisation_id IS NOT NULL AND 
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.organisation_id = stories.organisation_id 
        AND profiles.is_admin = true
      )
    )
  );

-- Allow public read on organisations
DROP POLICY IF EXISTS "Public can view organisations" ON organisations;
CREATE POLICY "Public can view organisations" ON organisations
  FOR SELECT USING (true);
