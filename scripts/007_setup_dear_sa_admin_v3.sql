-- Setup Dear South Africa Organisation and Admin Users
-- This script creates the Dear SA organisation and links admin users to it

-- Step 1: Create the Dear South Africa organisation
-- First, we need to get a user_id to be the owner. We'll use the first admin email found.
DO $$
DECLARE
  owner_user_id UUID;
  org_id UUID;
BEGIN
  -- Get user_id for dubemthokozisi28@gmail.com
  SELECT p.user_id INTO owner_user_id
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE u.email = 'dubemthokozisi28@gmail.com'
  LIMIT 1;

  -- If not found, try info@dearsa.africa
  IF owner_user_id IS NULL THEN
    SELECT p.user_id INTO owner_user_id
    FROM profiles p
    JOIN auth.users u ON u.id = p.user_id
    WHERE u.email = 'info@dearsa.africa'
    LIMIT 1;
  END IF;

  -- If still not found, use any existing user
  IF owner_user_id IS NULL THEN
    SELECT user_id INTO owner_user_id FROM profiles LIMIT 1;
  END IF;

  -- Check if Dear SA organisation already exists
  SELECT id INTO org_id FROM organisations WHERE trading_name = 'Dear South Africa' LIMIT 1;

  -- Create the organisation if it doesn't exist
  IF org_id IS NULL AND owner_user_id IS NOT NULL THEN
    INSERT INTO organisations (
      user_id,
      registered_name,
      trading_name,
      organisation_type,
      email,
      description,
      is_verified,
      logo_url
    ) VALUES (
      owner_user_id,
      'Dear South Africa (Pty) Ltd',
      'Dear South Africa',
      'social_enterprise',
      'info@dearsa.africa',
      'Dear South Africa is a platform where ordinary South Africans can share their stories, experiences, and perspectives. By sharing your story, someone out there can relate, learn, or heal from your experience.',
      true,
      NULL
    )
    RETURNING id INTO org_id;
    
    RAISE NOTICE 'Created Dear South Africa organisation with id: %', org_id;
  ELSE
    RAISE NOTICE 'Dear South Africa organisation already exists with id: %', org_id;
  END IF;

  -- Step 2: Update admin profiles to link them to the organisation
  IF org_id IS NOT NULL THEN
    -- Update dubemthokozisi28@gmail.com
    UPDATE profiles p
    SET organisation_id = org_id, is_admin = true
    FROM auth.users u
    WHERE u.id = p.user_id AND u.email = 'dubemthokozisi28@gmail.com';

    -- Update info@dearsa.africa
    UPDATE profiles p
    SET organisation_id = org_id, is_admin = true
    FROM auth.users u
    WHERE u.id = p.user_id AND u.email = 'info@dearsa.africa';

    RAISE NOTICE 'Updated admin profiles with organisation_id: %', org_id;
  END IF;
END $$;

-- Verify the setup
SELECT 
  p.user_id,
  u.email,
  p.is_admin,
  p.organisation_id,
  o.trading_name as org_name
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
LEFT JOIN organisations o ON o.id = p.organisation_id
WHERE u.email IN ('dubemthokozisi28@gmail.com', 'info@dearsa.africa');
