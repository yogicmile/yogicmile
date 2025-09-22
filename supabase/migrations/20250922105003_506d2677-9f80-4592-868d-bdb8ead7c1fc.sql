-- Fix infinite recursion in RLS policies and secure data access
-- Handle existing policies properly

-- 1. Create security definer functions to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_challenge_creator(challenge_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE id = challenge_id_param AND creator_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_family_plan_owner(plan_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_plans 
    WHERE id = plan_id_param AND primary_user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_family_member(plan_id_param UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_plan_id = plan_id_param AND member_user_id = auth.uid()
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- 2. Fix challenges table policies
DROP POLICY IF EXISTS "Users can view public challenges and their own" ON public.challenges;
DROP POLICY IF EXISTS "Challenge creators can update their challenges" ON public.challenges;

CREATE POLICY "Users can view public challenges and their own" 
ON public.challenges FOR SELECT 
USING (
  privacy_setting = 'public' OR 
  public.is_challenge_creator(id) OR 
  EXISTS (
    SELECT 1 FROM public.challenge_participants 
    WHERE challenge_id = id AND user_id = auth.uid()
  )
);

CREATE POLICY "Challenge creators can update their challenges" 
ON public.challenges FOR UPDATE 
USING (public.is_challenge_creator(id));

-- 3. Fix challenge_participants table policies
DROP POLICY IF EXISTS "Users can view challenge participants" ON public.challenge_participants;

CREATE POLICY "Users can view challenge participants" 
ON public.challenge_participants FOR SELECT 
USING (
  user_id = auth.uid() OR 
  public.is_challenge_creator(challenge_id) OR
  EXISTS (
    SELECT 1 FROM public.challenges 
    WHERE id = challenge_id AND privacy_setting = 'public'
  )
);

-- 4. Fix family_plans table policies
DROP POLICY IF EXISTS "Family members can view their family plan" ON public.family_plans;

CREATE POLICY "Family members can view their family plan" 
ON public.family_plans FOR SELECT 
USING (
  primary_user_id = auth.uid() OR 
  public.is_family_member(id)
);

-- 5. Fix family_members table policies  
DROP POLICY IF EXISTS "Family members can view family member list" ON public.family_members;

CREATE POLICY "Family members can view family member list" 
ON public.family_members FOR SELECT 
USING (
  member_user_id = auth.uid() OR 
  public.is_family_plan_owner(family_plan_id) OR
  public.is_family_member(family_plan_id)
);

-- 6. Secure user_profiles table - drop all existing policies first
DROP POLICY IF EXISTS "Anyone can view user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;

-- Add profile_visibility column if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'friends' 
CHECK (profile_visibility IN ('public', 'friends', 'private'));

-- Create new secure policies for user_profiles
CREATE POLICY "Users can view and update their own profile" 
ON public.user_profiles 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view public profiles or friends profiles" 
ON public.user_profiles FOR SELECT 
USING (
  user_id != auth.uid() AND (
    (profile_visibility = 'public') OR
    (profile_visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE ((requester_id = auth.uid() AND addressee_id = user_id) OR 
             (requester_id = user_id AND addressee_id = auth.uid())) 
      AND status = 'accepted'
    ))
  )
);

-- 7. Secure forum_posts table
DROP POLICY IF EXISTS "Anyone can view forum posts" ON public.forum_posts;

CREATE POLICY "Authenticated users can view forum posts" 
ON public.forum_posts FOR SELECT 
TO authenticated
USING (true);

-- 8. Secure business data tables
DROP POLICY IF EXISTS "Authenticated users can view active ads" ON public.ads;
CREATE POLICY "Authenticated users can view active ads" 
ON public.ads FOR SELECT 
TO authenticated
USING (status = 'active' AND active_from <= now() AND active_to >= now());

DROP POLICY IF EXISTS "Authenticated users can view active coupons" ON public.coupons;
CREATE POLICY "Authenticated users can view active coupons" 
ON public.coupons FOR SELECT 
TO authenticated
USING (status = 'active' AND expiry_date >= now());