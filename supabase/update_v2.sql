-- Update 2: tailor features (delivery date + note) aur security tight
alter table public.orders add column if not exists due_date date;
alter table public.orders add column if not exists tailor_note text;

-- User naya order/booking/measurement sirf 'pending' status ke saath bana sakta hai
do $$
declare t text;
begin
  foreach t in array array['orders','bookings','measurements'] loop
    execute format('drop policy if exists "%1$s insert" on public.%1$s', t);
    execute format('create policy "%1$s insert" on public.%1$s for insert with check (user_id = auth.uid() and status = ''pending'')', t);
  end loop;
end $$;
