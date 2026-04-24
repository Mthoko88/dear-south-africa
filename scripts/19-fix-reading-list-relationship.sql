-- Ensure Postgres & PostgREST recognise the FK so the relationship
-- can be used in RPC / `select("*, reading_list_items(count)")` later.

DO $$
BEGIN
  ALTER TABLE IF EXISTS public.reading_list_items
    ADD CONSTRAINT fk_reading_list
    FOREIGN KEY (reading_list_id) REFERENCES public.reading_lists(id)
    ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    -- constraint already exists
    NULL;
END$$;
