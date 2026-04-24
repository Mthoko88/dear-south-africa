-- Create organisations table for NGOs, NPOs, NPCs, PBOs, and CSIs
CREATE TABLE IF NOT EXISTS public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Account ownership
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Information
  trading_name TEXT NOT NULL,
  registered_name TEXT,
  registration_number TEXT,
  organisation_type TEXT NOT NULL CHECK (organisation_type IN ('ngo', 'npo', 'npc', 'pbo', 'csi', 'other')),
  
  -- Description & Mission
  description TEXT,
  mission_statement TEXT,
  focus_areas TEXT[], -- Array of focus areas like health, education, etc.
  sdg_goals INTEGER[], -- UN Sustainable Development Goals (1-17)
  
  -- Contact Information
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Address
  physical_address TEXT,
  physical_address_code TEXT,
  postal_address TEXT,
  postal_address_code TEXT,
  
  -- Location
  province TEXT,
  city TEXT,
  
  -- Branding
  logo_url TEXT,
  cover_image_url TEXT,
  brand_color TEXT,
  
  -- Financial & Legal
  is_registered_for_tax BOOLEAN DEFAULT false,
  section_18a_status BOOLEAN DEFAULT false, -- Tax-deductible donations
  has_annual_financial_statements BOOLEAN DEFAULT false,
  bbbee_level TEXT,
  
  -- Bank Details (encrypted/secure handling)
  bank_name TEXT,
  account_holder_name TEXT,
  account_type TEXT,
  branch_code TEXT,
  -- account_number stored securely, not in plain text ideally
  
  -- Leadership
  directors_trustees JSONB, -- Array of {name, designation, id_number, contact, email, gender}
  
  -- Beneficiaries
  beneficiary_demographics JSONB, -- {male: {african: x, white: x, ...}, female: {...}}
  beneficiary_locations TEXT[], -- Provinces served
  
  -- Social Media
  facebook_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  
  -- Verification & Status
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  
  -- Previous Funding
  previous_funders JSONB, -- Array of {date, organisation, amount, initiative}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_organisations_user_id ON public.organisations(user_id);
CREATE INDEX IF NOT EXISTS idx_organisations_type ON public.organisations(organisation_type);
CREATE INDEX IF NOT EXISTS idx_organisations_province ON public.organisations(province);
CREATE INDEX IF NOT EXISTS idx_organisations_verified ON public.organisations(is_verified);
CREATE INDEX IF NOT EXISTS idx_organisations_focus_areas ON public.organisations USING GIN(focus_areas);

-- Enable RLS
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view verified organisations" 
  ON public.organisations 
  FOR SELECT 
  USING (is_verified = true AND is_active = true);

CREATE POLICY "Users can view their own organisations" 
  ON public.organisations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organisations" 
  ON public.organisations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organisations" 
  ON public.organisations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own organisations" 
  ON public.organisations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_organisations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS organisations_updated_at ON public.organisations;
CREATE TRIGGER organisations_updated_at
  BEFORE UPDATE ON public.organisations
  FOR EACH ROW
  EXECUTE FUNCTION update_organisations_updated_at();

-- Add account_type to profiles table to distinguish between individual and organisation accounts
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'individual' CHECK (account_type IN ('individual', 'organisation', 'admin'));

-- Add organisation_id to profiles for organisation members
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;

-- Add is_admin column for admin users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
