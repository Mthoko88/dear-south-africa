-- =========================================================
-- 24-dynamic-categories.sql
-- Creates the categories table, supporting both predefined
-- and community-created categories, and keeps story counts
-- in-sync automatically.
-- =========================================================

-- 1. TABLE -------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null unique,
  slug          text not null unique,
  description   text,
  icon_name     text,          -- e.g. 'Heart', 'Users'
  color_class   text,          -- e.g. 'bg-red-100 text-red-800'
  is_predefined boolean default false,
  story_count   integer default 0,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. PREDEFINED CATEGORIES --------------------------------
insert into public.categories (name, slug, description, icon_name, color_class, is_predefined, story_count)
values
('Family & Relationships', 'family-relationships', 'Stories about family bonds, love and connections',
 'Heart',       'bg-red-100 text-red-800',       true, 234),
('Career & Work',          'career-work',          'Professional journeys and workplace experiences',
 'Users',       'bg-blue-100 text-blue-800',      true, 189),
('Education',              'education',            'Learning experiences and academic journeys',
 'BookOpen',    'bg-green-100 text-green-800',    true, 156),
('Personal Growth',        'personal-growth',      'Self-improvement and life transformations',
 'Lightbulb',   'bg-yellow-100 text-yellow-800',  true, 203),
('Community',              'community',            'Community involvement and social initiatives',
 'Home',        'bg-purple-100 text-purple-800',  true, 167),
('Overcoming Challenges',  'overcoming-challenges','Stories of resilience and triumph',
 'TrendingUp',  'bg-orange-100 text-orange-800',  true, 298)
on conflict (slug) do nothing;

-- 3. HELPERS ----------------------------------------------
create or replace function public.slugify(txt text)
returns text language plpgsql as $$
begin
  return lower(regexp_replace(trim(txt), '[^a-zA-Z0-9]+', '-', 'g'));
end $$;

-- 4. TRIGGER TO KEEP STORY COUNTS IN-SYNC -----------------
--   (assumes you have a public.stories table with a `category`
--    column storing the category slug)
create or replace function public.update_category_story_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'insert' then
    update public.categories
      set story_count = story_count + 1,
          updated_at  = now()
    where slug = new.category;
    return new;
  elsif tg_op = 'delete' then
    update public.categories
      set story_count = story_count - 1,
          updated_at  = now()
    where slug = old.category;
    return old;
  elsif tg_op = 'update' and old.category <> new.category then
    update public.categories
      set story_count = story_count - 1,
          updated_at  = now()
    where slug = old.category;

    update public.categories
      set story_count = story_count + 1,
          updated_at  = now()
    where slug = new.category;
    return new;
  end if;
  return null;
end $$;

-- Drop & recreate the trigger (ignore error if stories table missing)
do $$
begin
  if exists (
    select 1 from pg_class where relname = 'stories'
  ) then
    drop trigger if exists trg_category_story_count on public.stories;
    create trigger trg_category_story_count
      after insert or update or delete
      on public.stories
      for each row execute function public.update_category_story_count();
  end if;
end $$;

-- 5. RLS POLICIES (optional - remove if you do not use RLS)-
alter table public.categories enable row level security;

-- Anyone can read categories
create policy "Read categories" on public.categories
  for select using (true);

-- Authenticated users can add new categories
create policy "Insert custom categories" on public.categories
  for insert with check (auth.uid() = created_by);

-- Category owner can update (except slug/name) – for brevity we allow all:
create policy "Update own categories" on public.categories
  for update using (created_by = auth.uid());

-- 6. INDEXES ----------------------------------------------
create index if not exists idx_categories_slug          on public.categories(slug);
create index if not exists idx_categories_is_predefined on public.categories(is_predefined);
create index if not exists idx_categories_story_count   on public.categories(story_count desc);
