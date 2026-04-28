-- Create organisation_follows table for NGO follow functionality
CREATE TABLE IF NOT EXISTS organisation_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organisation_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organisation_follows_org ON organisation_follows(organisation_id);
CREATE INDEX IF NOT EXISTS idx_organisation_follows_user ON organisation_follows(user_id);

-- Enable RLS
ALTER TABLE organisation_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view organisation follows" ON organisation_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow organisations" ON organisation_follows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow organisations" ON organisation_follows
  FOR DELETE USING (auth.uid() = user_id);

-- Add follower_count column to organisations if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'organisations' AND column_name = 'follower_count') THEN
    ALTER TABLE organisations ADD COLUMN follower_count INTEGER DEFAULT 0;
  END IF;
END $$;
