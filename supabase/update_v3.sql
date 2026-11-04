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
