-- Insert sample profiles (these will be used for the sample stories)
INSERT INTO public.profiles (id, username, full_name, bio, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'thabo_m', 'Thabo Mthembu', 'Medical student at UCT, passionate about education and community development.', 'Cape Town, Western Cape'),
  ('550e8400-e29b-41d4-a716-446655440002', 'nomsa_k', 'Nomsa Khumalo', 'Community chef and entrepreneur. Turning challenges into opportunities.', 'Johannesburg, Gauteng'),
  ('550e8400-e29b-41d4-a716-446655440003', 'sipho_d', 'Sipho Dlamini', 'Advocate for LGBTQ+ rights and authentic living.', 'Durban, KwaZulu-Natal'),
  ('550e8400-e29b-41d4-a716-446655440004', 'grace_m', 'Grace Mabaso', 'Community organizer and urban farming enthusiast.', 'Alexandra, Gauteng')
ON CONFLICT (id) DO NOTHING;

-- Insert sample stories
INSERT INTO public.stories (id, title, content, author_id, category, content_warnings, location, upvotes, downvotes, view_count) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'From Khayelitsha to UCT: My Journey Through Education',
    'Growing up in Khayelitsha, I never thought university was possible. My mother worked three jobs to keep us afloat, and books were a luxury we couldn''t afford. But my Grade 7 teacher, Mrs. Ndaba, saw something in me that I couldn''t see in myself. She stayed after school to help me with my homework, brought me books from her own collection, and constantly reminded me that education was my ticket to a better life.

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
    'Losing My Job During COVID and Finding My Purpose',
    'March 2020 changed everything. I was a manager at a restaurant in Sandton when lockdown hit. Suddenly, I was unemployed with two kids to feed and rent to pay. The first few weeks were the darkest of my life. I felt like I had failed my family.

But then I remembered my grandmother''s recipes - the ones she used to make for the whole neighborhood during tough times. I started cooking from home, selling meals to neighbors who were also struggling. What began as desperation slowly turned into something beautiful.

My small kitchen became a lifeline for our community. People didn''t just come for the food; they came for connection, for a sense of normalcy in an uncertain world. I realized that feeding people wasn''t just about the food - it was about nourishing souls.

Today, I run a successful catering business from my home. I employ three other women from my neighborhood who also lost their jobs during the pandemic. We''ve turned our pain into purpose, and our community is stronger because of it.',
    '550e8400-e29b-41d4-a716-446655440002',
    'Career & Work',
    '{"Financial Hardship"}',
    'Johannesburg, Gauteng',
    189,
    1,
    890
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'Coming Out in a Traditional Zulu Family',
    'I was 22 when I finally found the courage to tell my family who I really was. Growing up in rural KwaZulu-Natal, being gay wasn''t something we talked about. I spent years hiding, pretending, and slowly dying inside.

The night I told my parents, I was prepared for the worst. I had packed a bag and was ready to leave home forever. My father''s initial silence felt like an eternity. But then he did something I never expected - he asked me if I was happy.

It wasn''t immediate acceptance. There were difficult conversations, tears, and moments of tension. But my family chose love over tradition, understanding over judgment. My mother now proudly introduces my partner at family gatherings, and my father has become an unexpected advocate for LGBTQ+ rights in our community.

This experience taught me that sometimes the people we think will reject us are the ones who surprise us the most. It also showed me the power of living authentically - not just for ourselves, but for others who are still hiding in the shadows.',
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
    'Building a Community Garden in Alexandra',
    'Our neighborhood had no fresh vegetables, just spaza shops selling processed food at inflated prices. My children were getting sick frequently, and I knew their diet was part of the problem. That''s when I decided to do something about it.

I convinced five neighbors to join me in converting an empty lot into a community garden. The landlord was skeptical but agreed to let us try for six months. We pooled our resources - R50 each - and bought seeds, basic tools, and some compost.

The first few months were challenging. Some plants died, others were stolen, and people laughed at our ''small patch of hope.'' But slowly, things began to grow - not just the vegetables, but our community spirit.

Today, our garden feeds over 30 families. We''ve expanded to three lots, and we''re teaching children about nutrition and farming. What started as a desperate attempt to feed our families has become a symbol of what we can achieve when we work together. We''ve proven that even in the most challenging circumstances, we can create abundance.',
    '550e8400-e29b-41d4-a716-446655440004',
    'Community',
    '{}',
    'Alexandra, Gauteng',
    312,
    5,
    1450
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample comments
INSERT INTO public.comments (id, story_id, author_id, parent_id, content, upvotes) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440002',
    NULL,
    'Thank you for sharing this powerful story. Your journey is truly inspiring and shows that with determination, anything is possible. Mrs. Ndaba sounds like an amazing teacher!',
    12
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440021',
    'Thank you so much for your kind words. Mrs. Ndaba truly changed my life. I hope to pay it forward by helping other students from similar backgrounds.',
    5
  ),
  (
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440003',
    NULL,
    'This resonates with me so deeply. Sometimes our biggest challenges become our greatest opportunities. Your grandmother would be so proud of what you''ve built.',
    8
  )
ON CONFLICT (id) DO NOTHING;
