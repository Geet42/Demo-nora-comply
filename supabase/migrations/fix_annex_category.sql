-- Run this in Supabase SQL Editor if you see:
-- "Could not find the 'annex_category' column of 'ai_systems' in the schema cache"
--
-- Adds the column if missing and reloads the PostgREST schema cache.

alter table ai_systems add column if not exists annex_category text;

notify pgrst, 'reload schema';
