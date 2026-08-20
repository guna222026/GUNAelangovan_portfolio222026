REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;

-- split read policies so anon never evaluates is_admin()
DROP POLICY "stats public read" ON public.stats;
CREATE POLICY "stats anon read" ON public.stats FOR SELECT TO anon USING (published);
CREATE POLICY "stats auth read" ON public.stats FOR SELECT TO authenticated USING (true);

DROP POLICY "skill_categories public read" ON public.skill_categories;
CREATE POLICY "skill_categories anon read" ON public.skill_categories FOR SELECT TO anon USING (published);
CREATE POLICY "skill_categories auth read" ON public.skill_categories FOR SELECT TO authenticated USING (true);

DROP POLICY "projects public read" ON public.projects;
CREATE POLICY "projects anon read" ON public.projects FOR SELECT TO anon USING (published);
CREATE POLICY "projects auth read" ON public.projects FOR SELECT TO authenticated USING (true);

DROP POLICY "education public read" ON public.education;
CREATE POLICY "education anon read" ON public.education FOR SELECT TO anon USING (published);
CREATE POLICY "education auth read" ON public.education FOR SELECT TO authenticated USING (true);

DROP POLICY "experiences public read" ON public.experiences;
CREATE POLICY "experiences anon read" ON public.experiences FOR SELECT TO anon USING (published);
CREATE POLICY "experiences auth read" ON public.experiences FOR SELECT TO authenticated USING (true);

DROP POLICY "achievements public read" ON public.achievements;
CREATE POLICY "achievements anon read" ON public.achievements FOR SELECT TO anon USING (published);
CREATE POLICY "achievements auth read" ON public.achievements FOR SELECT TO authenticated USING (true);