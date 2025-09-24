-- Enable RLS on catalog tables and allow public read
alter table if exists public.catalog_models enable row level security;
alter table if exists public.catalog_templates enable row level security;

create policy if not exists "allow_public_read"
on public.catalog_models
for select
to public
using (true);

create policy if not exists "allow_public_read_templates"
on public.catalog_templates
for select
to public
using (true);