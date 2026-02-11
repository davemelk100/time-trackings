CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hourly_rate NUMERIC(10,2),
  flat_rate NUMERIC(10,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO clients (id, name, hourly_rate, flat_rate) VALUES
('cygnet', 'Cygnet Institute', 62, NULL),
('client-b', 'Mind Flip', 50, NULL)
ON CONFLICT (id) DO NOTHING;
