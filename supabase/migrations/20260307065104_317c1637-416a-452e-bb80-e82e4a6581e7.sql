
-- Update the generate_request_id function to use SR/MMM/NN format with monthly reset
CREATE OR REPLACE FUNCTION public.generate_request_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  month_abbr TEXT;
  month_count INTEGER;
BEGIN
  month_abbr := TO_CHAR(CURRENT_DATE, 'Mon');
  
  -- Count existing tickets in the current month to get the sequence number
  SELECT COUNT(*) + 1 INTO month_count
  FROM public.tickets
  WHERE EXTRACT(MONTH FROM created_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM created_date) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  NEW.request_id := 'SR/' || month_abbr || '/' || LPAD(month_count::TEXT, 2, '0');
  RETURN NEW;
END;
$function$;
