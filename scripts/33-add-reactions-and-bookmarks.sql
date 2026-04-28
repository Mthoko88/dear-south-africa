-- Create story_reactions table for likes, hearts, etc.
CREATE TABLE IF NOT EXISTS story_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'heart', 'support', 'relate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id, reaction_type)
);

-- Create story_bookmarks table
CREATE TABLE IF NOT EXISTS story_bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(story_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_reactions_user_id ON story_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_story_bookmarks_story_id ON story_bookmarks(story_id);
CREATE INDEX IF NOT EXISTS idx_story_bookmarks_user_id ON story_bookmarks(user_id);

-- Enable RLS
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for story_reactions
CREATE POLICY "Users can view all reactions" ON story_reactions
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own reactions" ON story_reactions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for story_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON story_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks" ON story_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON story_reactions TO authenticated;
GRANT ALL ON story_bookmarks TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
