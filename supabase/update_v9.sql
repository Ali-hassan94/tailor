-- Update 9: user apna account khud delete kar sake (Google Play ki shart)

create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then
    raise exception 'Login zaroori hai';
  end if;
  if public.is_owner() or public.is_tailor() then
    raise exception 'Tailor/owner account yahan se delete nahi hota';
  end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
