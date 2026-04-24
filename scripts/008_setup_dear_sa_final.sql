-- Setup Dear South Africa as the platform organisation
-- This script creates the Dear SA organisation and links admin users to it

DO $$
DECLARE
  owner_user_id UUID;
  org_id UUID;
  admin_email_1 TEXT := 'dubemthokozisi28@gmail.com';
  admin_email_2 TEXT := 'info@dearsa.africa';
BEGIN
  -- Find the first admin user to be the owner
  SELECT p.user_id INTO owner_user_id
  FROM profiles p
  JOIN auth.users u ON p.user_id = u.id
  WHERE u.email = admin_email_1
  LIMIT 1;

  -- If first email not found, try second
  IF owner_user_id IS NULL THEN
    SELECT p.user_id INTO owner_user_id
    FROM profiles p
    JOIN auth.users u ON p.user_id = u.id
    WHERE u.email = admin_email_2
    LIMIT 1;
  END IF;

  -- Check if Dear SA organisation already exists
  SELECT id INTO org_id FROM organisations WHERE trading_name = 'Dear South Africa';
  
  -- If no org exists and we have an owner, create the organisation
  IF org_id IS NULL AND owner_user_id IS NOT NULL THEN
    INSERT INTO organisations (
      user_id,
      registered_name,
      trading_name,
      organisation_type,
      email,
      description,
      mission_statement,
      is_verified,
      website,
      province,
      city
    ) VALUES (
      owner_user_id,
      'Dear South Africa (Pty) Ltd',
      'Dear South Africa',
      'npo',
      'info@dearsa.africa',
      'Dear South Africa is a digital storytelling platform where ordinary South Africans share their experiences, struggles, and triumphs. We believe that by sharing our stories, we can help others feel less alone and create a more connected community.',
      'To create a safe space where every South African voice can be heard, fostering healing, understanding, and community through the power of shared stories.',
      true,
      'https://www.dearsa.africa',
      'Gauteng',
      'Johannesburg'
    )
    RETURNING id INTO org_id;
    
    RAISE NOTICE 'Created Dear South Africa organisation with ID: %', org_id;
  ELSIF org_id IS NOT NULL THEN
    RAISE NOTICE 'Dear South Africa organisation already exists with ID: %', org_id;
  END IF;
  
  -- If we have an org_id, link admin users to it
  IF org_id IS NOT NULL THEN
    -- Update first admin
    UPDATE profiles p
    SET organisation_id = org_id, is_admin = true
    FROM auth.users u
    WHERE p.user_id = u.id AND u.email = admin_email_1;
    
    IF FOUND THEN
      RAISE NOTICE 'Linked % to Dear SA organisation', admin_email_1;
    END IF;
    
    -- Update second admin
    UPDATE profiles p
    SET organisation_id = org_id, is_admin = true
    FROM auth.users u
    WHERE p.user_id = u.id AND u.email = admin_email_2;
    
    IF FOUND THEN
      RAISE NOTICE 'Linked % to Dear SA organisation', admin_email_2;
    END IF;
  ELSE
    RAISE NOTICE 'Could not create organisation - no admin users found with emails: % or %', admin_email_1, admin_email_2;
  END IF;
  
END $$;
