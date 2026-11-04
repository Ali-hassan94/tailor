-- Update 7: price sirf tailor set karega, designs par price (Home page)

alter table public.designs add column if not exists price numeric;

-- User ke naye order/booking par price khud nahi lagegi (tailor baad mein set karega)
create or replace function public.price_insert_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_tailor() then
    if tg_table_name = 'bookings' then
      new.total_price := 0;
    else
      new.total_price := null;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists orders_price_guard on public.orders;
create trigger orders_price_guard before insert on public.orders
  for each row execute function public.price_insert_guard();

drop trigger if exists bookings_price_guard on public.bookings;
create trigger bookings_price_guard before insert on public.bookings
  for each row execute function public.price_insert_guard();

-- User apna pending order edit kare to bhi price nahi badal sakta
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
  new.total_price := old.total_price;
  return new;
end $$;

drop trigger if exists orders_guard on public.orders;
create trigger orders_guard before update on public.orders
  for each row execute function public.orders_guard();
