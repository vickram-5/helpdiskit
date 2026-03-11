
-- Phase 1c: Create Assets table
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text NOT NULL UNIQUE,
  asset_type text NOT NULL,
  serial_number text DEFAULT '',
  assigned_user text DEFAULT '',
  status text NOT NULL DEFAULT 'Available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view assets
CREATE POLICY "Authenticated users can view assets" ON public.assets
  FOR SELECT TO authenticated USING (true);

-- Admins/leads/managers/head full access
CREATE POLICY "Admins full access to assets" ON public.assets
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'it_team_lead') OR 
    public.has_role(auth.uid(), 'it_manager') OR 
    public.has_role(auth.uid(), 'it_head')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'it_team_lead') OR 
    public.has_role(auth.uid(), 'it_manager') OR 
    public.has_role(auth.uid(), 'it_head')
  );

-- Phase 1b: Add new columns to tickets table
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS department text DEFAULT '';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS location text DEFAULT '';
ALTER TABLE public.tickets ADD COLUMN IF NOT EXISTS asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL;

-- Phase 1d: Allow leads/managers/head to view all tickets
CREATE POLICY "Leads and managers can view all tickets" ON public.tickets
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'it_team_lead') OR
    public.has_role(auth.uid(), 'it_manager') OR
    public.has_role(auth.uid(), 'it_head')
  );
