ALTER TABLE public.profile
  ADD COLUMN IF NOT EXISTS contact_eyebrow text NOT NULL DEFAULT '06 — Contact',
  ADD COLUMN IF NOT EXISTS contact_heading text NOT NULL DEFAULT 'Let''s build something',
  ADD COLUMN IF NOT EXISTS contact_description text NOT NULL DEFAULT 'Open to software engineering roles, internships and collaborations. Messages land straight in the private dashboard.',
  ADD COLUMN IF NOT EXISTS contact_card_title text NOT NULL DEFAULT 'Direct',
  ADD COLUMN IF NOT EXISTS contact_availability_text text NOT NULL DEFAULT 'Available for new opportunities',
  ADD COLUMN IF NOT EXISTS contact_form_title text NOT NULL DEFAULT 'Send a message',
  ADD COLUMN IF NOT EXISTS contact_form_description text NOT NULL DEFAULT 'Tell me about the role, project or idea — I usually reply within a day.',
  ADD COLUMN IF NOT EXISTS contact_button_text text NOT NULL DEFAULT 'Send message',
  ADD COLUMN IF NOT EXISTS contact_links jsonb NOT NULL DEFAULT '[]'::jsonb;