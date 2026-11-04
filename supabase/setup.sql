-- =====================================================
-- Shan Tailor - Supabase setup (SQL Editor mein ek dafa Run karo)
-- =====================================================

-- 1) Profiles (name/phone/role) ---------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text,
  phone text unique,
  role text not null default 'user' check (role in ('user','tailor')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', '')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_tailor()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'tailor');
$$;

-- 2) Tables -----------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text, email text, phone text,
  design text, measurements text,
  cloth_type text, complexity text,
  total_price numeric,
  status text not null default 'pending',
  due_date date,
  tailor_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, email text not null, phone text not null,
  service text not null,
  date timestamptz,
  cloth_type text default 'cotton',
  complexity text default 'simple',
  rush boolean not null default false,
  total_price numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, phone text not null,
  chest text, waist text, hips text, shoulders text, length text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  img text not null,
  created_at timestamptz not null default now()
);

-- 3) Security (RLS) ---------------------------------------------
alter table public.profiles     enable row level security;
alter table public.orders       enable row level security;
alter table public.bookings     enable row level security;
alter table public.measurements enable row level security;
alter table public.designs      enable row level security;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read" on public.profiles for select
  using (id = auth.uid() or public.is_tailor());

do $$
declare t text;
begin
  foreach t in array array['orders','bookings','measurements'] loop
    execute format('drop policy if exists "%1$s select" on public.%1$s', t);
    execute format('drop policy if exists "%1$s insert" on public.%1$s', t);
    execute format('drop policy if exists "%1$s update" on public.%1$s', t);
    execute format('drop policy if exists "%1$s delete" on public.%1$s', t);
    -- user apna data dekhe, tailor sab ka
    execute format('create policy "%1$s select" on public.%1$s for select using (user_id = auth.uid() or public.is_tailor())', t);
    execute format('create policy "%1$s insert" on public.%1$s for insert with check (user_id = auth.uid() and status = ''pending'')', t);
    -- status badalna / delete sirf tailor
    execute format('create policy "%1$s update" on public.%1$s for update using (public.is_tailor())', t);
    execute format('create policy "%1$s delete" on public.%1$s for delete using (public.is_tailor())', t);
  end loop;
end $$;

drop policy if exists "designs read" on public.designs;
create policy "designs read" on public.designs for select using (true);
drop policy if exists "designs write" on public.designs;
create policy "designs write" on public.designs for all
  using (public.is_tailor()) with check (public.is_tailor());

-- 4) Starter designs --------------------------------------------
insert into public.designs (title, img)
select * from (values
  ('Golden Sherwani Embroidery Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4XOUDBpHrTJLq3UdU12jLtU2w7ln8PROanA&s'),
  ('Classic Cream Sherwani Front Look', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLJ6UGvH3w4qis1S4S4oP9BIt1PbArgKS1aw&s'),
  ('Black Sherwani Gold Work Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlSTTfzGS7hND_nrVyxXsHMejUiTyZJUNPGQ&s'),
  ('Maroon Sherwani Heavy Embroidery', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWoHnW5rF5QesSwU5i0iI1KdYNhQzsDzV5ag&s'),
  ('Royal Blue Sherwani Front Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUX9buH3g4WGVdzZTfjqJcr4Y9hMKEo82Uew&s'),
  ('White Sherwani Collar and Button Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1O6HiKMyJFnuyj7615Rm839WtyB_Xfq10pQ&s'),
  ('Dark Blue Kurta Simple Style', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6eP6y6SVGg1taS62wJy_35aWE_krM7dR0rA&s'),
  ('Black Kurta Front Placket Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXDB28pbA_8SKty_qYvN1iXYBHc08eR-OlRw&s'),
  ('Gray Kurta Fabric Closeup', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsAjUgi66I1yYbX_55I8JHpt-N-xozROjC6Q&s'),
  ('Brown Kurta Collar Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ8V1_RXay_Kg-7N5ozouIyO8SacwCJnC1rA&s'),
  ('Gray Kurta Sleeve & Stitch Detail', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsAjUgi66I1yYbX_55I8JHpt-N-xozROjC6Q&s'),
  ('Simple Kurta Light Embroidery', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl2jObPz67chYdgbXE6BoQfE6sg1YPviRxzg&s'),
  ('Sherwani Embroidery Gold', 'https://images.pexels.com/photos/14858300/pexels-photo-14858300.jpeg'),
  ('Sherwani Collar Detail', 'https://images.pexels.com/photos/14858299/pexels-photo-14858299.jpeg'),
  ('Black Sherwani Gold Button Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiu6gXC3Q1BgfUP1-nfRnI2KmPYtOt3sj9Sg&s'),
  ('Cream Sherwani Embroidery Closeup', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJC6N1TBeQTDOTqPNIqF7O1ljrDHd_blfuuw&s'),
  ('Kurta Collar and Button Detail', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnBWu_-kMN_ZwXoJ_W9Ac_m7goRG_9G4xwJg&s'),
  ('White Sherwani Front Embroidery Style', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvOdJkNvNl0AfulPEDCdVtBy8HxdOJ6VrW8A&s'),
  ('White Sherwani Elegant Thread Work', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvOdJkNvNl0AfulPEDCdVtBy8HxdOJ6VrW8A&s'),
  ('Simple Kurta Neck Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuH4sjY55oSoc3ZtkvMsX59dlRgqji59NQFA&s'),
  ('Blue Kurta Soft Fabric Texture', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKBXdlnFGr3E4anOCyhFu8NlEo8LMoFXJjmg&s'),
  ('Light Cream Kurta Front Pattern', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6-h3_NZCC5YdHW32gyWpBTzDuFL5hUWSeoQ&s'),
  ('Black Kurta Premium Fabric Detail', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQo3e2RkTdhB729vKvettpAZf8GLjyz7ffgA&s'),
  ('Elegant White Kurta Embroidery', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu1JiYvZI2a8UVU0qfyTwtD5j28L5ikMwq2Q&s'),
  ('Formal Kurta Straight Stitch Design', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlwEFrHqJAGnisJrdb4ewrfmSxyaSmfQ9vzw&s')
) as v(title, img)
where not exists (select 1 from public.designs);

-- 5) Apne account ko TAILOR (admin) banane ke liye (register karne ke baad):
-- update public.profiles set role = 'tailor' where email = 'YAHAN_APNI_EMAIL';
-- Update 3: user apna order edit kar sake (sirf jab tak 'pending' ho), tailor price badal sake

-- Price formula (app ke priceCalculator ke barabar)
create or replace function public.calc_price(cloth text, cx text)
returns numeric language sql immutable as $$
  select (case cloth when 'silk' then 100 when 'linen' then 70 else 50 end)
       * (case cx when 'moderate' then 1.5 when 'complex' then 2 else 1 end);
$$;

-- User sirf apna PENDING order update kar sakta hai, tailor sab
drop policy if exists "orders update" on public.orders;
create policy "orders update" on public.orders for update
  using (public.is_tailor() or (user_id = auth.uid() and status = 'pending'))
  with check (public.is_tailor() or (user_id = auth.uid() and status = 'pending'));

-- Guard: user status/price/date/note/owner nahi badal sakta
create or replace function public.orders_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_tailor() then
    return new;
  end if;
  if old.status <> 'pending' then
    raise exception 'Silai shuru ho chuki hai, order edit nahi ho sakta';
  end if;
  new.id := old.id;
  new.user_id := old.user_id;
  new.status := old.status;
  new.due_date := old.due_date;
  new.tailor_note := old.tailor_note;
  new.created_at := old.created_at;
  if new.cloth_type is distinct from old.cloth_type
     or new.complexity is distinct from old.complexity then
    new.total_price := public.calc_price(new.cloth_type, new.complexity);
  else
    new.total_price := old.total_price;
  end if;
  return new;
end $$;

drop trigger if exists orders_guard on public.orders;
create trigger orders_guard before update on public.orders
  for each row execute function public.orders_guard();
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
