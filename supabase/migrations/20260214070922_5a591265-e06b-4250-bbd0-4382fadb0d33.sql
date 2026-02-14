
-- Create an admin user via a helper function that we'll drop after use
-- We need to use the service role to create the first admin
-- Instead, let's create a temporary function to bootstrap
CREATE OR REPLACE FUNCTION public.bootstrap_admin_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This will be called after the first admin user is created via the edge function
  -- For now, we just need to ensure the function exists
  NULL;
END;
$$;
