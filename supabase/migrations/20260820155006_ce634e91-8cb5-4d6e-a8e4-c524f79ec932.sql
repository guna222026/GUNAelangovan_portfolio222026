CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);