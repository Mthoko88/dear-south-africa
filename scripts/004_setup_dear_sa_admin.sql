-- Setup Dear SA as a verified organisation for admin posting
-- This script creates the Dear SA organisation and sets up admin roles

-- Create Dear SA as the primary platform organisation
INSERT INTO public.organisations (
  registered_name,
  trading_name,
  organisation_type,
  registration_number,
  description,
  mission_statement,
  province,
  city,
  email,
  website,
  is_verified,
  is_active
) VALUES (
  'Zebra Digital Media',
  'Dear South Africa',
  'Media Organisation',
  'N/A',
  'Dear South Africa (Dear SA) is a digital storytelling platform that gives ordinary South Africans a safe space to share their personal stories of struggle, growth, and triumph.',
  'To create a space where South Africans can share their stories, knowing that someone out there will read their story and feel less alone.',
  'Gauteng',
  'Pretoria',
  'info@dearsa.africa',
  'https://www.dearsa.africa',
  true,
  true
) ON CONFLICT DO NOTHING;
