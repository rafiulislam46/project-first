-- Seed catalog reference data (safe upserts)

insert into public.catalog_models (id, name, gender, thumb_url, styles)
values
  ('model_alex', 'Alex', 'male', 'https://placehold.co/80x80', '[{"key":"casual","thumb":"https://placehold.co/48x48"},{"key":"formal","thumb":"https://placehold.co/48x48"}]'::jsonb),
  ('model_mia', 'Mia', 'female', 'https://placehold.co/80x80', '[{"key":"street","thumb":"https://placehold.co/48x48"},{"key":"sport","thumb":"https://placehold.co/48x48"}]'::jsonb)
on conflict (id) do update
set name = excluded.name,
    gender = excluded.gender,
    thumb_url = excluded.thumb_url,
    styles = excluded.styles;

insert into public.catalog_templates (id, name, category, ref_url, thumb)
values
  ('tpl_summer', 'Summer Dress', 'fashion', 'https://example.com/ref/summer', 'https://placehold.co/96x96'),
  ('tpl_winter', 'Winter Coat', 'fashion', 'https://example.com/ref/winter', 'https://placehold.co/96x96')
on conflict (id) do update
set name = excluded.name,
    category = excluded.category,
    ref_url = excluded.ref_url,
    thumb = excluded.thumb;