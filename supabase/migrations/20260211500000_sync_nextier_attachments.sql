-- Sync attachments from client payables to their Nextier mirrors
UPDATE payables n
SET attachments = c.attachments
FROM payables c
WHERE n.client_id = 'nextier'
  AND c.client_id != 'nextier'
  AND n.description = c.description
  AND n.amount = c.amount
  AND n.date = c.date
  AND c.attachments != '[]'::jsonb
  AND n.attachments = '[]'::jsonb;
