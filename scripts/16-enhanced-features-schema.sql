-- Enhanced features schema for Dear South Africa platform

-- Story recommendations and views tracking
CREATE TABLE IF NOT EXISTS story_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_duration INTEGER DEFAULT 0, -- seconds spent reading
    UNIQUE(user_id, story_id)
);

-- Story reactions (beyond just upvotes/downvotes)
CREATE TABLE IF NOT EXISTS story_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'strength', 'hope', 'relate', 'inspire', 'support')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, story_id, reaction_type)
);

-- Reading lists for organizing stories
CREATE TABLE IF NOT EXISTS reading_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_list_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reading_list_id UUID REFERENCES reading_lists(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    UNIQUE(reading_list_id, story_id)
);

-- Support circles for community building
CREATE TABLE IF NOT EXISTS support_circles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    max_members INTEGER DEFAULT 50,
    is_private BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circle_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    circle_id UUID REFERENCES support_circles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(circle_id, user_id)
);

CREATE TABLE IF NOT EXISTS circle_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    circle_id UUID REFERENCES support_circles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'link')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource directory for community resources
CREATE TABLE IF NOT EXISTS resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    contact_info TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    province TEXT,
    township TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_crisis_support BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements and badges
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT,
    category TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    requirements JSONB, -- Flexible requirements structure
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB, -- Track progress towards achievement
    UNIQUE(user_id, achievement_id)
);

-- Story collections and themes
CREATE TABLE IF NOT EXISTS story_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    theme TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id UUID REFERENCES story_collections(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_index INTEGER DEFAULT 0,
    UNIQUE(collection_id, story_id)
);

-- Mentorship connections
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentee_id, mentor_id, category)
);

-- Community polls and surveys
CREATE TABLE IF NOT EXISTS community_polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    poll_type TEXT DEFAULT 'multiple_choice' CHECK (poll_type IN ('multiple_choice', 'single_choice', 'text')),
    options JSONB, -- Array of poll options
    is_anonymous BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES community_polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    response JSONB NOT NULL, -- Flexible response structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Content moderation
CREATE TABLE IF NOT EXISTS content_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('story', 'comment', 'message', 'profile')),
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
    language_preference TEXT DEFAULT 'en',
    theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    content_warnings_enabled BOOLEAN DEFAULT TRUE,
    mature_content_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extend profiles table with comprehensive fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS use_pseudonym BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pseudonym TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'South African';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS township TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS area_description TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS housing_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS household_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS income_range TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS relationship_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_children TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS number_of_children TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS children_ages TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_caregiver BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS caregiver_for TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS health_conditions TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_disability TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disability_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS transport_method TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS community_involvement TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS religious_affiliation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS volunteer_experience TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_challenges TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS support_needed TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS support_can_provide TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_for_connections BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_demographics BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_challenges BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS share_contact BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_method TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_views_user_id ON story_views(user_id);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewed_at ON story_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_story_reactions_user_id ON story_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON story_reactions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_reactions_type ON story_reactions(reaction_type);

CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id ON reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_list_items_list_id ON reading_list_items(reading_list_id);

CREATE INDEX IF NOT EXISTS idx_support_circles_category ON support_circles(category);
CREATE INDEX IF NOT EXISTS idx_support_circles_created_by ON support_circles(created_by);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON circle_members(user_id);

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_province ON resources(province);
CREATE INDEX IF NOT EXISTS idx_resources_crisis_support ON resources(is_crisis_support);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_challenges ON profiles USING GIN(current_challenges);

-- Row Level Security Policies
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Story views policies
CREATE POLICY "Users can view their own story views" ON story_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own story views" ON story_views FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own story views" ON story_views FOR UPDATE USING (auth.uid() = user_id);

-- Story reactions policies
CREATE POLICY "Anyone can view story reactions" ON story_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reactions" ON story_reactions FOR ALL USING (auth.uid() = user_id);

-- Reading lists policies
CREATE POLICY "Users can view their own reading lists" ON reading_lists FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can manage their own reading lists" ON reading_lists FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view reading list items" ON reading_list_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM reading_lists WHERE id = reading_list_id AND (user_id = auth.uid() OR is_public = true))
);
CREATE POLICY "Users can manage their own reading list items" ON reading_list_items FOR ALL USING (
    EXISTS (SELECT 1 FROM reading_lists WHERE id = reading_list_id AND user_id = auth.uid())
);

-- Support circles policies
CREATE POLICY "Anyone can view public support circles" ON support_circles FOR SELECT USING (is_private = false OR created_by = auth.uid());
CREATE POLICY "Users can create support circles" ON support_circles FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Circle creators can update their circles" ON support_circles FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Circle members can view memberships" ON circle_members FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM circle_members cm WHERE cm.circle_id = circle_members.circle_id AND cm.user_id = auth.uid())
);
CREATE POLICY "Users can join circles" ON circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave circles" ON circle_members FOR DELETE USING (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Anyone can view resources" ON resources FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add resources" ON resources FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Resource creators can update their resources" ON resources FOR UPDATE USING (auth.uid() = created_by);

-- Achievements policies
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view their own user achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert user achievements" ON user_achievements FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Functions for calculating recommendation scores
CREATE OR REPLACE FUNCTION calculate_story_recommendation_score(
    target_user_id UUID,
    story_record stories
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    user_profile profiles;
BEGIN
    -- Get user profile
    SELECT * INTO user_profile FROM profiles WHERE id = target_user_id;
    
    IF user_profile IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Category interest match
    IF user_profile.interests && ARRAY[story_record.category] THEN
        score := score + 30;
    END IF;
    
    -- Location proximity
    IF user_profile.province = story_record.location OR story_record.location LIKE '%' || user_profile.province || '%' THEN
        score := score + 20;
    END IF;
    
    -- Challenge similarity
    IF user_profile.current_challenges && ARRAY(
        SELECT unnest(string_to_array(lower(story_record.title || ' ' || story_record.content), ' '))
        INTERSECT
        SELECT unnest(array_map(lower, user_profile.current_challenges))
    ) THEN
        score := score + 25;
    END IF;
    
    -- Engagement score
    score := score + LEAST((story_record.upvotes * 2 + story_record.view_count * 0.1)::INTEGER / 10, 20);
    
    -- Recency bonus
    IF story_record.created_at > NOW() - INTERVAL '7 days' THEN
        score := score + 10;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update user achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(user_id UUID) RETURNS VOID AS $$
DECLARE
    achievement_record achievements;
    story_count INTEGER;
    reaction_count INTEGER;
    circle_count INTEGER;
BEGIN
    -- Get user stats
    SELECT COUNT(*) INTO story_count FROM stories WHERE author_id = user_id;
    SELECT COUNT(*) INTO reaction_count FROM story_reactions WHERE user_id = user_id;
    SELECT COUNT(*) INTO circle_count FROM circle_members WHERE user_id = user_id;
    
    -- Check for "First Story" achievement
    IF story_count >= 1 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT user_id, id FROM achievements 
        WHERE name = 'First Story' 
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE user_achievements.user_id = check_and_award_achievements.user_id 
            AND achievement_id = achievements.id
        );
    END IF;
    
    -- Check for "Storyteller" achievement (5 stories)
    IF story_count >= 5 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT user_id, id FROM achievements 
        WHERE name = 'Storyteller' 
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE user_achievements.user_id = check_and_award_achievements.user_id 
            AND achievement_id = achievements.id
        );
    END IF;
    
    -- Check for "Community Supporter" achievement (50 reactions)
    IF reaction_count >= 50 THEN
        INSERT INTO user_achievements (user_id, achievement_id)
        SELECT user_id, id FROM achievements 
        WHERE name = 'Community Supporter' 
        AND NOT EXISTS (
            SELECT 1 FROM user_achievements 
            WHERE user_achievements.user_id = check_and_award_achievements.user_id 
            AND achievement_id = achievements.id
        );
    END IF;
    
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically award achievements
CREATE OR REPLACE FUNCTION trigger_check_achievements() RETURNS TRIGGER AS $$
BEGIN
    PERFORM check_and_award_achievements(NEW.author_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER story_achievement_trigger
    AFTER INSERT ON stories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_check_achievements();
