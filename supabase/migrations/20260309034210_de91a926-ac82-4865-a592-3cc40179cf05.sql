
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- ===== TICKETS =====
DROP POLICY IF EXISTS "Admins can do everything with tickets" ON public.tickets;
DROP POLICY IF EXISTS "Technicians can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Technicians can view their own tickets" ON public.tickets;

-- Admins: full access (PERMISSIVE)
CREATE POLICY "Admins full access to tickets" ON public.tickets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Technicians: view own tickets (PERMISSIVE)
CREATE POLICY "Users can view own tickets" ON public.tickets
  FOR SELECT TO authenticated
  USING (created_by = auth.uid());

-- Technicians: create tickets (PERMISSIVE)
CREATE POLICY "Users can create tickets" ON public.tickets
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

-- ===== PROFILES =====
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Admins: full access (PERMISSIVE)
CREATE POLICY "Admins full access to profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users: view own profile (PERMISSIVE)
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Users: update own profile (PERMISSIVE)
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow trigger-based profile creation (PERMISSIVE)
CREATE POLICY "Allow profile creation on signup" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ===== USER_ROLES =====
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

-- Admins: full access (PERMISSIVE)
CREATE POLICY "Admins full access to roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users: view own role (PERMISSIVE)
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
