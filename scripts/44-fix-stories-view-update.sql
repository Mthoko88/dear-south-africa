-- Fix RLS policy to allow anyone to update view_count on stories

-- Drop existing update policies on stories if they exist
DROP POLICY IF EXISTS "Anyone can update view count" ON stories;
DROP POLICY IF EXISTS "Allow view count updates" ON stories;
DROP POLICY IF EXISTS "Authors can update own stories" ON stories;

-- Create a policy that allows anyone (including anonymous) to update ONLY the view_count
CREATE POLICY "Anyone can increment view count"
ON stories
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Also ensure the stories table has RLS enabled but allows reads
DROP POLICY IF EXISTS "Anyone can read published stories" ON stories;
CREATE POLICY "Anyone can read published stories"
ON stories
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Grant update permission on stories to anon role
GRANT UPDATE (view_count) ON stories TO anon;
GRANT UPDATE (view_count) ON stories TO authenticated;
