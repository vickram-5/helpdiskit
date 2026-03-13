-- Drop the existing overly permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with a restriction: users cannot change their own status
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = (SELECT p.status FROM public.profiles p WHERE p.user_id = auth.uid())
  );