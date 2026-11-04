-- Update 5: order ke saath customer photos, advance payment, security

alter table public.orders add column if not exists photo_paths text[];
alter table public.orders add column if not exists advance_paid numeric not null default 0;

-- Private bucket: customer ki photos (sirf owner aur tailor dekh sakte hain)
insert into storage.buckets (id, name, public)
values ('order-photos', 'order-photos', false)
on conflict (id) do update set public = false;

drop policy if exists "order photos insert" on storage.objects;
create policy "order photos insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'order-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "order photos select" on storage.objects;
create policy "order photos select" on storage.objects for select to authenticated
  using (bucket_id = 'order-photos'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_tailor()));

drop policy if exists "order photos delete" on storage.objects;
create policy "order photos delete" on storage.objects for delete to authenticated
  using (bucket_id = 'order-photos'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_tailor()));

-- User naya order sirf pending status aur advance 0 ke saath bana sakta hai
drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders for insert
  with check (user_id = auth.uid() and status = 'pending' and advance_paid = 0);

-- Guard (v3 ka update): user advance/photos bhi nahi badal sakta
create or replace function public.calc_price(cloth text, cx text)
returns numeric language sql immutable as $$
  select (case cloth when 'silk' then 100 when 'linen' then 70 else 50 end)
       * (case cx when 'moderate' then 1.5 when 'complex' then 2 else 1 end);
$$;

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
  new.advance_paid := old.advance_paid;
  new.photo_paths := old.photo_paths;
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
