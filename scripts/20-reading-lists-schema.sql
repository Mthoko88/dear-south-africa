-- =============================================================================
-- 20-reading-lists-schema.sql
-- Creates private/public reading lists with items + RLS & indexes
-- =============================================================================

-- 1.  LISTS -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reading_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2.  LIST ITEMS --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reading_list_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_list_id  UUID NOT NULL REFERENCES public.reading_lists(id) ON DELETE CASCADE,
  story_id         UUID NOT NULL REFERENCES public.stories(id)       ON DELETE CASCADE,
  added_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reading_list_id, story_id)
);

-- 3.  INDEXES -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_reading_lists_user  ON public.reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_list_items_list_id  ON public.reading_list_items(reading_list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_story_id ON public.reading_list_items(story_id);

-- 4.  ROW-LEVEL SECURITY ------------------------------------------------------
ALTER TABLE public.reading_lists        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list_items   ENABLE ROW LEVEL SECURITY;

-- Users can see their own lists OR any list marked public
CREATE POLICY "Lists - select" ON public.reading_lists
  FOR SELECT USING (auth.uid() = user_id OR is_public);

-- Users manage their own lists
CREATE POLICY "Lists - all" ON public.reading_lists
  FOR ALL USING (auth.uid() = user_id);

-- Items are visible if the parent list is visible to the user
CREATE POLICY "List items - select" ON public.reading_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reading_lists rl
      WHERE rl.id = reading_list_id
        AND (rl.user_id = auth.uid() OR rl.is_public)
    )
  );

-- Users manage items only in their own lists
CREATE POLICY "List items - all" ON public.reading_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.reading_lists rl
      WHERE rl.id = reading_list_id
        AND rl.user_id = auth.uid()
    )
  );
