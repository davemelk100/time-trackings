-- Add links JSONB column to time_entries, subscriptions, and payables
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS links JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS links JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE payables ADD COLUMN IF NOT EXISTS links JSONB NOT NULL DEFAULT '[]'::jsonb;
