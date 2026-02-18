
-- Drop existing restrictive policies on tickets
DROP POLICY IF EXISTS "Admins can do everything with tickets" ON public.tickets;
DROP POLICY IF EXISTS "Technicians can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Technicians can view their own tickets" ON public.tickets;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Admins can do everything with tickets"
ON public.tickets
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Technicians can create tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Technicians can view their own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (created_by = auth.uid());
