-- Create passcodes table for runtime passcode management
CREATE TABLE IF NOT EXISTS passcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE passcodes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous reads (needed for login check)
CREATE POLICY "Allow anonymous read" ON passcodes FOR SELECT USING (true);

-- Allow anonymous insert/update/delete (admin enforced in app)
CREATE POLICY "Allow anonymous insert" ON passcodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON passcodes FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON passcodes FOR DELETE USING (true);

-- Seed with current env var passcodes
INSERT INTO passcodes (code, role, client_id, label) VALUES
  ('77156', 'admin', NULL, 'Admin'),
  ('97006', 'client', 'cygnet', 'Cygnet'),
  ('65872', 'client', 'mindflip', 'Mindflip'),
  ('50667', 'client', 'nextier', 'Nextier');
