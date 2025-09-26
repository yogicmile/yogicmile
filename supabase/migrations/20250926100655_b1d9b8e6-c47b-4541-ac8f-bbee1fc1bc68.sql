begin;

-- Ensure RLS is enabled on users table
alter table if exists public.users enable row level security;

-- Tight, explicit self-access policies
drop policy if exists "Users can insert their own users row" on public.users;
create policy "Users can insert their own users row"
  on public.users
  for insert
  with check (id = auth.uid());

drop policy if exists "Users can view their own users row" on public.users;
create policy "Users can view their own users row"
  on public.users
  for select
  using (id = auth.uid());

drop policy if exists "Users can update their own users row" on public.users;
create policy "Users can update their own users row"
  on public.users
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Secure RPC to create/find user without relying on client-side inserts
create or replace function public.create_user_with_mobile(
  p_mobile_number text,
  p_full_name text,
  p_email text default null,
  p_address text default null,
  p_referred_by text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_existing uuid;
begin
  select id into v_existing
  from public.users
  where mobile_number = p_mobile_number
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  insert into public.users (
    id, mobile_number, full_name, email, address, referred_by, referral_code, role
  ) values (
    coalesce(auth.uid(), gen_random_uuid()),
    p_mobile_number,
    p_full_name,
    p_email,
    p_address,
    p_referred_by,
    p_mobile_number, -- use mobile as referral code
    'user'
  ) returning id into v_user_id;

  return v_user_id;
end;
$$;

-- Allow web clients to call the RPC
grant execute on function public.create_user_with_mobile(text, text, text, text, text) to anon, authenticated;

commit;