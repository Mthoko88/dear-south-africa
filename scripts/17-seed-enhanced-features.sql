-- Seed data for enhanced features

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, category, points) VALUES
('First Story', 'Share your first story with the community', '📝', 'storytelling', 10),
('Storyteller', 'Share 5 stories with the community', '📚', 'storytelling', 50),
('Prolific Writer', 'Share 20 stories with the community', '✍️', 'storytelling', 200),
('Community Supporter', 'Give 50 reactions to other stories', '❤️', 'engagement', 100),
('Empathy Champion', 'Give 200 reactions to other stories', '🤗', 'engagement', 400),
('Circle Builder', 'Create your first support circle', '👥', 'community', 25),
('Circle Leader', 'Successfully moderate a support circle for 30 days', '👑', 'community', 100),
('Resource Helper', 'Add 5 resources to the community directory', '🏥', 'resources', 75),
('Connection Maker', 'Help connect 10 community members', '🤝', 'connections', 150),
('Reading Enthusiast', 'Read 50 stories from other community members', '📖', 'engagement', 100),
('List Curator', 'Create 5 reading lists', '📋', 'organization', 50),
('Mentor', 'Successfully mentor someone in the community', '🌟', 'mentorship', 200),
('Inspiration', 'Receive 100 "inspire" reactions on your stories', '💡', 'impact', 300),
('Beacon of Hope', 'Receive 50 "hope" reactions on your stories', '☀️', 'impact', 250),
('Community Pillar', 'Be active in the community for 6 months', '🏛️', 'dedication', 500)
ON CONFLICT (name) DO NOTHING;

-- Insert sample support circles
INSERT INTO support_circles (id, name, description, category, max_members, is_private, created_by) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Single Parents Support', 'A safe space for single parents to share experiences, challenges, and support each other through the journey of raising children alone.', 'Single Parents', 25, false, (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440002', 'Job Seekers Network', 'Connect with others looking for employment opportunities. Share job leads, interview tips, and support each other in the job search journey.', 'Job Seekers', 50, false, (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440003', 'Mental Health Warriors', 'A supportive community for those dealing with mental health challenges. Share coping strategies, celebrate small wins, and support each other.', 'Mental Health Support', 20, false, (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440004', 'Young Entrepreneurs', 'For aspiring and current young entrepreneurs to share business ideas, challenges, and celebrate successes together.', 'Entrepreneurs', 30, false, (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440005', 'LGBTQ+ Safe Space', 'A private, safe space for LGBTQ+ community members to connect, share experiences, and support each other.', 'LGBTQ+ Community', 15, true, (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440006', 'Women Empowerment Circle', 'Empowering women through shared experiences, mentorship, and mutual support in personal and professional growth.', 'Women''s Empowerment', 40, false, (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440007', 'Student Support Network', 'For students at all levels to share study tips, academic challenges, and support each other through their educational journey.', 'Students', 35, false, (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655440008', 'Addiction Recovery Support', 'A supportive community for those in recovery from addiction. Share experiences, celebrate milestones, and support each other.', 'Addiction Recovery', 20, true, (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- Add members to support circles
INSERT INTO circle_members (circle_id, user_id, role) VALUES
-- Single Parents Support
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'admin'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'member'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'member'),

-- Job Seekers Network
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'admin'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'member'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), 'member'),

-- Mental Health Warriors
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), 'admin'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'member'),

-- Young Entrepreneurs
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'admin'),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'member'),

-- LGBTQ+ Safe Space
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), 'admin'),

-- Women Empowerment Circle
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'admin'),
('550e8400-e29b-41d4-a716-446655440006', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'member'),

-- Student Support Network
('550e8400-e29b-41d4-a716-446655440007', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'admin'),

-- Addiction Recovery Support
('550e8400-e29b-41d4-a716-446655440008', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'admin')
ON CONFLICT (circle_id, user_id) DO NOTHING;

-- Insert sample resources
INSERT INTO resources (name, description, category, contact_info, address, phone, email, website, province, township, is_verified, is_crisis_support) VALUES
-- Crisis Support
('Lifeline South Africa', '24/7 crisis helpline providing emotional support to anyone in emotional distress or considering suicide.', 'crisis-support', 'Available 24/7, multilingual support', 'National Service', '0861 322 322', 'info@lifeline.org.za', 'https://www.lifeline.org.za', 'All Provinces', 'National', true, true),
('SADAG - Depression and Anxiety Helpline', 'Free mental health support and counseling services for depression, anxiety, and other mental health conditions.', 'mental-health', '8am-8pm weekdays, 8am-5pm weekends', 'National Service', '0800 567 567', 'help@sadag.org', 'https://www.sadag.org', 'All Provinces', 'National', true, true),
('Gender-Based Violence Command Centre', '24/7 helpline for victims of gender-based violence and domestic abuse.', 'domestic-violence', 'Available 24/7, free from all networks', 'National Service', '0800 428 428', 'info@gbv.org.za', 'https://www.gbv.org.za', 'All Provinces', 'National', true, true),

-- Healthcare
('Gauteng Department of Health', 'Public healthcare services including clinics, hospitals, and specialized care.', 'healthcare', 'Various clinic hours, emergency services 24/7', 'Multiple locations across Gauteng', '011 355 3000', 'info@health.gov.za', 'https://www.gauteng.gov.za/health', 'Gauteng', 'Multiple', true, false),
('Western Cape Department of Health', 'Comprehensive public healthcare services for Western Cape residents.', 'healthcare', 'Clinic hours vary, emergency services available', 'Multiple locations across Western Cape', '021 483 9999', 'health@westerncape.gov.za', 'https://www.westerncape.gov.za/health', 'Western Cape', 'Multiple', true, false),
('KwaZulu-Natal Department of Health', 'Public healthcare services including maternal health, HIV/AIDS treatment, and general medical care.', 'healthcare', 'Various service hours', 'Multiple locations across KZN', '033 395 2111', 'health@kznhealth.gov.za', 'https://www.kznhealth.gov.za', 'KwaZulu-Natal', 'Multiple', true, false),

-- Legal Aid
('Legal Aid South Africa', 'Free legal services for those who cannot afford private legal representation.', 'legal-aid', 'Monday-Friday 8am-4:30pm', 'Multiple offices nationwide', '0800 110 110', 'info@legal-aid.co.za', 'https://www.legal-aid.co.za', 'All Provinces', 'Multiple', true, false),
('Black Lawyers Association', 'Legal assistance and advocacy for disadvantaged communities.', 'legal-aid', 'Office hours vary by location', 'Various locations', '011 339 6080', 'info@bla.org.za', 'https://www.bla.org.za', 'Gauteng', 'Johannesburg', true, false),

-- Employment
('Department of Employment and Labour', 'Job placement services, skills development, and unemployment benefits.', 'employment', 'Monday-Friday 8am-4pm', 'Labour centres nationwide', '0800 030 007', 'info@labour.gov.za', 'https://www.labour.gov.za', 'All Provinces', 'Multiple', true, false),
('Harambee Youth Employment Accelerator', 'Connecting young people to economic opportunities through job matching and skills development.', 'employment', 'Various program schedules', 'Multiple locations', '011 447 7900', 'info@harambee.co.za', 'https://www.harambee.co.za', 'Gauteng', 'Johannesburg', true, false),

-- Education
('Department of Basic Education', 'Public schooling, adult education, and literacy programs.', 'education', 'School hours and adult education programs', 'Schools and centers nationwide', '012 357 3000', 'info@dbe.gov.za', 'https://www.education.gov.za', 'All Provinces', 'Multiple', true, false),
('University of South Africa (UNISA)', 'Distance learning and correspondence education opportunities.', 'education', 'Various support hours', 'Multiple campuses', '012 429 3111', 'info@unisa.ac.za', 'https://www.unisa.ac.za', 'All Provinces', 'Multiple', true, false),

-- Housing
('Department of Human Settlements', 'Housing assistance, RDP houses, and housing subsidies.', 'housing', 'Monday-Friday 8am-4pm', 'Provincial offices', '012 421 1411', 'info@dhs.gov.za', 'https://www.dhs.gov.za', 'All Provinces', 'Multiple', true, false),
('Habitat for Humanity South Africa', 'Affordable housing solutions and community development.', 'housing', 'Office hours vary', 'Various locations', '011 568 2222', 'info@habitat.org.za', 'https://www.habitat.org.za', 'Multiple', 'Multiple', true, false),

-- Food Security
('FoodForward SA', 'Food rescue and redistribution to communities in need.', 'food-security', 'Various distribution times', 'Multiple distribution points', '021 447 8444', 'info@foodforwardsa.org', 'https://www.foodforwardsa.org', 'Western Cape', 'Cape Town', true, false),
('Gift of the Givers', 'Disaster relief, food distribution, and humanitarian aid.', 'food-security', 'Emergency response 24/7', 'Multiple locations', '033 996 2111', 'info@giftofthegivers.org', 'https://www.giftofthegivers.org', 'KwaZulu-Natal', 'Pietermaritzburg', true, false),

-- Substance Abuse
('SANCA (South African National Council on Alcoholism)', 'Addiction treatment, counseling, and rehabilitation services.', 'substance-abuse', 'Various program schedules', 'Multiple centers', '011 892 3829', 'info@sanca.org.za', 'https://www.sanca.org.za', 'Gauteng', 'Johannesburg', true, false),
('Narcotics Anonymous South Africa', 'Support groups for people recovering from drug addiction.', 'substance-abuse', 'Meeting schedules vary', 'Various meeting locations', '083 900 6962', 'info@na.org.za', 'https://www.na.org.za', 'All Provinces', 'Multiple', true, false),

-- Disability Support
('Disabled People South Africa (DPSA)', 'Advocacy and support services for people with disabilities.', 'disability-support', 'Monday-Friday 8am-4:30pm', 'Provincial offices', '012 346 1165', 'info@dpsa.org.za', 'https://www.dpsa.org.za', 'All Provinces', 'Multiple', true, false),
('Association for the Physically Disabled', 'Support services, advocacy, and empowerment for people with physical disabilities.', 'disability-support', 'Office hours vary', 'Various locations', '021 555 2881', 'info@apd.org.za', 'https://www.apd.org.za', 'Western Cape', 'Cape Town', true, false),

-- Youth Services
('National Youth Development Agency', 'Youth development programs, skills training, and entrepreneurship support.', 'youth-services', 'Monday-Friday 8am-4:30pm', 'Provincial offices', '011 785 4500', 'info@nyda.gov.za', 'https://www.nyda.gov.za', 'All Provinces', 'Multiple', true, false),
('Lovelife', 'Youth health and development programs focusing on HIV prevention and life skills.', 'youth-services', 'Various program times', 'Multiple locations', '0800 121 900', 'info@lovelife.org.za', 'https://www.lovelife.org.za', 'All Provinces', 'Multiple', true, false),

-- Elderly Care
('Age-in-Action', 'Support services for older persons including healthcare, social services, and advocacy.', 'elderly-care', 'Monday-Friday 8am-4pm', 'Various service points', '021 762 1089', 'info@age-in-action.org.za', 'https://www.age-in-action.org.za', 'Western Cape', 'Cape Town', true, false),
('HelpAge South Africa', 'Advocacy and support for older persons'' rights and wellbeing.', 'elderly-care', 'Office hours vary', 'Provincial offices', '011 432 3925', 'info@helpage.co.za', 'https://www.helpage.co.za', 'Gauteng', 'Johannesburg', true, false)
ON CONFLICT DO NOTHING;

-- Insert sample reading lists
INSERT INTO reading_lists (id, user_id, name, description, is_public) VALUES
('660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'Inspiring Education Stories', 'Stories about overcoming educational challenges and achieving academic success', true),
('660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'Entrepreneurship Journey', 'Stories from fellow entrepreneurs about starting and growing businesses', true),
('660e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), 'LGBTQ+ Experiences', 'Stories from the LGBTQ+ community about acceptance, identity, and love', false),
('660e8400-e29b-41d4-a716-446655440004', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'Community Building', 'Stories about people making a difference in their communities', true),
('660e8400-e29b-41d4-a716-446655440005', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'Mental Health Support', 'Stories about mental health struggles and recovery', false)
ON CONFLICT (id) DO NOTHING;

-- Add some stories to reading lists
INSERT INTO reading_list_items (reading_list_id, story_id, notes) VALUES
('660e8400-e29b-41d4-a716-446655440001', '1', 'Amazing story about perseverance in education'),
('660e8400-e29b-41d4-a716-446655440002', '2', 'Great example of turning crisis into opportunity'),
('660e8400-e29b-41d4-a716-446655440003', '3', 'Powerful story about family acceptance'),
('660e8400-e29b-41d4-a716-446655440004', '4', 'Inspiring community garden project'),
('660e8400-e29b-41d4-a716-446655440004', '2', 'Shows how individual action can help community')
ON CONFLICT (reading_list_id, story_id) DO NOTHING;

-- Insert sample story reactions
INSERT INTO story_reactions (user_id, story_id, reaction_type) VALUES
-- Reactions to story 1 (Education story)
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '1', 'inspire'),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), '1', 'strength'),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '1', 'hope'),

-- Reactions to story 2 (COVID job loss story)
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '2', 'relate'),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), '2', 'inspire'),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '2', 'strength'),

-- Reactions to story 3 (Coming out story)
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '3', 'support'),
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '3', 'heart'),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '3', 'strength'),

-- Reactions to story 4 (Community garden)
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '4', 'inspire'),
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '4', 'support'),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), '4', 'hope')
ON CONFLICT (user_id, story_id, reaction_type) DO NOTHING;

-- Insert sample story views
INSERT INTO story_views (user_id, story_id, view_duration) VALUES
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '1', 180),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), '1', 240),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '1', 200),
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '2', 220),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), '2', 190),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '2', 210),
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '3', 300),
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '3', 280),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '3', 320),
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '4', 250),
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '4', 180),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), '4', 200)
ON CONFLICT (user_id, story_id) DO NOTHING;

-- Insert sample story collections
INSERT INTO story_collections (id, name, description, theme, created_by, is_featured, is_public) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'Overcoming Adversity', 'Stories of South Africans who have overcome significant challenges in their lives', 'resilience', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), true, true),
('770e8400-e29b-41d4-a716-446655440002', 'Community Heroes', 'Stories about ordinary people making extraordinary differences in their communities', 'community-impact', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), true, true),
('770e8400-e29b-41d4-a716-446655440003', 'Love and Acceptance', 'Stories about finding love, acceptance, and belonging in South African society', 'relationships', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), false, true),
('770e8400-e29b-41d4-a716-446655440004', 'Economic Empowerment', 'Stories about creating economic opportunities and financial independence', 'economics', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), true, true)
ON CONFLICT (id) DO NOTHING;

-- Add stories to collections
INSERT INTO collection_stories (collection_id, story_id, order_index) VALUES
-- Overcoming Adversity collection
('770e8400-e29b-41d4-a716-446655440001', '1', 1),
('770e8400-e29b-41d4-a716-446655440001', '2', 2),
('770e8400-e29b-41d4-a716-446655440001', '3', 3),

-- Community Heroes collection
('770e8400-e29b-41d4-a716-446655440002', '4', 1),
('770e8400-e29b-41d4-a716-446655440002', '2', 2),

-- Love and Acceptance collection
('770e8400-e29b-41d4-a716-446655440003', '3', 1),

-- Economic Empowerment collection
('770e8400-e29b-41d4-a716-446655440004', '2', 1)
ON CONFLICT (collection_id, story_id) DO NOTHING;

-- Insert sample user preferences
INSERT INTO user_preferences (user_id, email_notifications, push_notifications, privacy_level, language_preference, content_warnings_enabled) VALUES
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), true, true, 'public', 'en', true),
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), true, false, 'public', 'en', true),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), false, true, 'friends', 'en', true),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), true, true, 'public', 'en', false)
ON CONFLICT (user_id) DO NOTHING;

-- Award some initial achievements
INSERT INTO user_achievements (user_id, achievement_id) VALUES
-- First Story achievements
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), (SELECT id FROM achievements WHERE name = 'First Story')),
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), (SELECT id FROM achievements WHERE name = 'First Story')),
((SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), (SELECT id FROM achievements WHERE name = 'First Story')),
((SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), (SELECT id FROM achievements WHERE name = 'First Story')),

-- Community Supporter achievements for active users
((SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), (SELECT id FROM achievements WHERE name = 'Community Supporter')),
((SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), (SELECT id FROM achievements WHERE name = 'Community Supporter'))
ON CONFLICT (user_id, achievement_id) DO NOTHING;

-- Insert sample community polls
INSERT INTO community_polls (id, title, description, created_by, poll_type, options, is_anonymous, expires_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'What topics would you like to see more stories about?', 'Help us understand what kinds of stories resonate most with our community', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'multiple_choice', '["Mental Health", "Career Development", "Family Relationships", "Community Building", "Education", "Entrepreneurship", "Health & Wellness", "Social Justice"]', false, NOW() + INTERVAL '30 days'),
('880e8400-e29b-41d4-a716-446655440002', 'How has Dear South Africa impacted your life?', 'Share how this platform has made a difference in your journey', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'single_choice', '["Found support and understanding", "Gained new perspectives", "Felt less alone", "Discovered helpful resources", "Made meaningful connections", "Inspired to share my own story", "No significant impact yet"]', true, NOW() + INTERVAL '14 days'),
('880e8400-e29b-41d4-a716-446655440003', 'What new features would you like to see?', 'Help us prioritize development of new platform features', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), 'multiple_choice', '["Voice/Audio stories", "Video stories", "Live chat support", "Mentorship matching", "Local meetup organization", "Mobile app", "Multi-language support", "Professional counselor access"]', false, NOW() + INTERVAL '21 days')
ON CONFLICT (id) DO NOTHING;

-- Insert some sample poll responses
INSERT INTO poll_responses (poll_id, user_id, response) VALUES
('880e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '["Mental Health", "Entrepreneurship", "Community Building"]'),
('880e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), '["Mental Health", "Family Relationships", "Social Justice"]'),
('880e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '["Community Building", "Health & Wellness", "Education"]'),

('880e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '["Found support and understanding"]'),
('880e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), '["Inspired to share my own story"]'),

('880e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), '["Mobile app", "Multi-language support"]'),
('880e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), '["Voice/Audio stories", "Mentorship matching", "Local meetup organization"]')
ON CONFLICT (poll_id, user_id) DO NOTHING;

-- Update story view counts based on the views we inserted
UPDATE stories SET view_count = (
    SELECT COUNT(*) FROM story_views WHERE story_id = stories.id
) WHERE id IN ('1', '2', '3', '4');

-- Create some sample circle messages
INSERT INTO circle_messages (circle_id, user_id, content) VALUES
-- Single Parents Support messages
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'Welcome everyone to our Single Parents Support circle! This is a safe space where we can share our experiences, challenges, and victories. Remember, we''re all in this together. 💪'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'Thank you for creating this space, Thabo! As a single mom running my own business, I know how isolating it can feel sometimes. Looking forward to connecting with others who understand the journey.'),
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'So grateful to find this community! Balancing work and raising kids alone is tough, but knowing there are others who get it makes such a difference. ❤️'),

-- Job Seekers Network messages
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'Welcome to the Job Seekers Network! Let''s support each other in finding meaningful employment. Share job leads, interview tips, and celebrate each other''s successes! 🎯'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'thabo_m' LIMIT 1), 'Thanks for this platform, Nomsa! Just finished my medical degree and looking for opportunities. The job market is tough but having a supportive community makes all the difference.'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), 'Great initiative! I''ve been job hunting for a while now. Would love to share experiences and learn from others. We''ve got this! 💼'),

-- Mental Health Warriors messages
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE username = 'sipho_d' LIMIT 1), 'This circle is for anyone dealing with mental health challenges. Remember: you are not alone, your struggles are valid, and seeking help is a sign of strength. Let''s support each other on this journey. 🌟'),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'Thank you for creating this safe space, Sipho. Mental health is so important and often overlooked in our communities. I''m here to listen and support however I can. 🤗'),

-- Young Entrepreneurs messages
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM profiles WHERE username = 'grace_m' LIMIT 1), 'Welcome to Young Entrepreneurs! Whether you''re just starting out or already running a business, this is our space to share ideas, challenges, and celebrate our wins together! 🚀'),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM profiles WHERE username = 'nomsa_k' LIMIT 1), 'Excited to be here! Started my catering business during COVID and learned so much along the way. Happy to share experiences and learn from other entrepreneurs. Let''s grow together! 📈')
ON CONFLICT DO NOTHING;

-- Final message
SELECT 'Enhanced features seed data inserted successfully!' as message;
