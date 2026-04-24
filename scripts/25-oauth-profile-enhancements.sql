-- Add OAuth-related columns to profiles table if they don't exist
DO $$ 
BEGIN
    -- Add provider column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'provider') THEN
        ALTER TABLE profiles ADD COLUMN provider TEXT DEFAULT 'email';
    END IF;
    
    -- Add provider_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'provider_id') THEN
        ALTER TABLE profiles ADD COLUMN provider_id TEXT;
    END IF;
    
    -- Add last_sign_in_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at') THEN
        ALTER TABLE profiles ADD COLUMN last_sign_in_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Create bookmarks table for saving stories
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Enable RLS on bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Add view_count and comment_count to stories if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'view_count') THEN
        ALTER TABLE stories ADD COLUMN view_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'comment_count') THEN
        ALTER TABLE stories ADD COLUMN comment_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create story_views table for tracking views
CREATE TABLE IF NOT EXISTS story_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, story_id)
);

-- Enable RLS on story_views
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Story views policies
CREATE POLICY "Users can view story views" ON story_views
    FOR SELECT USING (true);

CREATE POLICY "Users can create story views" ON story_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update view count
CREATE OR REPLACE FUNCTION update_story_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stories 
    SET view_count = (
        SELECT COUNT(*) 
        FROM story_views 
        WHERE story_id = NEW.story_id
    )
    WHERE id = NEW.story_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update view count
DROP TRIGGER IF EXISTS update_story_view_count_trigger ON story_views;
CREATE TRIGGER update_story_view_count_trigger
    AFTER INSERT ON story_views
    FOR EACH ROW
    EXECUTE FUNCTION update_story_view_count();
