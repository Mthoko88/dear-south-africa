-- Add ethnicity column to profiles table for more representative AI image generation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ethnicity TEXT;

-- Add gender column as well for better representation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- Comment explaining the purpose
COMMENT ON COLUMN profiles.ethnicity IS 'User ethnicity for representative AI image generation (e.g., Black African, Coloured, Indian, White, Other)';
COMMENT ON COLUMN profiles.gender IS 'User gender for representative AI image generation';
