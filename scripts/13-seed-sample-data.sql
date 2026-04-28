-- Insert sample profiles for testing
INSERT INTO public.profiles (id, username, full_name, bio, location, age_range, gender, province, township, occupation, education_level, interests, challenges_faced, willing_to_help_with) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001', 
    'thabo_m', 
    'Thabo Mthembu', 
    'Medical student at UCT, passionate about education and community development.', 
    'Cape Town, Western Cape',
    '18-24',
    'male',
    'Western Cape',
    'Khayelitsha',
    'Student',
    'Bachelor''s degree',
    '{"Education", "Healthcare", "Community Development"}',
    '{"Education access", "Financial hardship"}',
    '{"Education support", "Skills training"}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002', 
    'nomsa_k', 
    'Nomsa Khumalo', 
    'Community chef and entrepreneur. Turning challenges into opportunities.', 
    'Johannesburg, Gauteng',
    '35-44',
    'female',
    'Gauteng',
    'Alexandra',
    'Self-employed',
    'Matric/Grade 12',
    '{"Entrepreneurship", "Cooking", "Community Development"}',
    '{"Unemployment", "Poverty"}',
    '{"Job search assistance", "Skills training", "Food assistance"}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003', 
    'sipho_d', 
    'Sipho Dlamini', 
    'Advocate for LGBTQ+ rights and authentic living.', 
    'Durban, KwaZulu-Natal',
    '25-34',
    'male',
    'KwaZulu-Natal',
    'Umlazi',
    'Community organizer',
    'Diploma',
    '{"LGBTQ+ Rights", "Social Justice", "Community Development"}',
    '{"Discrimination", "Mental health"}',
    '{"Mental health support", "Legal assistance"}'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004', 
    'grace_m', 
    'Grace Mabaso', 
    'Community organizer and urban farming enthusiast.', 
    'Alexandra, Gauteng',
    '45-54',
    'female',
    'Gauteng',
    'Alexandra',
    'Community organizer',
    'Post-matric certificate',
    '{"Agriculture", "Community Development", "Environmental Issues"}',
    '{"Food insecurity", "Poverty"}',
    '{"Food assistance", "Skills training", "Community organizing"}'
  )
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  age_range = EXCLUDED.age_range,
  gender = EXCLUDED.gender,
  province = EXCLUDED.province,
  township = EXCLUDED.township,
  occupation = EXCLUDED.occupation,
  education_level = EXCLUDED.education_level,
  interests = EXCLUDED.interests,
  challenges_faced = EXCLUDED.challenges_faced,
  willing_to_help_with = EXCLUDED.willing_to_help_with;

-- Insert sample stories
INSERT INTO public.stories (id, title, content, author_id, category, content_warnings, location, upvotes, downvotes, view_count) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'From Khayelitsha to UCT: My Journey Through Education',
    'Growing up in Khayelitsha, I never thought university was possible. My mother worked three jobs to keep us afloat, and books were a luxury we couldn''t afford. But my Grade 7 teacher, Mrs. Ndaba, saw something in me that I couldn''t see in myself.

The road wasn''t easy. I had to wake up at 4 AM to study before helping my mother with household chores. I walked 5 kilometers to school every day because we couldn''t afford taxi fare. But every small victory - every good grade, every teacher''s encouragement - fueled my determination.

When I received my matric results and qualified for university, I cried for hours. Not just from joy, but from the overwhelming realization that dreams really can come true. Today, I''m in my final year at UCT studying medicine, and I volunteer at schools in Khayelitsha, hoping to be that teacher for another child who needs to believe in themselves.',
    '550e8400-e29b-41d4-a716-446655440001',
    'Education',
    '{}',
    'Cape Town, Western Cape',
    234,
    3,
    1250
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'Building a Community Kitchen During COVID',
    'March 2020 changed everything for our community in Alexandra. I was working at a restaurant in Sandton when lockdown hit. Suddenly, I was unemployed with two kids to feed and rent to pay.

But then I remembered my grandmother''s recipes - the ones she used to make for the whole neighborhood during tough times. I started cooking from home, selling meals to neighbors who were also struggling. What began as desperation slowly turned into something beautiful.

My small kitchen became a lifeline for our community. People didn''t just come for the food; they came for connection, for a sense of normalcy in an uncertain world. Today, I run a successful catering business from my home and employ three other women from my neighborhood.',
    '550e8400-e29b-41d4-a716-446655440002',
    'Career & Work',
    '{"Financial Hardship"}',
    'Alexandra, Johannesburg',
    189,
    1,
    890
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'Finding My Voice: Coming Out in a Traditional Community',
    'I was 22 when I finally found the courage to tell my family who I really was. Growing up in rural KwaZulu-Natal, being gay wasn''t something we talked about. I spent years hiding, pretending, and slowly dying inside.

The night I told my parents, I was prepared for the worst. But my family chose love over tradition, understanding over judgment. This experience taught me that sometimes the people we think will reject us are the ones who surprise us the most.

Now I work as an advocate for LGBTQ+ rights in our community, helping others find the courage to live authentically.',
    '550e8400-e29b-41d4-a716-446655440003',
    'Family & Relationships',
    '{"Discrimination"}',
    'Durban, KwaZulu-Natal',
    456,
    12,
    2100
  ),
  (
    '550e8400-e29b-41d4-a716-446655440014',
    'Growing Hope: Our Community Garden Story',
    'Our neighborhood had no fresh vegetables, just spaza shops selling processed food at inflated prices. That''s when I decided to do something about it.

I convinced five neighbors to join me in converting an empty lot into a community garden. Today, our garden feeds over 30 families. We''ve expanded to three lots, and we''re teaching children about nutrition and farming.

What started as a desperate attempt to feed our families has become a symbol of what we can achieve when we work together.',
    '550e8400-e29b-41d4-a716-446655440004',
    'Community',
    '{}',
    'Alexandra, Gauteng',
    312,
    5,
    1450
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  category = EXCLUDED.category,
  content_warnings = EXCLUDED.content_warnings,
  location = EXCLUDED.location,
  upvotes = EXCLUDED.upvotes,
  downvotes = EXCLUDED.downvotes,
  view_count = EXCLUDED.view_count;

-- Insert sample comments
INSERT INTO public.comments (id, story_id, author_id, parent_id, content, upvotes) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440002',
    NULL,
    'Thank you for sharing this powerful story. Your journey is truly inspiring and shows that with determination, anything is possible.',
    12
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440003',
    NULL,
    'This resonates with me so deeply. Sometimes our biggest challenges become our greatest opportunities. Your grandmother would be so proud.',
    8
  ),
  (
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440004',
    NULL,
    'Thank you for your courage in sharing this. Your story gives hope to so many young people who are struggling with their identity.',
    15
  )
ON CONFLICT (id) DO NOTHING;
