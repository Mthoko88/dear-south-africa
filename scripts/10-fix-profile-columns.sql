-- Fix missing columns in profiles table
-- Add all columns with proper error handling

DO $$ 
BEGIN
    -- Basic demographic information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
        ALTER TABLE public.profiles ADD COLUMN display_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'use_pseudonym') THEN
        ALTER TABLE public.profiles ADD COLUMN use_pseudonym BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'pseudonym') THEN
        ALTER TABLE public.profiles ADD COLUMN pseudonym TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'age_range') THEN
        ALTER TABLE public.profiles ADD COLUMN age_range TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'gender') THEN
        ALTER TABLE public.profiles ADD COLUMN gender TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'languages_spoken') THEN
        ALTER TABLE public.profiles ADD COLUMN languages_spoken TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'nationality') THEN
        ALTER TABLE public.profiles ADD COLUMN nationality TEXT;
    END IF;

    -- Location and housing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'province') THEN
        ALTER TABLE public.profiles ADD COLUMN province TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'township') THEN
        ALTER TABLE public.profiles ADD COLUMN township TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'area_description') THEN
        ALTER TABLE public.profiles ADD COLUMN area_description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'housing_type') THEN
        ALTER TABLE public.profiles ADD COLUMN housing_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'household_size') THEN
        ALTER TABLE public.profiles ADD COLUMN household_size TEXT;
    END IF;

    -- Employment and economic status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'employment_status') THEN
        ALTER TABLE public.profiles ADD COLUMN employment_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'occupation') THEN
        ALTER TABLE public.profiles ADD COLUMN occupation TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'income_range') THEN
        ALTER TABLE public.profiles ADD COLUMN income_range TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'education_level') THEN
        ALTER TABLE public.profiles ADD COLUMN education_level TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'skills') THEN
        ALTER TABLE public.profiles ADD COLUMN skills TEXT;
    END IF;

    -- Family and care responsibilities
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'relationship_status') THEN
        ALTER TABLE public.profiles ADD COLUMN relationship_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'has_children') THEN
        ALTER TABLE public.profiles ADD COLUMN has_children TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'number_of_children') THEN
        ALTER TABLE public.profiles ADD COLUMN number_of_children TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'children_ages') THEN
        ALTER TABLE public.profiles ADD COLUMN children_ages TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_caregiver') THEN
        ALTER TABLE public.profiles ADD COLUMN is_caregiver BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'caregiver_for') THEN
        ALTER TABLE public.profiles ADD COLUMN caregiver_for TEXT;
    END IF;

    -- Health and wellbeing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'health_conditions') THEN
        ALTER TABLE public.profiles ADD COLUMN health_conditions TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'has_disability') THEN
        ALTER TABLE public.profiles ADD COLUMN has_disability TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'disability_type') THEN
        ALTER TABLE public.profiles ADD COLUMN disability_type TEXT;
    END IF;

    -- Transport and community
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'transport_method') THEN
        ALTER TABLE public.profiles ADD COLUMN transport_method TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'community_involvement') THEN
        ALTER TABLE public.profiles ADD COLUMN community_involvement TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'religious_affiliation') THEN
        ALTER TABLE public.profiles ADD COLUMN religious_affiliation TEXT;
    END IF;

    -- Challenges and support
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_challenges') THEN
        ALTER TABLE public.profiles ADD COLUMN current_challenges TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'support_needed') THEN
        ALTER TABLE public.profiles ADD COLUMN support_needed TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'support_can_provide') THEN
        ALTER TABLE public.profiles ADD COLUMN support_can_provide TEXT[] DEFAULT '{}';
    END IF;

    -- Interests and experience
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE public.profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'volunteer_experience') THEN
        ALTER TABLE public.profiles ADD COLUMN volunteer_experience TEXT;
    END IF;

    -- Privacy and connection settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'looking_for_connections') THEN
        ALTER TABLE public.profiles ADD COLUMN looking_for_connections BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'share_location') THEN
        ALTER TABLE public.profiles ADD COLUMN share_location BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'share_demographics') THEN
        ALTER TABLE public.profiles ADD COLUMN share_demographics BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'share_challenges') THEN
        ALTER TABLE public.profiles ADD COLUMN share_challenges BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'share_contact') THEN
        ALTER TABLE public.profiles ADD COLUMN share_contact BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'contact_method') THEN
        ALTER TABLE public.profiles ADD COLUMN contact_method TEXT;
    END IF;

END $$;

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
