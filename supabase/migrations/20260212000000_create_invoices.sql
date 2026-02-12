CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  period_start  DATE,
  period_end    DATE,
  total_time    NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_subscriptions NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_payables NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total   NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_client ON invoices (client_id);

ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;
ALTER TABLE payables ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL;

CREATE INDEX idx_time_entries_client_invoice ON time_entries (client_id, invoice_id);
CREATE INDEX idx_subscriptions_client_invoice ON subscriptions (client_id, invoice_id);
CREATE INDEX idx_payables_client_invoice ON payables (client_id, invoice_id);
