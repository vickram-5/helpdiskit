ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_asset_id_fkey;
ALTER TABLE public.tickets DROP COLUMN IF EXISTS asset_id;