-- Create a simple demo story that doesn't depend on specific user profiles
-- This will work once you sign up and create your first user

-- First, let's create a simple welcome story that can be inserted manually
-- You'll need to replace the author_id with your actual user ID after signing up

-- For now, let's just create the story structure
-- The actual story will be created when a real user signs up

-- Create a function to insert demo content for new users
CREATE OR REPLACE FUNCTION public.create_demo_content_for_user(user_id UUID, user_username TEXT)
RETURNS void AS $$
BEGIN
  -- Insert a welcome story for the new user
  INSERT INTO public.stories (
    title, 
    content, 
    author_id, 
    category, 
    location, 
    upvotes, 
    view_count
  ) VALUES (
    'Welcome to Dear South Africa!',
    'Welcome to our community platform where South Africans share their authentic stories, connect with others, and find healing through shared experiences.

This is your space to:
• Share your personal journey and experiences
• Connect with others who understand your story
• Find support and encouragement from your community
• Discover stories that inspire and heal

Whether you''re from Cape Town to Limpopo, from the townships to the suburbs, your story matters. Someone out there needs to hear exactly what you have to share.

Start by exploring the stories already shared, and when you''re ready, click "Share Your Story" to add your voice to our growing community.

Together, we heal. Together, we grow. Together, we are stronger.

#DearSouthAfrica #CommunityHealing #YourStoryMatters',
    user_id,
    'Community',
    'South Africa',
    1,
    1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the user creation trigger to also create demo content
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  username_value TEXT;
BEGIN
  -- Create the username
  username_value := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  
  -- Insert the profile
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    username_value,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Create demo content for the new user
  PERFORM public.create_demo_content_for_user(new.id, username_value);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
