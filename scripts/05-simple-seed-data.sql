-- Let's create some simple test data to get started
-- First, let's insert some basic profiles
INSERT INTO public.profiles (id, username, full_name, bio, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'thabo_m', 'Thabo Mthembu', 'Medical student at UCT, passionate about education and community development.', 'Cape Town, Western Cape'),
  ('550e8400-e29b-41d4-a716-446655440002', 'nomsa_k', 'Nomsa Khumalo', 'Community chef and entrepreneur. Turning challenges into opportunities.', 'Johannesburg, Gauteng'),
  ('550e8400-e29b-41d4-a716-446655440003', 'sipho_d', 'Sipho Dlamini', 'Advocate for LGBTQ+ rights and authentic living.', 'Durban, KwaZulu-Natal'),
  ('550e8400-e29b-41d4-a716-446655440004', 'grace_m', 'Grace Mabaso', 'Community organizer and urban farming enthusiast.', 'Alexandra, Gauteng')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location;

-- Now let's insert a simple story to test
INSERT INTO public.stories (id, title, content, author_id, category, location, upvotes, view_count) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'My First Story on Dear South Africa',
    'Welcome to Dear South Africa! This is a test story to make sure everything is working properly. 

This platform is designed to be a safe space where South Africans can share their authentic experiences, connect with others who have similar stories, and find healing through community.

Whether your story is about overcoming challenges, celebrating victories, or simply sharing a moment that changed your life, this is your space to be heard.',
    '550e8400-e29b-41d4-a716-446655440001',
    'Community',
    'South Africa',
    5,
    25
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  location = EXCLUDED.location;
