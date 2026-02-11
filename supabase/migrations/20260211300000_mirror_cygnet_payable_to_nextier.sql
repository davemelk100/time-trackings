-- Mirror existing Cygnet payable to Nextier as a paid proceed
INSERT INTO payables (client_id, description, amount, date, paid, paid_date, notes)
SELECT 'nextier', description, amount, date, true, CURRENT_DATE, notes
FROM payables
WHERE client_id = 'cygnet'
  AND description = 'Nextier Cygnet proceeds invoice 2/11/2026'
  AND NOT EXISTS (
    SELECT 1 FROM payables
    WHERE client_id = 'nextier'
      AND description = 'Nextier Cygnet proceeds invoice 2/11/2026'
  );
