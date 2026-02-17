alter table invoices add column if not exists paid boolean not null default false;
alter table invoices add column if not exists paid_date text;
