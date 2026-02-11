-- Migrate any client-c data to nextier
UPDATE time_entries SET client_id = 'nextier' WHERE client_id = 'client-c';
UPDATE subscriptions SET client_id = 'nextier' WHERE client_id = 'client-c';
UPDATE payables SET client_id = 'nextier' WHERE client_id = 'client-c';

-- Delete the client-c record
DELETE FROM clients WHERE id = 'client-c';
