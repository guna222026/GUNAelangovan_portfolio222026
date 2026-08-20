-- roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profile (singleton)
CREATE TABLE public.profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  about text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  resume_url text NOT NULL DEFAULT '',
  resume_updated_at timestamptz,
  languages text[] NOT NULL DEFAULT '{}',
  interests text[] NOT NULL DEFAULT '{}',
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile TO authenticated;
GRANT ALL ON public.profile TO service_role;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile public read" ON public.profile FOR SELECT USING (true);
CREATE POLICY "profile admin write" ON public.profile FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_profile_updated BEFORE UPDATE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- stats
CREATE TABLE public.stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value text NOT NULL,
  icon text NOT NULL DEFAULT 'Sparkles',
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stats TO authenticated;
GRANT ALL ON public.stats TO service_role;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats public read" ON public.stats FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "stats admin write" ON public.stats FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_stats_updated BEFORE UPDATE ON public.stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- skills
CREATE TABLE public.skill_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'Code2',
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skill_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_categories TO authenticated;
GRANT ALL ON public.skill_categories TO service_role;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skill_categories public read" ON public.skill_categories FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "skill_categories admin write" ON public.skill_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_skill_categories_updated BEFORE UPDATE ON public.skill_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.skill_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skills TO authenticated;
GRANT ALL ON public.skills TO service_role;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills public read" ON public.skills FOR SELECT USING (true);
CREATE POLICY "skills admin write" ON public.skills FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_skills_updated BEFORE UPDATE ON public.skills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- projects
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  problem text NOT NULL DEFAULT '',
  solution text NOT NULL DEFAULT '',
  implementation text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  tech_stack text[] NOT NULL DEFAULT '{}',
  architecture_steps text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  cover_url text NOT NULL DEFAULT '',
  demo_url text NOT NULL DEFAULT '',
  github_url text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects public read" ON public.projects FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "projects admin write" ON public.projects FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.project_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'screenshot',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.project_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_media TO authenticated;
GRANT ALL ON public.project_media TO service_role;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_media public read" ON public.project_media FOR SELECT USING (true);
CREATE POLICY "project_media admin write" ON public.project_media FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- education
CREATE TABLE public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  degree text NOT NULL,
  field text NOT NULL DEFAULT '',
  institution text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.education TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education TO authenticated;
GRANT ALL ON public.education TO service_role;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "education public read" ON public.education FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "education admin write" ON public.education FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_education_updated BEFORE UPDATE ON public.education FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- experiences
CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'Volunteering',
  location text NOT NULL DEFAULT '',
  start_date date,
  end_date date,
  description text NOT NULL DEFAULT '',
  bullets text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "experiences public read" ON public.experiences FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "experiences admin write" ON public.experiences FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_experiences_updated BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- achievements
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  issuer text NOT NULL DEFAULT '',
  date date,
  url text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements public read" ON public.achievements FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "achievements admin write" ON public.achievements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER trg_achievements_updated BEFORE UPDATE ON public.achievements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  company text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can send a message" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "admin reads messages" ON public.messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admin updates messages" ON public.messages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admin deletes messages" ON public.messages FOR DELETE TO authenticated USING (public.is_admin());

-- ============ SEED ============
INSERT INTO public.profile (full_name, title, headline, tagline, summary, about, email, phone, location, linkedin_url, github_url, languages, interests)
VALUES (
  'Guna E',
  'Software Engineer',
  'Software Engineering • AI & ML • Blockchain • Web Development',
  'Software Engineer | AI Enthusiast | Builder',
  'M.Tech Software Engineering student at VIT, Vellore with expertise in building intelligent, scalable, and secure full-stack applications.',
  'I am a passionate Software Engineering student at Vellore Institute of Technology specializing in Artificial Intelligence, Machine Learning, Blockchain, and Web Development. My work is grounded in strong fundamentals — data structures, algorithms, and system design — and I enjoy transforming ideas into real-world solutions through clean code, smart algorithms, and scalable architectures.',
  'gunae1426@gmail.com',
  '+91 88259 89841',
  'Tiruvallur, Tamil Nadu, India',
  'https://linkedin.com/in/guna-e-1b2a883b3/',
  '',
  ARRAY['Tamil','English'],
  ARRAY['AI','Blockchain','Problem Solving','Web Development']
);

INSERT INTO public.stats (label, value, icon, sort_order) VALUES
  ('Major Projects','4','FolderGit2',1),
  ('AI / ML Projects','2','BrainCircuit',2),
  ('Blockchain Project','1','Boxes',3),
  ('Education Program','1','GraduationCap',4),
  ('Volunteering','1','HeartHandshake',5),
  ('Tech Domains','4+','Layers',6);

INSERT INTO public.skill_categories (id, name, icon, sort_order) VALUES
  ('11111111-1111-4111-8111-000000000001','Programming','Code2',1),
  ('11111111-1111-4111-8111-000000000002','Databases','Database',2),
  ('11111111-1111-4111-8111-000000000003','Database Tools','Wrench',3),
  ('11111111-1111-4111-8111-000000000004','AI / Machine Learning','BrainCircuit',4),
  ('11111111-1111-4111-8111-000000000005','Blockchain','Boxes',5),
  ('11111111-1111-4111-8111-000000000006','Web Development','Globe',6),
  ('11111111-1111-4111-8111-000000000007','Tools & Others','Layers',7);

INSERT INTO public.skills (category_id, name, sort_order) VALUES
  ('11111111-1111-4111-8111-000000000001','Python',1),
  ('11111111-1111-4111-8111-000000000001','C++ (Basics)',2),
  ('11111111-1111-4111-8111-000000000001','SQL',3),
  ('11111111-1111-4111-8111-000000000001','R',4),
  ('11111111-1111-4111-8111-000000000001','HTML',5),
  ('11111111-1111-4111-8111-000000000001','CSS',6),
  ('11111111-1111-4111-8111-000000000001','JavaScript',7),
  ('11111111-1111-4111-8111-000000000002','MySQL',1),
  ('11111111-1111-4111-8111-000000000002','PostgreSQL',2),
  ('11111111-1111-4111-8111-000000000003','MySQL Workbench',1),
  ('11111111-1111-4111-8111-000000000003','pgAdmin',2),
  ('11111111-1111-4111-8111-000000000003','phpMyAdmin',3),
  ('11111111-1111-4111-8111-000000000004','SentenceTransformers',1),
  ('11111111-1111-4111-8111-000000000004','FAISS',2),
  ('11111111-1111-4111-8111-000000000004','LangChain',3),
  ('11111111-1111-4111-8111-000000000004','Ollama',4),
  ('11111111-1111-4111-8111-000000000004','Prompt Engineering',5),
  ('11111111-1111-4111-8111-000000000004','Vector Embeddings',6),
  ('11111111-1111-4111-8111-000000000004','Similarity Ranking',7),
  ('11111111-1111-4111-8111-000000000004','LLM',8),
  ('11111111-1111-4111-8111-000000000005','Ethereum',1),
  ('11111111-1111-4111-8111-000000000005','Solidity',2),
  ('11111111-1111-4111-8111-000000000005','Web3.js',3),
  ('11111111-1111-4111-8111-000000000005','SHA-256',4),
  ('11111111-1111-4111-8111-000000000005','Smart Contracts',5),
  ('11111111-1111-4111-8111-000000000006','Node.js',1),
  ('11111111-1111-4111-8111-000000000006','Flask',2),
  ('11111111-1111-4111-8111-000000000006','Streamlit',3),
  ('11111111-1111-4111-8111-000000000006','Firebase',4),
  ('11111111-1111-4111-8111-000000000006','HTML',5),
  ('11111111-1111-4111-8111-000000000006','CSS',6),
  ('11111111-1111-4111-8111-000000000006','JavaScript',7),
  ('11111111-1111-4111-8111-000000000007','Git',1),
  ('11111111-1111-4111-8111-000000000007','GitHub',2),
  ('11111111-1111-4111-8111-000000000007','VS Code',3),
  ('11111111-1111-4111-8111-000000000007','Figma',4),
  ('11111111-1111-4111-8111-000000000007','Canva',5),
  ('11111111-1111-4111-8111-000000000007','Video Editing',6),
  ('11111111-1111-4111-8111-000000000007','Adobe Lightroom',7),
  ('11111111-1111-4111-8111-000000000007','Microsoft Word',8),
  ('11111111-1111-4111-8111-000000000007','Microsoft Excel',9),
  ('11111111-1111-4111-8111-000000000007','Microsoft PowerPoint',10);

INSERT INTO public.projects (slug,title,subtitle,category,summary,problem,solution,implementation,outcome,highlights,tech_stack,architecture_steps,features,start_date,end_date,featured,sort_order) VALUES
(
 'blockchain-certificate-verification',
 'Smart Verification System for Academic Certificates',
 'Tamper-proof credential validation on Ethereum',
 'Blockchain',
 'A secure and tamper-proof academic certificate verification system using Ethereum blockchain, smart contracts, and SHA-256 hashing for real-time verification.',
 'Academic certificate verification is manual, slow, and vulnerable to forgery. Institutions and employers have no shared source of truth, so validating a single credential can take days of back-and-forth.',
 'A blockchain-based system that stores certificate hashes on Ethereum using smart contracts. Any verifier can re-hash a document and confirm authenticity instantly, without trusting an intermediary.',
 'A full-stack architecture connects a web frontend to backend APIs, a Solidity smart contract on Ethereum via Web3.js, and Firebase cloud storage for certificate artifacts. SHA-256 hashing anchors each document to an immutable on-chain record.',
 '98% verification accuracy with drastically reduced manual verification time.',
 ARRAY['98% accuracy in verification','Reduced manual verification time','Real-time certificate validation','Secure and immutable records'],
 ARRAY['Ethereum','Solidity','Node.js','Firebase','Web3.js','SHA-256','JavaScript','HTML','CSS'],
 ARRAY['Certificate upload','SHA-256 hash','Smart contract','Ethereum ledger','Instant verification'],
 ARRAY['Certificate hashing and anchoring','Smart-contract based validation','Real-time verification portal','Immutable audit trail','Cloud document storage'],
 '2026-01-20','2026-02-01',true,1
),
(
 'ai-pdf-search-engine',
 'Personal AI-Based PDF Search Engine',
 'Semantic search across large document collections',
 'AI / ML',
 'A semantic search engine over personal PDF libraries using SentenceTransformers embeddings and FAISS vector indexing, with an interactive Streamlit interface.',
 'Keyword search fails on large PDF collections — the right answer is often phrased differently from the query, so relevant passages are never surfaced.',
 'Documents are chunked and embedded with SentenceTransformers, indexed in FAISS, and retrieved by vector similarity so results match meaning rather than exact wording.',
 'A Streamlit interface handles real-time query processing, ranked results, and dynamic content preview across multiple documents.',
 'High-accuracy retrieval with significantly faster information lookup across large-scale PDF collections.',
 ARRAY['High-accuracy semantic search','Vector embeddings and similarity ranking','Real-time query processing','Dynamic document preview'],
 ARRAY['Python','SentenceTransformers','FAISS','Streamlit','Vector Embeddings'],
 ARRAY['PDF ingestion','Text chunking','Embedding model','FAISS index','Ranked results'],
 ARRAY['Multi-document semantic search','Similarity ranking','Interactive query UI','Inline content preview'],
 '2024-01-15','2024-04-14',true,2
),
(
 'jarvis-ai-assistant',
 'JARVIS — Personal AI Assistant',
 'Modular voice-enabled assistant with a web interface',
 'AI Assistant',
 'A modular AI-powered personal assistant with a web interface supporting AI chat, task management, and utility tools, plus voice interaction and real-time responses.',
 'Everyday productivity is fragmented across separate apps for chat, tasks, timers, notes, and calculations, with no single conversational entry point.',
 'A modular assistant that unifies AI chat, task management, and utility tools behind one responsive web interface with voice interaction.',
 'Python powers the assistant core and a lightweight backend server handles real-time responses; the frontend is built with HTML, CSS, and JavaScript for dynamic UI updates.',
 'Seamless cross-platform accessibility with fast, conversational task handling.',
 ARRAY['Voice interaction','Real-time response handling','Modular tool architecture','Cross-platform web access'],
 ARRAY['Python','JavaScript','HTML','CSS','Speech Recognition'],
 ARRAY['Voice / text input','Intent routing','Assistant core','Tool modules','Live UI update'],
 ARRAY['AI chat','Task management','Timer','Calculator','Notes','Voice commands'],
 '2023-12-15','2024-02-03',true,3
),
(
 'ai-email-summarizer',
 'AI Agent to Summarize Email',
 'LLM-powered inbox triage with LangChain and Ollama',
 'AI / Automation',
 'A real-time email summarization system using Flask, LangChain, and a locally hosted Ollama LLM to fetch unread mail over IMAP and produce concise, actionable summaries.',
 'High-volume inboxes create information overload; reading every message to find what actually needs action wastes hours each week.',
 'An agent retrieves unread email over IMAP and pushes content through an LLM summarization chain that returns short, actionable insights per message.',
 'Flask exposes the workflow, LangChain orchestrates the summarization chain, and Ollama runs the LLM locally so email content never leaves the machine.',
 'Reduced information overload and measurably faster decision-making on incoming mail.',
 ARRAY['Secure IMAP retrieval','LLM summarization chains','Actionable insight extraction','Local, private LLM inference'],
 ARRAY['Flask','LangChain','Ollama','Python','IMAP','LLM'],
 ARRAY['IMAP fetch','Content parsing','LangChain chain','Ollama LLM','Summary digest'],
 ARRAY['Unread email fetch','Automatic summarization','Actionable insights','Scalable backend workflow'],
 '2024-01-03','2024-03-06',true,4
);

INSERT INTO public.education (degree, field, institution, location, start_date, end_date, description, highlights, sort_order) VALUES
('Integrated Master of Technology','Software Engineering','Vellore Institute of Technology','Vellore, India','2022-09-22','2027-08-07',
 'Five-year integrated M.Tech program focused on software development, data structures, algorithms, and system design.',
 ARRAY['Data Structures & Algorithms','System Design','Database Management','Machine Learning','Web Technologies'],1);

INSERT INTO public.experiences (title, organization, kind, location, start_date, end_date, description, bullets, sort_order) VALUES
('National Service Scheme (NSS) Volunteer','Vellore Institute of Technology','Volunteering','Vellore, India','2024-10-15','2024-10-30',
 'Actively participated in the NSS camp, contributing to community service while building teamwork and leadership skills.',
 ARRAY['Community service initiatives','Team coordination','Leadership and on-ground problem solving'],1);