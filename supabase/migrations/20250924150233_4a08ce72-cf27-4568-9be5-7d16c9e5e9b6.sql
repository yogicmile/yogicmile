-- Fix infinite recursion in RLS policies for challenges and challenge_participants
-- Strategy: remove cross-referencing policies and use SECURITY DEFINER helper
-- functions to evaluate access without policy recursion.

begin;

-- 1) Helper function: can the current user view a given challenge?
create or replace function public.can_view_challenge(p_challenge_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select (c.privacy_setting = 'public')
        or (public.get_user_challenge_role(c.id) in ('creator','participant'))
    from public.challenges c
    where c.id = p_challenge_id
  ), false);
$$;

-- 2) Clean up existing SELECT policies that cause recursion or duplication
-- Challenges table
drop policy if exists "Users can view public challenges and their own" on public.challenges;
drop policy if exists "Users can view challenges based on privacy and participation" on public.challenges;

-- Create a single, safe SELECT policy for challenges
create policy "Users can view challenges (safe)"
  on public.challenges
  for select
  using (
    (privacy_setting = 'public')
    or (public.get_user_challenge_role(id) in ('creator','participant'))
  );

-- challenge_participants table
-- Remove potentially recursive/duplicated policies
drop policy if exists "Users can view challenge participants" on public.challenge_participants;
drop policy if exists "Users can view participants of accessible challenges" on public.challenge_participants;

-- Create a single, safe SELECT policy for challenge_participants
create policy "Users can view participants (safe)"
  on public.challenge_participants
  for select
  using (
    (user_id = auth.uid())
    or public.can_view_challenge(challenge_id)
  );

commit;