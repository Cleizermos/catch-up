CREATE TABLE public.allowed_emails (
  email text PRIMARY KEY CHECK (email = lower(email) AND length(email) BETWEEN 3 AND 254),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.allowed_emails TO authenticated;
GRANT ALL ON public.allowed_emails TO service_role;
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_allowed()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.allowed_emails WHERE email = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;

CREATE POLICY "admin read" ON public.allowed_emails FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin add" ON public.allowed_emails FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin remove" ON public.allowed_emails FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Block sign-up for emails not on the list; make the owner admin.
CREATE OR REPLACE FUNCTION public.check_allowed_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.allowed_emails WHERE email = lower(NEW.email)) THEN
    RAISE EXCEPTION 'email not allowed';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER check_allowed_signup BEFORE INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.check_allowed_signup();

CREATE OR REPLACE FUNCTION public.assign_owner_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'cleizermos@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER assign_owner_admin AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_owner_admin();

-- Items: only signed-in, allowed people.
DROP POLICY IF EXISTS "team read" ON public.items;
DROP POLICY IF EXISTS "team insert" ON public.items;
DROP POLICY IF EXISTS "team update" ON public.items;
DROP POLICY IF EXISTS "team delete" ON public.items;
REVOKE ALL ON public.items FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
CREATE POLICY "allowed read" ON public.items FOR SELECT TO authenticated USING (public.is_allowed());
CREATE POLICY "allowed insert" ON public.items FOR INSERT TO authenticated WITH CHECK (public.is_allowed() AND length(name) BETWEEN 1 AND 120 AND length(tent) BETWEEN 1 AND 40);
CREATE POLICY "allowed update" ON public.items FOR UPDATE TO authenticated USING (public.is_allowed()) WITH CHECK (length(name) BETWEEN 1 AND 120);
CREATE POLICY "allowed delete" ON public.items FOR DELETE TO authenticated USING (public.is_allowed());