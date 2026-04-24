-- Enhanced story filtering and tagging
CREATE TABLE IF NOT EXISTS story_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS story_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  mood VARCHAR(30) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Direct messaging system
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced reporting system
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  moderator_id UUID REFERENCES profiles(id),
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Support circles
CREATE TABLE IF NOT EXISTS support_circles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER DEFAULT 50,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS circle_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  circle_id UUID REFERENCES support_circles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- Professional resources
CREATE TABLE IF NOT EXISTS professional_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  contact_info JSONB,
  location VARCHAR(100),
  province VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  website_url VARCHAR(500),
  phone_number VARCHAR(20),
  email VARCHAR(100),
  services_offered TEXT[],
  target_demographics TEXT[],
  cost_info TEXT,
  availability_hours TEXT,
  languages_supported TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  content_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  privacy_preferences JSONB DEFAULT '{}',
  theme_preferences JSONB DEFAULT '{}',
  language_preference VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentorship program
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mentee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  area_of_support VARCHAR(100),
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Story interactions tracking
CREATE TABLE IF NOT EXISTS story_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL, -- 'view', 'like', 'share', 'bookmark', 'comment'
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, story_id, interaction_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_story_tags_story_id ON story_tags(story_id);
CREATE INDEX IF NOT EXISTS idx_story_tags_tag ON story_tags(tag);
CREATE INDEX IF NOT EXISTS idx_story_moods_story_id ON story_moods(story_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle_id ON circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_user_id ON circle_members(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_resources_category ON professional_resources(category);
CREATE INDEX IF NOT EXISTS idx_professional_resources_province ON professional_resources(province);
CREATE INDEX IF NOT EXISTS idx_story_interactions_user_id ON story_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_story_interactions_story_id ON story_interactions(story_id);

-- Enable RLS
ALTER TABLE story_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all story tags" ON story_tags FOR SELECT USING (true);
CREATE POLICY "Users can view all story moods" ON story_moods FOR SELECT USING (true);

CREATE POLICY "Users can view their conversations" ON conversations FOR SELECT USING (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = participant_1 OR auth.uid() = participant_2
);

CREATE POLICY "Users can view messages in their conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.participant_1 = auth.uid() OR conversations.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can view public support circles" ON support_circles FOR SELECT USING (
  NOT is_private OR 
  EXISTS (SELECT 1 FROM circle_members WHERE circle_members.circle_id = support_circles.id AND circle_members.user_id = auth.uid())
);

CREATE POLICY "Users can create support circles" ON support_circles FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can view circle memberships" ON circle_members FOR SELECT USING (true);
CREATE POLICY "Users can join circles" ON circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view professional resources" ON professional_resources FOR SELECT USING (true);

CREATE POLICY "Users can manage their preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view mentorship requests" ON mentorship_requests FOR SELECT USING (
  auth.uid() = mentee_id OR auth.uid() = mentor_id
);

CREATE POLICY "Users can create mentorship requests" ON mentorship_requests FOR INSERT WITH CHECK (
  auth.uid() = mentee_id
);

CREATE POLICY "Users can view all story interactions" ON story_interactions FOR SELECT USING (true);
CREATE POLICY "Users can create their own interactions" ON story_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON story_interactions FOR UPDATE USING (auth.uid() = user_id);
