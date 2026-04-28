-- Clear existing sample data first
DELETE FROM public.comments WHERE story_id IN (
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440014'
);

DELETE FROM public.stories WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440014'
);

DELETE FROM public.profiles WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004'
);

-- Insert real user profiles based on the stories
INSERT INTO public.profiles (id, username, full_name, bio, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'matsimela_m', 'Matsimela Mphahlela', 'Searching for my father Abraham Moeti. Born 1982, from Limpopo. Still believing in hope and family connections.', 'Limpopo, South Africa'),
  ('550e8400-e29b-41d4-a716-446655440002', 'jacob_ntoroane', 'Jacob Sello Ntoroane', 'Ex-convict turned community advocate. Founder of Fear Free Life organization. Helping youth avoid the mistakes I made.', 'Soweto, Johannesburg'),
  ('550e8400-e29b-41d4-a716-446655440003', 'nomsa_chef', 'Nomsa Khumalo', 'Community chef and entrepreneur from Alex. Turning challenges into opportunities, one meal at a time.', 'Alexandra, Johannesburg'),
  ('550e8400-e29b-41d4-a716-446655440004', 'thandi_teacher', 'Thandi Mthembu', 'Primary school teacher in Khayelitsha. Passionate about education and breaking cycles of poverty.', 'Khayelitsha, Cape Town'),
  ('550e8400-e29b-41d4-a716-446655440005', 'sipho_student', 'Sipho Dlamini', 'Medical student at Wits. First in my family to attend university. Advocate for rural education access.', 'Johannesburg, Gauteng'),
  ('550e8400-e29b-41d4-a716-446655440006', 'lerato_survivor', 'Lerato Molefe', 'Domestic violence survivor and counselor. Helping other women find their strength and voice.', 'Pretoria, Gauteng'),
  ('550e8400-e29b-41d4-a716-446655440007', 'mandla_farmer', 'Mandla Ndlovu', 'Urban farmer in Durban. Growing food and community connections in the heart of the city.', 'Durban, KwaZulu-Natal'),
  ('550e8400-e29b-41d4-a716-446655440008', 'zanele_artist', 'Zanele Mabaso', 'Street artist and youth mentor. Using art to tell our stories and heal our communities.', 'Cape Town, Western Cape')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location;

-- Insert the real stories with authentic content
INSERT INTO public.stories (id, title, content, author_id, category, content_warnings, location, upvotes, downvotes, view_count) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'I''m Searching for My Father',
    'My name is Matsimela Mphahlela. I am from Limpopo and I am 33 years old, born in 1982, 11th November. This is the story about my life. I don''t like noise, that''s who I am. I come from a rural area, I am raised by a single parent, that''s my mother without a father. Even today I am still searching for my father.

Life has been hard growing up without a father, so life hasn''t been easy. Sometimes you come across bad situations where you need a father to talk to or guide you through your challenges growing up and I have no one to go to. I think that my mother has done all she can for me so I don''t want to go and ask for help from her.

Being a boy without a father I know that if he was here, I would become a better person. I remember my first day at school, some students were talking about their fathers buying them boots and fancy things for school. I didn''t know what to do because I had nothing to talk about. My mother told me that my father saw me once when I was 9 months old so I don''t know his face.

For most of my life I put all the blame on him, but I think that if he came to me and explained why he left I would try to understand because I am a man without a father. I have a son of my own, he is nine turning ten, I don''t want to make the same mistake with him my father made with me. I want to be a father to my son, I am committed to him.

I think if my father was here, if I met him today or tomorrow I think I could forgive him. If he told me the truth about why he left I do think I could forgive him because at the end of the day he is my father. I still want to meet him, with him by my side maybe some of the goals can still be achieved because I''m still young. I believe with him I can go far.

I have heard that he is from Haarmanskraal but I don''t know for sure. What I do know is that his family is from Pretoria, Kgarankua in Zone four by the Moeti surname. I would dream about him even though I have never met him and as soon as I wake up I would tell my mother and she would confirm that the man in my dreams is my father.

I am wishing and willing to meet him. His name is Abraham Moeti. Please advise me on what channels I should take to begin searching for my father with this little information that I have.',
    '550e8400-e29b-41d4-a716-446655440001',
    'Family & Relationships',
    '{"Abandonment"}',
    'Limpopo, South Africa',
    89,
    2,
    456
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    '20 Years in Prison for a Life-Changing Mistake',
    'My name is Jacob Sello Ntoroane, I''m from White City, Jabavu Soweto. I''m the last born of five children. I never met my mother and my father, I knew him but he lived very far, in Northwest. When you grow up like that, you lack guidance.

We never had facilities or programmes to join back then to keep us busy and to help us grow mentally, giving advice on how to deal with confrontation, so we could mature into responsible adults. Unfortunately I didn''t go to school as far as I would have liked to, I stopped going to school in standard 6.

At the age of 22 I got married to a young lady from Naledi, and together we were blessed with 4 children. We later divorced, life has so many surprises along the way which you don''t see coming and this was one of them.

I started drinking a lot, smoking weed and having a lot of friends. I had a well-paying job then, but because of my lack of a good foundation and lack of guidance, I never had a great sense of direction and I didn''t know how to conduct myself. If you lack education, you are like a blind person.

In 2001 I started dating a new girlfriend and she soon moved in with me at my parents'' house. We used to drink together when we were at the house. One day it happened that she took all my earnings that week and disappeared before I had paid any of my bills, or bought food for the house. This happened several times.

I was overruled by my anger. When I woke up in the morning I didn''t even take one look at her. I got up and went to work, only to come home to what was now a crime scene, for murder, I was arrested. Reacting while you are under the influence of alcohol, mixed with emotions of anger can lead you to do something you never imagined you would do. I will always regret this.

I was now a murderer. Arrested in 2001, and between the years of 2002 – 2003 I was on trial, and in 2004 I was sentenced to 20 years. I wanted to study so that when I got out of prison I would be a better person. I completed my matric in prison, although it took several attempts.

In 2013 March 15, I was finally released from prison. Now being unemployed, it only added to my frustrations. Unemployment is a big reason for why people go back to prison.

I have joined an organisation formed by ex-convicts, an organisation that began in prison opposing gangsterism. Fear Free Life, formed in 2004 and launched in 2005. Today we are operating on the outside as well addressing crime, gangsterism, and substance abuse. We attend schools and also help families with problem children.

The youth need to keep busy because there are those that grow up to commit crime with intent, and others like me who make life changing mistakes. I believe we need to tackle these problems together with good parenting before they escalate.',
    '550e8400-e29b-41d4-a716-446655440002',
    'Overcoming Challenges',
    '{"Violence", "Substance Abuse", "Mental Health"}',
    'Soweto, Johannesburg',
    156,
    8,
    892
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'From Spaza Shop to Community Kitchen: My COVID Story',
    'March 2020 changed everything for our community in Alexandra. I was working at a restaurant in Sandton when lockdown hit. Suddenly, I was unemployed with two kids to feed and rent to pay. The first few weeks were the darkest of my life.

But then I remembered my grandmother''s recipes - the ones she used to make for the whole neighborhood during tough times. She always said, "Nomsa, food is love, and love heals everything." I started cooking from home, selling meals to neighbors who were also struggling.

What began as desperation slowly turned into something beautiful. My small kitchen became a lifeline for our community. People didn''t just come for the food; they came for connection, for a sense of normalcy in an uncertain world.

I realized that feeding people wasn''t just about the food - it was about nourishing souls. During those long lockdown months, I saw families who hadn''t spoken in years come together over a shared meal. I saw children who were struggling with online school find comfort in a warm plate of food.

The spaza shops were charging crazy prices for basic ingredients, so I started buying in bulk and sharing with other women who wanted to start their own food businesses. We formed a WhatsApp group that grew from 5 women to over 50.

Today, I run a successful catering business from my home. I employ three other women from my neighborhood who also lost their jobs during the pandemic. We''ve turned our pain into purpose, and our community is stronger because of it.

We cater for everything - from birthday parties to funeral teas, from school events to church gatherings. But more than that, we''ve become a support system for each other. When one of us struggles, we all step in to help.

My grandmother always said that Ubuntu isn''t just a word - it''s a way of life. Through this journey, I''ve learned that sometimes our biggest challenges become our greatest opportunities to serve others.',
    '550e8400-e29b-41d4-a716-446655440003',
    'Career & Work',
    '{"Financial Hardship"}',
    'Alexandra, Johannesburg',
    234,
    3,
    678
  ),
  (
    '550e8400-e29b-41d4-a716-446655440014',
    'Teaching Hope in Khayelitsha: Why Every Child Matters',
    'I''ve been teaching Grade 3 at Masibambane Primary School in Khayelitsha for eight years now. Every morning, I wake up knowing that I have the power to change a child''s life - and that responsibility both terrifies and inspires me.

My classroom has 45 children crammed into a space meant for 25. We don''t have enough desks, so some children sit on the floor. We don''t have enough textbooks, so they share. But what we lack in resources, we make up for in heart.

There''s a little boy in my class named Luthando. When he first came to me, he was angry, disruptive, and couldn''t read a single word. I later learned that his father had left, his mother worked three jobs, and he was essentially raising his two younger siblings.

Instead of giving up on him, I started staying after school to help him with his reading. I brought him books from my own collection. I made sure he had something to eat during break time. Slowly, his anger turned into curiosity, and his disruption turned into participation.

Last month, Luthando read his first full story aloud to the class. The pride in his eyes reminded me why I became a teacher. But more than that, I saw the other children looking at him with new respect. They realized that if Luthando could do it, so could they.

Teaching in a township school isn''t easy. We deal with poverty, hunger, violence, and trauma every single day. Some mornings, children come to school having not eaten since the previous day''s school meal. Some come with bruises they won''t talk about. Some come speaking languages I don''t understand because their families are refugees from other African countries.

But here''s what I''ve learned: every child has potential. Every child has dreams. Every child deserves someone who believes in them. When I see former students who are now in high school, or university, or starting their own businesses, I know that those difficult days were worth it.

Education is the most powerful weapon we have against poverty, against inequality, against hopelessness. In my classroom, I don''t just teach reading and writing - I teach children that they matter, that their voices are important, that they can be anything they want to be.

To other teachers working in challenging conditions: don''t give up. That child who seems unreachable might just need one more person to believe in them. We are not just teachers - we are hope builders, dream nurturers, and future shapers.',
    '550e8400-e29b-41d4-a716-446655440004',
    'Education',
    '{}',
    'Khayelitsha, Cape Town',
    312,
    1,
    567
  ),
  (
    '550e8400-e29b-41d4-a716-446655440015',
    'From Rural Limpopo to Wits Medical School: Breaking Barriers',
    'I am the first person in my family to attend university. Growing up in a small village outside Polokwane, the idea of becoming a doctor seemed as impossible as flying to the moon.

My grandmother, who raised me after my parents died in a car accident when I was 12, used to say, "Sipho, education is the only inheritance I can give you." She sold vegetables at the taxi rank to pay for my school fees, often going without food so I could have lunch money.

The journey wasn''t easy. I had to wake up at 4 AM to study by candlelight because we didn''t have electricity. I walked 8 kilometers to school every day because we couldn''t afford transport. My school didn''t have a science laboratory, so I learned about human anatomy from old textbooks with missing pages.

When I finished matric with distinctions in Mathematics and Physical Science, my teachers encouraged me to apply for university. But the application fees alone were more than my grandmother earned in a month. That''s when our community came together - neighbors, church members, even strangers contributed R10 or R20 each until we had enough.

Getting into Wits was just the beginning. I arrived in Johannesburg with one suitcase and R500 to my name. I had never seen a building taller than two stories, never used a computer, never eaten with a fork and knife. The culture shock was overwhelming.

My first year was the hardest. I failed my first anatomy test because I couldn''t understand the medical terminology in English. I considered dropping out and going back home. But then I remembered my grandmother''s words and all the people who had invested in my dream.

I found a study group with other students from rural areas. We helped each other navigate not just the academic work, but also the social and cultural challenges of university life. We became each other''s family away from home.

Now in my final year, I''ve decided to specialize in rural medicine. I want to go back to communities like mine and provide healthcare to people who have never seen a doctor. I want to be proof that where you come from doesn''t determine where you''re going.

To young people from rural areas who dream of university: it''s possible. It won''t be easy, but it''s possible. Find your community, work harder than everyone else, and never forget where you come from. Your background is not a limitation - it''s your superpower.',
    '550e8400-e29b-41d4-a716-446655440005',
    'Education',
    '{"Loss/Grief"}',
    'Johannesburg, Gauteng',
    445,
    2,
    789
  ),
  (
    '550e8400-e29b-41d4-a716-446655440016',
    'Finding My Voice After Years of Silence',
    'For 15 years, I lived in fear. My husband controlled every aspect of my life - what I wore, who I spoke to, where I went. He told me I was worthless, that no one would ever love me, that I was lucky he put up with me. I believed him.

The abuse started small - a push here, a slap there, always followed by apologies and promises that it would never happen again. But it always did happen again, and it got worse. The physical bruises healed, but the emotional scars ran deeper.

I made excuses for him to my family and friends. I covered bruises with makeup. I isolated myself because I was ashamed. I thought it was my fault - that if I just tried harder to be a better wife, he would stop hurting me.

The turning point came when my 8-year-old daughter asked me why I was always sad. I realized that she was learning that this was what love looked like. I couldn''t let her grow up thinking that a man hitting a woman was normal.

Leaving wasn''t easy. I had no money of my own, no job, nowhere to go. He had made sure I was completely dependent on him. But I found the courage to call a domestic violence helpline, and they connected me with a shelter.

The women at the shelter became my sisters. We shared our stories, our fears, our hopes. For the first time in years, I felt heard and understood. I learned that I wasn''t alone, that what happened to me wasn''t my fault, and that I deserved better.

It took two years of counseling to rebuild my self-esteem. I learned skills, got a job, found my own place. Most importantly, I found my voice again. I started speaking at schools and community centers about domestic violence, helping other women recognize the signs and know their options.

Today, I work as a counselor at the same shelter that saved my life. Every woman who walks through our doors reminds me of myself five years ago - scared, broken, but still breathing, still hoping. I tell them what someone once told me: "You are stronger than you know, braver than you feel, and more loved than you realize."

To women who are still trapped: you are not alone. There is help available. There is life after abuse. You deserve to be treated with respect and kindness. Your children deserve to see you happy and free. It won''t be easy, but it will be worth it.

To the community: domestic violence thrives in silence. We need to speak up, support survivors, and hold abusers accountable. We need to teach our sons that real men don''t hurt women, and teach our daughters that they deserve to be treated like queens.',
    '550e8400-e29b-41d4-a716-446655440006',
    'Overcoming Challenges',
    '{"Violence", "Mental Health"}',
    'Pretoria, Gauteng',
    523,
    4,
    1234
  ),
  (
    '550e8400-e29b-41d4-a716-446655440017',
    'Growing Food and Community in the Heart of Durban',
    'Three years ago, I looked at the empty lot next to my flat in Cato Crest and saw possibility where others saw waste. Today, that lot feeds over 100 families and has become the heart of our community.

I grew up on my grandfather''s farm in rural KwaZulu-Natal. He taught me that the earth provides for those who respect it. When I moved to Durban for work, I missed the connection to the soil, the satisfaction of growing your own food.

The lot was full of rubble and refuse. The city had forgotten about it, and so had the community. But I saw fertile soil underneath the neglect. I started small - clearing a small patch, planting spinach and tomatoes in old paint buckets.

My neighbors thought I was crazy. "Mandla, you can''t farm in the city," they said. But when my first tomatoes ripened, those same neighbors were asking for seeds and advice.

Word spread, and soon I had volunteers helping me clear more land. We organized community clean-up days, turning trash collection into social events. Children who had never seen vegetables grow started asking questions, wanting to help.

The local clinic referred malnourished children to our garden. We started a nutrition program, teaching families how to prepare healthy meals with vegetables they could grow themselves. The school principal asked us to start a garden at the primary school.

But this project became about more than food. It became about dignity, about taking control of our environment, about showing our children that they don''t have to wait for someone else to solve their problems.

We''ve faced challenges - theft, vandalism, drought, floods. But each setback made us stronger and more creative. We installed rainwater harvesting systems. We started a security patrol. We created a seed bank so families could start their own gardens.

The garden has become a meeting place where different cultures come together. We have Zulu families, Indian families, Coloured families, and foreign nationals all working side by side. Food has a way of breaking down barriers.

Local restaurants now buy our surplus vegetables. We''ve trained over 200 people in urban farming techniques. We''ve started similar projects in five other communities around Durban.

My grandfather always said, "If you want to change the world, start with the soil beneath your feet." I''ve learned that growing food is about growing community, growing hope, growing the belief that we can create the change we want to see.

To anyone who thinks they can''t make a difference: start small, start where you are, start with what you have. You''ll be amazed at what can grow.',
    '550e8400-e29b-41d4-a716-446655440007',
    'Community',
    '{}',
    'Durban, KwaZulu-Natal',
    378,
    1,
    645
  ),
  (
    '550e8400-e29b-41d4-a716-446655440018',
    'Painting Our Stories on the Walls of Cape Town',
    'Art saved my life. I know that sounds dramatic, but it''s true. Growing up in Mitchells Plain, I was heading down a dark path - gangs, drugs, violence. Art gave me a different way to express my anger and pain.

I started with graffiti, tagging walls around my neighborhood. It was illegal, rebellious, and it felt good to leave my mark on a world that seemed to ignore me. But then I met an older artist who challenged me: "Instead of just making noise, why don''t you say something?"

That question changed everything. I started learning about murals, about using art to tell stories, to heal communities, to give voice to the voiceless. I studied the work of artists like Faith47 and Freddy Sam, learning how street art could be both beautiful and meaningful.

My first community mural was on the wall of a primary school in my neighborhood. I painted the dreams of the children - astronauts, doctors, teachers, soccer players. The principal was skeptical at first, but when she saw how the children''s faces lit up when they saw their dreams on the wall, she became my biggest supporter.

Word spread, and soon I was getting requests from all over Cape Town. I painted a mural about women''s rights in Khayelitsha, a tribute to Nelson Mandela in Langa, a celebration of cultural diversity in Woodstock. Each mural was created with the community, incorporating their stories, their struggles, their hopes.

But the real magic happened when I started teaching. I began running art workshops for young people who reminded me of myself - angry, talented, looking for a way to channel their energy. We painted murals together, but more than that, we talked about life, about choices, about the power of creativity.

One of my students, a 16-year-old girl named Amahle, was struggling with depression and self-harm. Through art, she found a way to express her pain without hurting herself. She''s now studying fine arts at UCT and runs her own workshops for teenage girls.

Another student, Thabo, was involved with a gang when he joined my program. He discovered he had an incredible talent for portrait painting. He left the gang and now makes a living painting portraits for tourists at the V&A Waterfront.

Art has the power to transform communities. When we paint a mural on a wall that was previously covered in gang tags, we''re reclaiming that space for the community. When we teach a child to express themselves through art instead of violence, we''re changing the trajectory of their life.

I''ve learned that every wall has a story, and every person has a story worth telling. My job is to help people find their voice and give them the tools to share it with the world.

To young people who feel invisible, unheard, or angry: your voice matters. Your story matters. Find a way to tell it - through art, through music, through writing, through whatever medium speaks to you. The world needs to hear what you have to say.',
    '550e8400-e29b-41d4-a716-446655440008',
    'Personal Growth',
    '{"Substance Abuse", "Violence"}',
    'Cape Town, Western Cape',
    267,
    2,
    543
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

-- Insert some meaningful comments on these stories
INSERT INTO public.comments (id, story_id, author_id, parent_id, content, upvotes) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440004',
    NULL,
    'Matsimela, your story touched my heart. Have you tried contacting the Department of Home Affairs? They might be able to help you trace your father through their records. Also, there are Facebook groups for people searching for family members. Don''t give up - your father might be looking for you too.',
    23
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440003',
    NULL,
    'Jacob, thank you for sharing your story so honestly. Your work with Fear Free Life is so important. We need more people like you who are willing to turn their pain into purpose and help others avoid the same mistakes.',
    34
  ),
  (
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440002',
    NULL,
    'Sister Nomsa, your story gives me hope. I''m also trying to start a small business after being released from prison. It''s not easy, but stories like yours show that it''s possible to rebuild and help others at the same time.',
    18
  ),
  (
    '550e8400-e29b-41d4-a716-446655440024',
    '550e8400-e29b-41d4-a716-446655440014',
    '550e8400-e29b-41d4-a716-446655440005',
    NULL,
    'Ma''am Thandi, teachers like you are the reason I made it to university. Thank you for not giving up on children like Luthando. You are changing lives every single day.',
    41
  ),
  (
    '550e8400-e29b-41d4-a716-446655440025',
    '550e8400-e29b-41d4-a716-446655440015',
    '550e8400-e29b-41d4-a716-446655440001',
    NULL,
    'Sipho, as someone also from Limpopo, your story inspires me. I''m still searching for my father, but reading about your success gives me hope that I can also achieve my dreams despite the challenges.',
    15
  ),
  (
    '550e8400-e29b-41d4-a716-446655440026',
    '550e8400-e29b-41d4-a716-446655440016',
    '550e8400-e29b-41d4-a716-446655440008',
    NULL,
    'Lerato, you are so brave for sharing this. I know women who are going through similar situations. Can you share the contact details for the helpline you mentioned? This could save someone''s life.',
    52
  ),
  (
    '550e8400-e29b-41d4-a716-446655440027',
    '550e8400-e29b-41d4-a716-446655440017',
    '550e8400-e29b-41d4-a716-446655440007',
    NULL,
    'Bhuti Mandla, this is exactly what our communities need! I''m in Pietermaritzburg and would love to start something similar here. Can you share some tips on how to get started?',
    28
  ),
  (
    '550e8400-e29b-41d4-a716-446655440028',
    '550e8400-e29b-41d4-a716-446655440018',
    '550e8400-e29b-41d4-a716-446655440006',
    NULL,
    'Zanele, art truly does heal. I''ve seen how creative expression helped me process my own trauma. Thank you for giving young people a positive outlet and showing them their voices matter.',
    19
  )
ON CONFLICT (id) DO NOTHING;
