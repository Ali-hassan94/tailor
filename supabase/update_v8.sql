-- Update 8: multiple tailors (staff), order assignment, owner-only role management

alter table public.orders add column if not exists assigned_to uuid references auth.users(id) on delete set null;

-- Owner = main admin (sirf yehi tailors add/remove kar sakta hai)
create or replace function public.is_owner()
returns boolean language sql stable as $$
  select lower(coalesce(auth.jwt()->>'email', '')) = lower('Shan733@gmail.com');
$$;

create or replace function public.set_user_role(target_email text, new_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then
    raise exception 'Sirf owner tailor add ya remove kar sakta hai';
  end if;
  if new_role not in ('user', 'tailor') then
    raise exception 'Invalid role';
  end if;
  if lower(target_email) = lower('Shan733@gmail.com') and new_role <> 'tailor' then
    raise exception 'Owner ko remove nahi kiya ja sakta';
  end if;
  update public.profiles set role = new_role where lower(email) = lower(target_email);
  if not found then
    raise exception 'Ye email registered nahi hai (pehle app mein Register karein)';
  end if;
end $$;

revoke all on function public.set_user_role(text, text) from public;
grant execute on function public.set_user_role(text, text) to authenticated;

-- User naye order par price/assignment khud set nahi kar sakta
create or replace function public.orders_insert_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_tailor() then
    new.total_price := null;
    new.assigned_to := null;
  end if;
  return new;
end $$;

drop trigger if exists orders_price_guard on public.orders;
drop trigger if exists orders_insert_guard on public.orders;
create trigger orders_insert_guard before insert on public.orders
  for each row execute function public.orders_insert_guard();

-- Guard update: user assignment bhi nahi badal sakta
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
  new.assigned_to := old.assigned_to;
  return new;
end $$;

drop trigger if exists orders_guard on public.orders;
create trigger orders_guard before update on public.orders
  for each row execute function public.orders_guard();
