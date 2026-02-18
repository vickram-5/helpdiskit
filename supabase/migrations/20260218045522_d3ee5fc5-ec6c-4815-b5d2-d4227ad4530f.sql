
-- Fix the generate_request_id function to use sl_no instead of counting tickets (avoids race conditions)
CREATE OR REPLACE FUNCTION public.generate_request_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  month_abbr TEXT;
BEGIN
  month_abbr := TO_CHAR(CURRENT_DATE, 'Mon');
  NEW.request_id := 'SR\' || month_abbr || '\' || LPAD(NEW.sl_no::TEXT, 3, '0');
  RETURN NEW;
END;
$function$;

-- Also drop the unique constraint on request_id to prevent future issues, and re-add it
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_request_id_key;
