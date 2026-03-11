
-- Phase 1a: Expand app_role enum with new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'system_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'network_engineer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it_team_lead';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'it_head';
