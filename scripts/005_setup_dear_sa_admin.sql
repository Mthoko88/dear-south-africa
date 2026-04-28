-- Setup Dear South Africa organisation and admin users
-- This script creates the Dear SA organisation and links admin users to it

-- First, check if the Dear SA organisation exists, if not create it
INSERT INTO organisations (
  user_id,
  registered_name,
  trading_name,
  organisation_type,
  description,
  email,
  is_verified,
  logo_url
)
SELECT 
  (SELECT user_id FROM profiles WHERE email = 'dubemthokozisi28@gmail.com' LIMIT 1),
  'Zebra Digital Media (Pty) Ltd',
  'Dear South Africa',
  'social-enterprise',
  'Dear South Africa is a digital storytelling platform where ordinary South Africans share their personal stories, experiences, and perspectives. We believe that by sharing our stories, we can help others feel less alone.',
  'info@dearsa.africa',
  true,
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM organisations WHERE trading_name = 'Dear South Africa'
);

-- Update admin users to link them to the Dear SA organisation and mark as admin
-- For dubemthokozisi28@gmail.com
UPDATE profiles 
SET 
  is_admin = true,
  organisation_id = (SELECT id FROM organisations WHERE trading_name = 'Dear South Africa' LIMIT 1)
WHERE email = 'dubemthokozisi28@gmail.com';

-- For info@dearsa.africa (if this user exists)
UPDATE profiles 
SET 
  is_admin = true,
  organisation_id = (SELECT id FROM organisations WHERE trading_name = 'Dear South Africa' LIMIT 1)
WHERE email = 'info@dearsa.africa';

-- Verify the setup
SELECT 
  p.email,
  p.username,
  p.is_admin,
  p.organisation_id,
  o.trading_name as organisation_name
FROM profiles p
LEFT JOIN organisations o ON p.organisation_id = o.id
WHERE p.email IN ('dubemthokozisi28@gmail.com', 'info@dearsa.africa');
