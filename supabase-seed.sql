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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_client ON time_entries (client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions (client_id);

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Allow all access') THEN
    CREATE POLICY "Allow all access" ON time_entries FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Allow all access') THEN
    CREATE POLICY "Allow all access" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

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
