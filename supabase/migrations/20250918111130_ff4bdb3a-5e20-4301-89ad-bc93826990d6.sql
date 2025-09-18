-- Gamification and Community Enhancement Schema

-- Achievements system
CREATE TABLE public.achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  unlock_criteria jsonb NOT NULL DEFAULT '{}',
  icon_url text,
  animation_type text DEFAULT 'glow',
  coin_reward integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- User achievements junction table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id),
  unlocked_date timestamp with time zone DEFAULT now(),
  progress_percentage integer DEFAULT 0,
  shared_count integer DEFAULT 0,
  celebration_viewed boolean DEFAULT false,
  UNIQUE(user_id, achievement_id)
);

-- Seasonal challenges
CREATE TABLE public.seasonal_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  theme text NOT NULL,
  description text,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  goal_target integer NOT NULL,
  participant_count integer DEFAULT 0,
  exclusive_badge_id uuid,
  reward_description text,
  background_color text DEFAULT '#0EA5E9',
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now()
);

-- Seasonal challenge participants
CREATE TABLE public.seasonal_challenge_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid NOT NULL REFERENCES public.seasonal_challenges(id),
  user_id uuid NOT NULL,
  joined_date timestamp with time zone DEFAULT now(),
  progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  completion_date timestamp with time zone,
  UNIQUE(challenge_id, user_id)
);

-- Collectibles system
CREATE TABLE public.collectibles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  rarity text NOT NULL DEFAULT 'common',
  unlock_criteria jsonb NOT NULL DEFAULT '{}',
  design_url text,
  animation_type text DEFAULT 'static',
  collection_series text,
  awarded_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- User collectibles
CREATE TABLE public.user_collectibles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  collectible_id uuid NOT NULL REFERENCES public.collectibles(id),
  earned_date timestamp with time zone DEFAULT now(),
  milestone_value integer,
  shared_count integer DEFAULT 0,
  UNIQUE(user_id, collectible_id)
);

-- Milestone photos
CREATE TABLE public.milestone_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id uuid REFERENCES public.achievements(id),
  photo_url text NOT NULL,
  upload_date timestamp with time zone DEFAULT now(),
  milestone_type text NOT NULL,
  milestone_value integer,
  celebration_viewed boolean DEFAULT false,
  shared_count integer DEFAULT 0,
  caption text
);

-- Gamification settings
CREATE TABLE public.gamification_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  animation_enabled boolean DEFAULT true,
  celebration_style text DEFAULT 'full',
  sharing_preferences jsonb DEFAULT '{"internal": true, "external": false}',
  reduced_motion boolean DEFAULT false,
  notification_preferences jsonb DEFAULT '{"achievements": true, "milestones": true, "challenges": true}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Onboarding progress tracking
CREATE TABLE public.onboarding_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  steps_completed jsonb DEFAULT '[]',
  current_step text DEFAULT 'welcome',
  completed boolean DEFAULT false,
  completion_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enhanced user profiles (extending existing profiles)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS privacy_setting text DEFAULT 'public';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS total_steps bigint DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS current_phase text DEFAULT 'Phase 1';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS coins_earned bigint DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS achievements_count integer DEFAULT 0;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS activity_status text DEFAULT 'active';
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS last_active timestamp with time zone DEFAULT now();

-- Enable RLS on new tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collectibles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Achievements - everyone can view, only admins can modify
CREATE POLICY "Everyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User achievements - users can view their own and friends'
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.friendships f 
    WHERE ((f.requester_id = auth.uid() AND f.addressee_id = user_achievements.user_id) 
           OR (f.addressee_id = auth.uid() AND f.requester_id = user_achievements.user_id))
    AND f.status = 'accepted'
  ));

CREATE POLICY "Users can manage their own achievements" ON public.user_achievements
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Seasonal challenges - everyone can view active challenges
CREATE POLICY "Everyone can view active seasonal challenges" ON public.seasonal_challenges
  FOR SELECT USING (status = 'active' AND end_date >= now());

-- Seasonal challenge participants
CREATE POLICY "Users can view challenge participants" ON public.seasonal_challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own challenge participation" ON public.seasonal_challenge_participants
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Collectibles - everyone can view
CREATE POLICY "Everyone can view collectibles" ON public.collectibles
  FOR SELECT USING (true);

-- User collectibles - similar to achievements
CREATE POLICY "Users can view collectibles" ON public.user_collectibles
  FOR SELECT USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.friendships f 
    WHERE ((f.requester_id = auth.uid() AND f.addressee_id = user_collectibles.user_id) 
           OR (f.addressee_id = auth.uid() AND f.requester_id = user_collectibles.user_id))
    AND f.status = 'accepted'
  ));

CREATE POLICY "Users can manage their own collectibles" ON public.user_collectibles
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Milestone photos
CREATE POLICY "Users can view milestone photos based on privacy" ON public.milestone_photos
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.user_profiles up 
      WHERE up.user_id = milestone_photos.user_id 
      AND up.privacy_setting = 'public'
    ) OR
    EXISTS (
      SELECT 1 FROM public.friendships f 
      WHERE ((f.requester_id = auth.uid() AND f.addressee_id = milestone_photos.user_id) 
             OR (f.addressee_id = auth.uid() AND f.requester_id = milestone_photos.user_id))
      AND f.status = 'accepted'
    )
  );

CREATE POLICY "Users can manage their own milestone photos" ON public.milestone_photos
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Gamification settings
CREATE POLICY "Users can manage their own gamification settings" ON public.gamification_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Onboarding progress
CREATE POLICY "Users can manage their own onboarding progress" ON public.onboarding_progress
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at columns
CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gamification_settings_updated_at
  BEFORE UPDATE ON public.gamification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (name, description, category, rarity, unlock_criteria, coin_reward) VALUES
-- Step Milestones
('First Steps', 'Take your very first steps with Yogic Mile', 'step_milestones', 'common', '{"daily_steps": 1}', 10),
('Century Walker', 'Walk 100 steps in a single day', 'step_milestones', 'common', '{"daily_steps": 100}', 25),
('Thousand Steps', 'Achieve 1,000 steps in one day', 'step_milestones', 'common', '{"daily_steps": 1000}', 50),
('Five K Champion', 'Reach 5,000 steps in a single day', 'step_milestones', 'uncommon', '{"daily_steps": 5000}', 100),
('Ten K Legend', 'Complete 10,000 steps in one day', 'step_milestones', 'rare', '{"daily_steps": 10000}', 200),
('Hundred K Hero', 'Accumulate 100,000 lifetime steps', 'step_milestones', 'rare', '{"lifetime_steps": 100000}', 500),
('Half Million Master', 'Reach 500,000 lifetime steps', 'step_milestones', 'epic', '{"lifetime_steps": 500000}', 1000),
('Million Step Myth', 'Achieve 1,000,000 lifetime steps', 'step_milestones', 'legendary', '{"lifetime_steps": 1000000}', 2500),

-- Streak Champions
('Week Warrior', 'Maintain a 7-day walking streak', 'streak_champions', 'uncommon', '{"streak_days": 7}', 150),
('Month Master', 'Keep a 30-day walking streak', 'streak_champions', 'rare', '{"streak_days": 30}', 500),
('Hundred Day Hero', 'Sustain a 100-day walking streak', 'streak_champions', 'epic', '{"streak_days": 100}', 1500),
('Year Long Legend', 'Maintain a 365-day walking streak', 'streak_champions', 'legendary', '{"streak_days": 365}', 5000),

-- Coin Masters
('First Earning', 'Earn your first paisa', 'coin_masters', 'common', '{"coins_earned": 1}', 5),
('Rupee Rookie', 'Earn ₹1 in total coins', 'coin_masters', 'common', '{"coins_earned": 100}', 20),
('Ten Rupee Tiger', 'Accumulate ₹10 in coins', 'coin_masters', 'uncommon', '{"coins_earned": 1000}', 100),
('Hundred Rupee Hero', 'Reach ₹100 in total earnings', 'coin_masters', 'rare', '{"coins_earned": 10000}', 500),
('Thousand Rupee Titan', 'Earn ₹1000 in total coins', 'coin_masters', 'epic', '{"coins_earned": 100000}', 2000),

-- Community Heroes
('Friend Finder', 'Add your first friend', 'community_heroes', 'common', '{"friends_count": 1}', 50),
('Social Butterfly', 'Connect with 10 friends', 'community_heroes', 'uncommon', '{"friends_count": 10}', 200),
('Community Contributor', 'Make your first forum post', 'community_heroes', 'common', '{"forum_posts": 1}', 75),
('Helpful Helper', 'Receive 10 upvotes on forum posts', 'community_heroes', 'uncommon', '{"upvotes_received": 10}', 250),

-- Challenge Winners
('First Challenge', 'Complete your first challenge', 'challenge_winners', 'common', '{"challenges_completed": 1}', 100),
('Challenge Champion', 'Win 5 challenges', 'challenge_winners', 'uncommon', '{"challenges_won": 5}', 300),
('Victory Veteran', 'Win 25 challenges', 'challenge_winners', 'rare', '{"challenges_won": 25}', 1000),

-- Onboarding
('Welcome Walker', 'Complete account registration', 'onboarding', 'common', '{"signup_completed": true}', 100),
('Profile Creator', 'Complete your user profile', 'onboarding', 'common', '{"profile_completed": true}', 50);

-- Insert default seasonal challenges
INSERT INTO public.seasonal_challenges (name, theme, description, start_date, end_date, goal_target, reward_description, background_color) VALUES
('September Monsoon Miles', 'monsoon', 'Walk through the monsoon season with indoor-friendly challenges', '2024-09-01 00:00:00+00', '2024-09-30 23:59:59+00', 150000, 'Exclusive Monsoon Walker badge and 500 bonus coins', '#4A90E2'),
('October Festive Steps', 'festive', 'Celebrate Diwali and festivals with special walking challenges', '2024-10-01 00:00:00+00', '2024-10-31 23:59:59+00', 200000, 'Limited Diwali Celebration badge and 1000 bonus coins', '#FF6B35'),
('November Gratitude Walks', 'mindfulness', 'Practice mindful walking and gratitude during November', '2024-11-01 00:00:00+00', '2024-11-30 23:59:59+00', 180000, 'Mindful Walker badge and meditation rewards', '#8B5A3C'),
('December Winter Warmth', 'winter', 'Stay motivated through winter with warming challenges', '2024-12-01 00:00:00+00', '2024-12-31 23:59:59+00', 220000, 'Winter Warrior badge and New Year bonus', '#2196F3');

-- Insert default collectibles
INSERT INTO public.collectibles (name, description, rarity, unlock_criteria, collection_series) VALUES
('Vintage Step Counter', 'A classic step counter from the early days of fitness tracking', 'uncommon', '{"milestone_type": "lifetime_steps", "value": 50000}', 'vintage_fitness'),
('Golden Walking Stick', 'An elegant walking stick for the distinguished walker', 'rare', '{"milestone_type": "streak", "value": 50}', 'elegant_accessories'),
('Diamond Sneakers', 'Premium sneakers for the ultimate walking champion', 'epic', '{"milestone_type": "lifetime_steps", "value": 750000}', 'premium_gear'),
('Rainbow Steps Trophy', 'A magnificent trophy celebrating walking achievements', 'legendary', '{"milestone_type": "achievements", "value": 25}', 'legendary_trophies'),
('Monsoon Umbrella', 'Special seasonal collectible from Monsoon Miles challenge', 'rare', '{"seasonal_challenge": "September Monsoon Miles"}', 'seasonal_2024'),
('Diwali Lamp', 'Festive collectible from the Diwali celebration challenge', 'rare', '{"seasonal_challenge": "October Festive Steps"}', 'seasonal_2024');