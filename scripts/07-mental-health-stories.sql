-- Insert additional user profiles for the new stories
INSERT INTO public.profiles (id, username, full_name, bio, location) VALUES
  ('550e8400-e29b-41d4-a716-446655440009', 'sister_betina', 'Sister Betina Malgas', 'Actress and depression survivor. Played Sister Betina on Soul City. Breast cancer survivor. Mental health advocate.', 'Johannesburg, Gauteng'),
  ('550e8400-e29b-41d4-a716-446655440010', 'sduber_beyi', 'Sello Ireland Beyi', 'Former street kid turned responsible father. Afro-pop artist. Working with City Parks. Sharing my story to help youth avoid my mistakes.', 'Cosmo City, Johannesburg')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location;

-- Insert the mental health and youth transformation stories
INSERT INTO public.stories (id, title, content, author_id, category, content_warnings, location, upvotes, downvotes, view_count) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440019',
    'Living in the Dark: My Battle with Depression',
    'You''ve got to learn about your disease to get help. However it''s different with depression because with depression you don''t know that you are depressed when it happens to you. So there is no way you are going to go out into the world thinking of looking for help, because you don''t know who you are at the time, and you don''t know where you are which is a dark bottomless pit.

The worst thing about when I had depression was that I didn''t want to see the light. I wanted to just cover myself up with my blanket, people were making a noise and the light was just too much for me, like I said my world had ended. You''ll be surprised that in my day we didn''t have any treatment or medication. It was in the days of Apartheid.

When I was a young girl I read Mills and Boon romance books, and I used to think that I was going to get my Mr handsome and then live happily ever after. I was so shocked, there was no happily ever after. I had dreams of being somebody, thank God I made it, here I am an actress today, but at that time I couldn''t see it because my husband was an Alcoholic.

The first sign was not washing myself, I couldn''t even button my blouse properly, I was skipping holes. The sad part about depression is that because you don''t have a wound, people don''t see that you are hurting. People think you are acting proud or being stuck up because you don''t want to go out anymore. What annoyed me the most was when people would say, "Pull yourself towards yourself." There was no self, there is nothing to pull yourself to.

I was fortunate to have been employed by "Soul City" at the time and on the show I played the role of Sister Betina. The role was of a depressed matron who had everything but became depressed. They didn''t know I had experienced depression when they cast me. To them I was just an actress playing the role of a depressed woman. Believe me when I tell you that I nailed that performance.

Even though I am a cancer survivor, if you were to ask me to choose between cancer and depression I would choose cancer. Because cancer sufferers have support groups, especially Breast Cancer. Everybody is concerned about us and they love us, but no one gives the same love to the depressed people. Because "Bathi ngesintu, siyantringa" meaning we are mad.

When I came out of my depression, I prayed about it, because I didn''t want to be depressed anymore, I said no more. It''s funny how powerful the mind is. I''ve had three bouts with depression in my life. Bad things still happen, but they don''t get me down, now I know that that''s how life works.

My message to everyone is that it''s important for us as parents and family members, friends to look for the signs because a person who is depressed won''t know that they are depressed. Watch out for your children as well because even children can become depressed, people are shocked by this. So watch out for the symptoms and help.

It makes me happy today that we have Psychiatrists, Doctors and educated people who can identify these problems and provide medicine and therapy to treat them.',
    '550e8400-e29b-41d4-a716-446655440009',
    'Personal Growth',
    '{"Mental Health", "Substance Abuse", "Self-harm"}',
    'Johannesburg, Gauteng',
    678,
    12,
    1456
  ),
  (
    '550e8400-e29b-41d4-a716-446655440020',
    'From Street Kid to Responsible Father: My Journey Back',
    'My name is Sello Ireland "Sduber" Beyi and I am 25 years old. I was born in the Eastern Cape, Queenstown where my mother is from, and my father was from KZN, New Castle. My father passed away in 2003 due to illness when I was fourteen years old. That was when I started noticing the hardships we were going through as a family at home.

My father was a "Jah man" / "Rasta". He would take me with him sometimes when he went to watch live bands. Life was good then, but after his death life became very difficult for us. Being the only boy still at home I got into trouble a lot. While staying out late with friends I was introduced to weed as a stress reliever.

This was when I began to lose control of myself because it worked and it felt good but soon I would find that there are higher levels of intoxication you can reach. One thing lead to another - my friends would say weed is nothing try cocaine and once I got into that it didn''t stop there. I tried everything, and did it all.

By this time I had started taking small things from home to sell them for money. I would also steal from my sisters purses''. When I went to the shop I would lie about how much it cost so I could take a little from the change. This was how we all funded our lifestyle.

In 2005 I eventually dropped out of school because of my habit, it had consumed me. I lost focus in class, and I couldn''t pay attention anymore so I started going to Street Lights/Robots in Lonehill. One day at these street lights a bus from school passed by with all my class mates in it. They all saw me and called out my name. I was shocked and embarrassed at the same time.

I decided to stay on the streets, and this decision got me into smoking glue. I lived like this for ten months, From February till November. In November my mother and a neighbour, along with police officers came looking for me. When they found me, my mother''s emotional plea along with the police officers were persuasive enough to force me to go back home.

The next year 2006, I had to go back to school, High School. Life in High School was flashy, I got caught up in it. 2006 was also the year we got an RDP house in Cosmo City. And in this house there was a safe with my father''s gun. My confidence carrying a gun grew, so one weekend we arranged a sleepover and bought a bottle of alcohol after school.

One night things went very wrong. We went out for drinks till the early hours of the morning and ended up robbing a couple on their way to work. One of my friends kicked the girl in the stomach not realising she was pregnant. She later had a miscarriage. When the community heard about this, an angry mob came looking for us.

I ended up in Sun City prison for my trial. This was where I got my wake up call. The living conditions there were horrible. I was only there for three months but 3 months in jail feels like 3 years. In Sun City I met people who had a positive mind set even though they still had many more years to go. They told me to change my ways and better myself when I got out.

2007 was when I started maturing and becoming the man I am today. I was not offended by the accusations or the lack of trust around me instead it motivated me to show them I could change for the better. I wanted to prove them wrong. I helped out where ever I could, doing my neighbours gardening and offering to go to the shops for the elderly.

Today my life has changed a lot, I now have a child with my current girlfriend and we live together with our child. I can say I''m a responsible adult now. I don''t think about my past at all anymore. I''m working for "City parks" right now on a 3 month project. I''m talented, I can act, I can write, I can rap and sing, but right now I''m focused on doing what will give me a steady income to take care of my family.

Talking about myself and my past today has become easier. The more I share my story the more I heal. Sharing your story doesn''t only heal you alone, it also helps those who hear my story to learn from my mistakes and not repeat my mistakes.

My message to the youth is Life begins at 40. Don''t invest in Life, invest in yourself. Think about where you want to be when you are 40 years old, what do you want to have achieved by the age of 40 when you look back at your life.',
    '550e8400-e29b-41d4-a716-446655440010',
    'Overcoming Challenges',
    '{"Substance Abuse", "Violence", "Mental Health", "Loss/Grief"}',
    'Cosmo City, Johannesburg',
    445,
    7,
    987
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

-- Insert meaningful comments on these mental health stories
INSERT INTO public.comments (id, story_id, author_id, parent_id, content, upvotes) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440029',
    '550e8400-e29b-41d4-a716-446655440019',
    '550e8400-e29b-41d4-a716-446655440006',
    NULL,
    'Sister Betina, thank you for sharing this. As someone who has also struggled with depression, your words about people not understanding because "there''s no wound" really hit home. The stigma around mental health in our communities is real. We need more voices like yours speaking out.',
    67
  ),
  (
    '550e8400-e29b-41d4-a716-446655440030',
    '550e8400-e29b-41d4-a716-446655440019',
    '550e8400-e29b-41d4-a716-446655440002',
    NULL,
    'Ma''am, your story gives me hope. I''ve been struggling with depression since my release from prison and sometimes I feel like I''m the only one. Knowing that even successful people like you have gone through this makes me feel less alone. Thank you for speaking about SADAG - I''m going to contact them.',
    43
  ),
  (
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440008',
    NULL,
    'Sduber, your transformation is incredible. As someone who also works with youth, I see so many young people going down the same path you did. Your story shows that change is possible. Have you considered speaking at schools? Your message could save lives.',
    38
  ),
  (
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440004',
    NULL,
    'Sello, your story reminds me of some of my students who are struggling with similar challenges. The part about "Life begins at 40" really resonates. I''m going to share this wisdom with my learners. Thank you for turning your pain into purpose.',
    29
  ),
  (
    '550e8400-e29b-41d4-a716-446655440033',
    '550e8400-e29b-41d4-a716-446655440019',
    '550e8400-e29b-41d4-a716-446655440005',
    NULL,
    'Sister Betina, your courage in sharing this is inspiring. Mental health awareness is so important, especially in our communities where it''s often misunderstood. I''m studying medicine and want to specialize in psychiatry partly because of stories like yours. We need more mental health resources.',
    51
  ),
  (
    '550e8400-e29b-41d4-a716-446655440034',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440001',
    NULL,
    'Bhuti Sello, your story shows that it''s never too late to change. I''m also trying to be a better father to my son than my father was to me. Your journey from the streets to being a responsible parent gives me hope that we can break these cycles.',
    22
  ),
  (
    '550e8400-e29b-41d4-a716-446655440035',
    '550e8400-e29b-41d4-a716-446655440019',
    '550e8400-e29b-41d4-a716-446655440003',
    NULL,
    'Ma Betina, your words about depression being different from cancer because people can''t see the wound - this is so true. I''ve seen family members struggle with mental health and the community just doesn''t understand. Thank you for educating us and breaking the stigma.',
    34
  ),
  (
    '550e8400-e29b-41d4-a716-446655440036',
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440007',
    NULL,
    'Sduber, your story about the power of community support really speaks to me. The way your mother and neighbors came looking for you shows that even when we think we''re lost, there are people who care. Your transformation is proof that love and second chances can change everything.',
    27
  )
ON CONFLICT (id) DO NOTHING;
