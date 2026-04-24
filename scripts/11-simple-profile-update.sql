-- Simple update to add only the essential columns we need
-- This is a more conservative approach that adds columns one by one

-- Add basic extended profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS township TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level TEXT;

-- Add array fields for interests and challenges
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS challenges_faced TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS willing_to_help_with TEXT[] DEFAULT '{}';

-- Add privacy settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for_connections BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_age BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_gender BOOLEAN DEFAULT TRUE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_province ON public.profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON public.profiles(age_range);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_challenges ON public.profiles USING GIN(challenges_faced);
CREATE INDEX IF NOT EXISTS idx_profiles_help ON public.profiles USING GIN(willing_to_help_with);
