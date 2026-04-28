-- Setup Dear South Africa Organisation and Admin Users
-- This script creates the official Dear SA organisation and links admin profiles to it

-- Step 1: Create the Dear South Africa organisation (using a fixed UUID for consistency)
INSERT INTO organisations (
  id,
  user_id,
  trading_name,
  registered_name,
  organisation_type,
  description,
  mission_statement,
  email,
  website,
  province,
  city,
  is_verified,
  is_active
)
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid,
  (SELECT user_id FROM profiles WHERE id = (SELECT MIN(id) FROM profiles) LIMIT 1),
  'Dear South Africa',
  'Dear South Africa (Pty) Ltd',
  'media',
  'Dear South Africa is a platform where ordinary South Africans can share their stories, experiences, and perspectives. We believe that by sharing our stories, we can help others feel less alone and build a stronger, more connected community.',
  'To give every South African a voice and create a space for authentic storytelling that heals, inspires, and connects our nation.',
  'info@dearsa.africa',
  'https://www.dearsa.africa',
  'Gauteng',
  'Johannesburg',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM organisations WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Step 2: Update admin profiles to link them to the Dear SA organisation
-- First, mark the profiles as admin and link to organisation
UPDATE profiles 
SET 
  is_admin = true,
  organisation_id = '00000000-0000-0000-0000-000000000001'::uuid
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('dubemthokozisi28@gmail.com', 'info@dearsa.africa')
);

-- Step 3: Update the organisation's user_id to match one of the admins
UPDATE organisations 
SET user_id = (
  SELECT user_id FROM profiles 
  WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('dubemthokozisi28@gmail.com', 'info@dearsa.africa')
  )
  LIMIT 1
)
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
