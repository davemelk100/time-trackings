-- Create tables
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  time_range TEXT NOT NULL,
  total_hours NUMERIC(6,2) NOT NULL,
  tasks TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  renewal_date DATE,
  notes TEXT NOT NULL DEFAULT '',
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_client ON time_entries (client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions (client_id);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all access" ON time_entries;
DROP POLICY IF EXISTS "Allow all access" ON subscriptions;

-- Helper functions
CREATE OR REPLACE FUNCTION public.requesting_client_id() RETURNS TEXT AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'client_id', ''
  )
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.requesting_is_admin() RETURNS BOOLEAN AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role') = 'admin', false
  )
$$ LANGUAGE sql STABLE;

-- time_entries: admin full access, clients read own
CREATE POLICY "Admin full access on time_entries" ON time_entries FOR ALL
  USING (public.requesting_is_admin()) WITH CHECK (public.requesting_is_admin());
CREATE POLICY "Client read own time_entries" ON time_entries FOR SELECT
  USING (client_id = public.requesting_client_id());

-- subscriptions: admin full access, clients read own
CREATE POLICY "Admin full access on subscriptions" ON subscriptions FOR ALL
  USING (public.requesting_is_admin()) WITH CHECK (public.requesting_is_admin());
CREATE POLICY "Client read own subscriptions" ON subscriptions FOR SELECT
  USING (client_id = public.requesting_client_id());

-- Insert time entries
INSERT INTO time_entries (client_id, date, start_time, end_time, time_range, total_hours, tasks, notes) VALUES
('cygnet', '2025-02-06', '15:30', '21:25', '3:30 PM - 9:25 PM', 4.67, 'Activated the Yoast SEO plugin. Ran SEO scans on pages. Made text and image updates based on SEO scan findings.', 'Yoast SEO plugin activated'),
('cygnet', '2025-02-08', '12:45', '13:25', '12:45 PM - 1:25 PM', 0.67, 'Took baseline screenshots of SEO numbers and enabled further Yoast SEO features.', '');

-- Insert subscriptions
INSERT INTO subscriptions (client_id, name, category, billing_cycle, amount, renewal_date, notes) VALUES
('cygnet', 'Vercel Pro', 'Hosting & Infrastructure', 'monthly', 20.00, '2025-03-01', 'Next.js hosting and deployment'),
('cygnet', 'Sanity CMS', 'CMS (Sanity)', 'monthly', 15.00, '2025-03-01', 'Content management system'),
('cygnet', 'Supabase Pro', 'Supabase', 'monthly', 25.00, '2025-03-01', 'Database and auth backend'),
('cygnet', 'Stripe', 'Stripe', 'monthly', 0.00, NULL, 'Pay-per-transaction, no fixed subscription'),
('cygnet', 'PostHog', 'Analytics & Monitoring', 'monthly', 0.00, NULL, 'Free tier for analytics'),
('cygnet', 'Yoast SEO', 'SEO', 'annual', 118.80, '2026-02-06', 'SEO plugin for WordPress');
