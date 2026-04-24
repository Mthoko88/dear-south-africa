-- Remove any triggers that might be causing auth issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_oauth_user();

-- Clean up any duplicate or problematic functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_oauth_user() CASCADE;

-- Ensure profiles table has proper structure
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN full_name SET NOT NULL;

-- Add unique constraint on username if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_username_key' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
    END IF;
END $$;
