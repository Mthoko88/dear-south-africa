-- Function to update story vote counts
CREATE OR REPLACE FUNCTION update_story_votes(story_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.stories 
  SET 
    upvotes = (SELECT COUNT(*) FROM public.votes WHERE votes.story_id = update_story_votes.story_id AND vote_type = 'up'),
    downvotes = (SELECT COUNT(*) FROM public.votes WHERE votes.story_id = update_story_votes.story_id AND vote_type = 'down')
  WHERE id = update_story_votes.story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment story view count
CREATE OR REPLACE FUNCTION increment_story_views(story_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.stories 
  SET view_count = view_count + 1
  WHERE id = increment_story_views.story_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
