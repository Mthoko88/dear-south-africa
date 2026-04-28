-- Drop existing columns that might conflict and add comprehensive profile fields
-- This covers all aspects NGOs typically need for community profiling

-- Basic demographic information
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_pseudonym BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pseudonym TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages_spoken TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nationality TEXT;

-- Location and housing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS township TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS area_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS housing_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS household_size TEXT;

-- Employment and economic status
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS income_range TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT;

-- Family and care responsibilities
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relationship_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_children TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS number_of_children TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS children_ages TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_caregiver BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS caregiver_for TEXT;

-- Health and wellbeing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_conditions TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_disability TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS disability_type TEXT;

-- Transport and community
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS transport_method TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS community_involvement TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS religious_affiliation TEXT;

-- Challenges and support
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_challenges TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS support_needed TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS support_can_provide TEXT[] DEFAULT '{}';

-- Interests and experience
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS volunteer_experience TEXT;

-- Privacy and connection settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for_connections BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_location BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_demographics BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_challenges BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS share_contact BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_method TEXT;

-- Create indexes for better query performance on commonly searched fields
CREATE INDEX IF NOT EXISTS idx_profiles_province ON public.profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_township ON public.profiles(township);
CREATE INDEX IF NOT EXISTS idx_profiles_age_range ON public.profiles(age_range);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_employment ON public.profiles(employment_status);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON public.profiles(education_level);
CREATE INDEX IF NOT EXISTS idx_profiles_housing ON public.profiles(housing_type);

-- GIN indexes for array fields to enable efficient searching
CREATE INDEX IF NOT EXISTS idx_profiles_languages ON public.profiles USING GIN(languages_spoken);
CREATE INDEX IF NOT EXISTS idx_profiles_health ON public.profiles USING GIN(health_conditions);
CREATE INDEX IF NOT EXISTS idx_profiles_transport ON public.profiles USING GIN(transport_method);
CREATE INDEX IF NOT EXISTS idx_profiles_challenges ON public.profiles USING GIN(current_challenges);
CREATE INDEX IF NOT EXISTS idx_profiles_support_needed ON public.profiles USING GIN(support_needed);
CREATE INDEX IF NOT EXISTS idx_profiles_support_provide ON public.profiles USING GIN(support_can_provide);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);

-- Index for connection matching
CREATE INDEX IF NOT EXISTS idx_profiles_connections ON public.profiles(looking_for_connections);
CREATE INDEX IF NOT EXISTS idx_profiles_share_location ON public.profiles(share_location);
CREATE INDEX IF NOT EXISTS idx_profiles_share_demographics ON public.profiles(share_demographics);
CREATE INDEX IF NOT EXISTS idx_profiles_share_challenges ON public.profiles(share_challenges);
