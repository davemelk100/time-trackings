update payables
set payee = 'nextier'
where client_id = 'cygnet'
  and (payee is null or payee = '');
