-- Set payee to 'nextier' for existing Cygnet payables that are owed to Nextier
update payables
set payee = 'nextier'
where client_id = 'cygnet'
  and payee is null
  and (description ilike '%nextier%' or description = '10% of time entries');
