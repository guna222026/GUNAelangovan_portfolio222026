CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  label text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT '',
  visitor_id text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT 'desktop',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.page_views TO anon;
GRANT SELECT, INSERT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can record a page view"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(path) BETWEEN 1 AND 300
    AND length(label) <= 120
    AND length(referrer) <= 300
    AND length(visitor_id) <= 64
    AND device IN ('desktop','tablet','mobile')
  );

CREATE POLICY "admin reads page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX page_views_path_idx ON public.page_views (path);