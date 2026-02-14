
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'technician');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create tickets table with exact 15-column schema
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sl_no SERIAL,
  request_id TEXT NOT NULL UNIQUE,
  created_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  user_name TEXT NOT NULL,
  process TEXT DEFAULT '',
  reported_by TEXT DEFAULT '',
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  technician_name TEXT NOT NULL,
  issue_category TEXT NOT NULL,
  sub_category TEXT DEFAULT '',
  effort_time TEXT DEFAULT '',
  request_status TEXT NOT NULL DEFAULT 'Open' CHECK (request_status IN ('Open', 'Closed')),
  remarks TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Tickets policies
CREATE POLICY "Admins can do everything with tickets"
  ON public.tickets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Technicians can view their own tickets"
  ON public.tickets FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Technicians can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Auto-generate request ID function
CREATE OR REPLACE FUNCTION public.generate_request_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  month_abbr TEXT;
  ticket_count INT;
BEGIN
  month_abbr := TO_CHAR(CURRENT_DATE, 'Mon');
  SELECT COUNT(*) + 1 INTO ticket_count
  FROM public.tickets
  WHERE EXTRACT(MONTH FROM created_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM created_date) = EXTRACT(YEAR FROM CURRENT_DATE);
  NEW.request_id := 'SR\' || month_abbr || '\' || LPAD(ticket_count::TEXT, 3, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_request_id
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  WHEN (NEW.request_id = '' OR NEW.request_id IS NULL)
  EXECUTE FUNCTION public.generate_request_id();

-- Auto-calculate effort time
CREATE OR REPLACE FUNCTION public.calculate_effort_time()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    NEW.effort_time := TO_CHAR(NEW.end_time - NEW.start_time, 'HH24:MI');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_effort_time
  BEFORE INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_effort_time();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
