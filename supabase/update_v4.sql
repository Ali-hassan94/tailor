-- Update 4: tailor Home page ke liye design photos upload kar sake

alter table public.designs add column if not exists category text default 'Other';
alter table public.designs add column if not exists img_path text;

-- Purane designs ki category (naam se)
update public.designs set category = 'Sherwani'  where category = 'Other' and title ilike '%sherwani%';
update public.designs set category = 'Waistcoat' where category = 'Other' and title ilike '%waistcoat%';
update public.designs set category = 'Suit'      where category = 'Other' and title ilike '%suit%';
update public.designs set category = 'Kurta'     where category = 'Other' and title ilike '%kurta%';
update public.designs set category = 'Shalwar Kameez' where category = 'Other' and (title ilike '%shalwar%' or title ilike '%kameez%');
update public.designs set category = 'Shirt'     where category = 'Other' and title ilike '%shirt%';

-- Photos ke liye public storage bucket
insert into storage.buckets (id, name, public)
values ('designs', 'designs', true)
on conflict (id) do update set public = true;

drop policy if exists "designs images read" on storage.objects;
create policy "designs images read" on storage.objects for select
  using (bucket_id = 'designs');

drop policy if exists "designs images tailor insert" on storage.objects;
create policy "designs images tailor insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'designs' and public.is_tailor());

drop policy if exists "designs images tailor update" on storage.objects;
create policy "designs images tailor update" on storage.objects for update to authenticated
  using (bucket_id = 'designs' and public.is_tailor());

drop policy if exists "designs images tailor delete" on storage.objects;
create policy "designs images tailor delete" on storage.objects for delete to authenticated
  using (bucket_id = 'designs' and public.is_tailor());
