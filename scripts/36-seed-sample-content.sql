-- Seed sample profiles and stories for Dear South Africa

-- First, let's create some sample user profiles
-- Note: These are linked to auth.users, so we'll use INSERT with proper user_id references
-- For demo purposes, we'll create profiles that can be used for stories

-- Insert sample profiles (using realistic South African context)
INSERT INTO profiles (user_id, username, full_name, bio, avatar_url)
VALUES 
  (gen_random_uuid(), 'thabo_m', 'Thabo Molefe', 'Sharing my journey from Soweto. Mental health advocate and proud South African.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=thabo'),
  (gen_random_uuid(), 'zanele_k', 'Zanele Khumalo', 'Teacher from Durban. Passionate about education and youth empowerment.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zanele'),
  (gen_random_uuid(), 'sipho_ndlovu', 'Sipho Ndlovu', 'Engineer from Cape Town. Believer in second chances.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sipho'),
  (gen_random_uuid(), 'nomsa_dlamini', 'Nomsa Dlamini', 'Small business owner from Johannesburg. Mother of three.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nomsa'),
  (gen_random_uuid(), 'mandla_zulu', 'Mandla Zulu', 'Social worker from Pietermaritzburg. Mental health advocate.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mandla')
ON CONFLICT (user_id) DO NOTHING;

-- Now insert sample stories using the profiles we just created
WITH profile_ids AS (
  SELECT user_id, username FROM profiles WHERE username IN ('thabo_m', 'zanele_k', 'sipho_ndlovu', 'nomsa_dlamini', 'mandla_zulu')
)
INSERT INTO stories (user_id, title, content, category_id, is_published, upvotes)
SELECT 
  (SELECT user_id FROM profile_ids WHERE username = 'thabo_m'),
  'Finding Strength After Loss',
  E'Dear South Africa,\n\nI never thought I would be sharing this, but here I am. Three years ago, I lost my younger brother to depression. He was only 24 years old, full of life and dreams.\n\nThe pain was unbearable. I blamed myself for not seeing the signs, for not being there when he needed me most. I fell into a dark place, unable to function, unable to sleep.\n\nBut slowly, with the help of therapy and my community in Soweto, I began to heal. I learned that mental health is just as important as physical health. I learned that it''s okay to ask for help.\n\nToday, I volunteer at a youth mental health organization. Every person I help is a step towards honoring my brother''s memory. His story didn''t end with tragedy - it inspired change.\n\nIf you''re struggling, please reach out. You are not alone. We are stronger together.\n\nThabo',
  (SELECT id FROM categories WHERE slug = 'mental-health' LIMIT 1),
  true,
  45
WHERE NOT EXISTS (SELECT 1 FROM stories WHERE title = 'Finding Strength After Loss');

INSERT INTO stories (user_id, title, content, category_id, is_published, upvotes)
SELECT 
  (SELECT user_id FROM profile_ids WHERE username = 'zanele_k'),
  'From Dropout to Graduate: My Education Journey',
  E'Dear South Africa,\n\nI dropped out of school when I was 16. My family couldn''t afford the fees, and I needed to work to help put food on the table. For years, I felt ashamed, like I had failed.\n\nBut at 28, I decided to go back. I enrolled in night classes while working as a domestic worker during the day. It was exhausting. There were nights I cried from frustration, wanting to give up.\n\nMy children watched me study at the kitchen table. They saw me struggle with math problems, practice English, push through when I was tired. And they saw me graduate.\n\nLast year, I became a qualified teacher. Now I teach at a school in Durban, and every day I look at my students and see myself. I see their potential, their dreams, their struggles.\n\nEducation changed my life. If you''re thinking about going back to school, no matter your age - do it. It''s never too late to chase your dreams.\n\nWith hope,\nZanele',
  (SELECT id FROM categories WHERE slug = 'personal-growth' LIMIT 1),
  true,
  67
WHERE NOT EXISTS (SELECT 1 FROM stories WHERE title = 'From Dropout to Graduate: My Education Journey');

INSERT INTO stories (user_id, title, content, category_id, is_published, upvotes)
SELECT 
  (SELECT user_id FROM profile_ids WHERE username = 'sipho_ndlovu'),
  'Rebuilding After Addiction',
  E'Dear South Africa,\n\nI was addicted to drugs for 8 years. I lost my job, my family, my dignity. I slept on the streets of Cape Town, begging for money to feed my addiction.\n\nRock bottom came when my 6-year-old daughter saw me high and asked her mother, "Why doesn''t daddy love us anymore?" Those words shattered me.\n\nI checked into rehab the next day. The first month was hell. Withdrawal, guilt, shame - it all came crashing down. But I kept going. One day at a time.\n\nToday, I''m 3 years sober. I have my family back. I have a job as an engineer again. I mentor young people struggling with addiction.\n\nRecovery is possible. If you''re struggling, please don''t give up. There are people who care, who want to help. You deserve a second chance.\n\nYou are stronger than your addiction.\n\nSipho',
  (SELECT id FROM categories WHERE slug = 'mental-health' LIMIT 1),
  true,
  89
WHERE NOT EXISTS (SELECT 1 FROM stories WHERE title = 'Rebuilding After Addiction');

INSERT INTO stories (user_id, title, content, category_id, is_published, upvotes)
SELECT 
  (SELECT user_id FROM profile_ids WHERE username = 'nomsa_dlamini'),
  'Single Mother, Small Business Owner, Survivor',
  E'Dear South Africa,\n\nWhen my husband left us, I had three children under 10 and no income. I was scared, angry, and didn''t know how I would survive.\n\nI started selling vetkoek from my home in Alexandra. R5 each. I woke up at 4am every day to prepare. My children helped me package them before school.\n\nSome days were so hard. The rent was due, the kids needed school shoes, and I had R50 to my name. But I kept going.\n\nSix years later, I now have a small restaurant in Johannesburg. I employ 5 people. My children are all in school, doing well.\n\nI''m not special. I''m just a mother who refused to give up. If you''re facing hard times, remember: This too shall pass. Keep pushing. Better days are coming.\n\nYou are capable of more than you know.\n\nNomsa',
  (SELECT id FROM categories WHERE slug = 'family-relationships' LIMIT 1),
  true,
  112
WHERE NOT EXISTS (SELECT 1 FROM stories WHERE title = 'Single Mother, Small Business Owner, Survivor');

INSERT INTO stories (user_id, title, content, category_id, is_published, upvotes)
SELECT 
  (SELECT user_id FROM profile_ids WHERE username = 'mandla_zulu'),
  'Breaking the Silence on Men''s Mental Health',
  E'Dear South Africa,\n\nAs a man, I was taught to be strong. "Boys don''t cry." "Man up." "Deal with it."\n\nSo when I started having panic attacks at 32, I hid it. I suffered in silence, afraid of being seen as weak. My marriage was falling apart. I was drinking too much. I felt like I was drowning.\n\nOne night, I broke down completely. My wife held me while I cried - really cried - for the first time in years. She convinced me to see a therapist.\n\nTherapy saved my life. I learned that asking for help isn''t weakness - it''s courage. I learned that mental health struggles don''t make you less of a man.\n\nNow I work as a social worker in Pietermaritzburg, helping men open up about their struggles. Every day, I see the relief on their faces when they realize they''re not alone.\n\nTo every man reading this: It''s okay to not be okay. Your mental health matters. Reach out. Get help. You deserve to be happy.\n\nIn solidarity,\nMandla',
  (SELECT id FROM categories WHERE slug = 'mental-health' LIMIT 1),
  true,
  78
WHERE NOT EXISTS (SELECT 1 FROM stories WHERE title = 'Breaking the Silence on Men''s Mental Health');

-- Add some sample comments/reactions to make the stories feel more alive
WITH story_ids AS (
  SELECT id, user_id FROM stories WHERE is_published = true LIMIT 3
),
commenter_ids AS (
  SELECT user_id FROM profiles WHERE username IN ('zanele_k', 'sipho_ndlovu') LIMIT 2
)
INSERT INTO comments (story_id, user_id, content)
SELECT 
  (SELECT id FROM story_ids LIMIT 1),
  (SELECT user_id FROM commenter_ids LIMIT 1),
  'Thank you for sharing this. Your courage inspires me.'
WHERE NOT EXISTS (SELECT 1 FROM comments WHERE content LIKE '%courage inspires%');

-- Log the seeding
DO $$
BEGIN
  RAISE NOTICE 'Sample content seeded successfully!';
  RAISE NOTICE 'Created 5 sample profiles and 5 sample stories.';
END $$;
