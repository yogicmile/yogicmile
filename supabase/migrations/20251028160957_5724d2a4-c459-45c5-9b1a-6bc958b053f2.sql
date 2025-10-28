-- Phase 1: Enhanced Social & Gamification Database Schema

-- ============================================
-- 1. Custom Communities
-- ============================================
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banner_url TEXT,
  avatar_url TEXT,
  theme_settings JSONB DEFAULT '{"primaryColor": "#6366F1", "secondaryColor": "#8B5CF6", "layout": "grid"}'::jsonb,
  member_count INTEGER DEFAULT 0,
  total_distance_km NUMERIC(10, 2) DEFAULT 0,
  total_challenges_completed INTEGER DEFAULT 0,
  streak_record_days INTEGER DEFAULT 0,
  privacy_setting TEXT DEFAULT 'public' CHECK (privacy_setting IN ('public', 'private', 'invite_only')),
  invite_code TEXT UNIQUE,
  qr_code_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_communities_creator ON public.communities(creator_id);
CREATE INDEX idx_communities_status ON public.communities(status);
CREATE INDEX idx_communities_privacy ON public.communities(privacy_setting);

-- ============================================
-- 2. Community Memberships
-- ============================================
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_date TIMESTAMPTZ DEFAULT now(),
  contribution_score INTEGER DEFAULT 0,
  total_steps_contributed BIGINT DEFAULT 0,
  UNIQUE(community_id, user_id)
);

CREATE INDEX idx_community_members_user ON public.community_members(user_id);
CREATE INDEX idx_community_members_community ON public.community_members(community_id);

-- ============================================
-- 3. GPS Route Tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.walking_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
  route_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_location POINT,
  end_location POINT,
  distance_km NUMERIC(10, 3) DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  average_pace_min_per_km NUMERIC(5, 2),
  max_speed_kmh NUMERIC(5, 2),
  elevation_gain_m NUMERIC(8, 2),
  calories_burned INTEGER DEFAULT 0,
  steps_count INTEGER DEFAULT 0,
  route_thumbnail_url TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

CREATE INDEX idx_routes_user ON public.walking_routes(user_id);
CREATE INDEX idx_routes_challenge ON public.walking_routes(challenge_id);
CREATE INDEX idx_routes_completed ON public.walking_routes(completed_at);
CREATE INDEX idx_routes_status ON public.walking_routes(status);

-- ============================================
-- 4. Challenge Photo Uploads
-- ============================================
CREATE TABLE IF NOT EXISTS public.challenge_completion_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_id UUID REFERENCES public.walking_routes(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  caption TEXT CHECK (char_length(caption) <= 200),
  location POINT,
  likes_count INTEGER DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_photos_challenge ON public.challenge_completion_photos(challenge_id);
CREATE INDEX idx_photos_user ON public.challenge_completion_photos(user_id);
CREATE INDEX idx_photos_route ON public.challenge_completion_photos(route_id);

-- ============================================
-- 5. Enhanced Challenge System - Add Columns
-- ============================================
ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'extreme')),
ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT 'coins' CHECK (reward_type IN ('badges', 'coins', 'collectibles', 'combo')),
ADD COLUMN IF NOT EXISTS reward_items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS requires_photo_proof BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_gps_tracking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_be_duplicated BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS parent_challenge_id UUID REFERENCES public.challenges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS completion_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS route_type TEXT DEFAULT 'any' CHECK (route_type IN ('any', 'tracked', 'specific_location'));

CREATE INDEX idx_challenges_community ON public.challenges(community_id);
CREATE INDEX idx_challenges_difficulty ON public.challenges(difficulty_level);
CREATE INDEX idx_challenges_parent ON public.challenges(parent_challenge_id);

-- ============================================
-- 6. Virtual Teams & Group Walks
-- ============================================
CREATE TABLE IF NOT EXISTS public.virtual_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  community_id UUID REFERENCES public.communities(id) ON DELETE SET NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members INTEGER DEFAULT 10,
  team_goal_steps BIGINT DEFAULT 0,
  team_progress_steps BIGINT DEFAULT 0,
  walk_schedule JSONB DEFAULT '[]'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_virtual_teams_creator ON public.virtual_teams(creator_id);
CREATE INDEX idx_virtual_teams_community ON public.virtual_teams(community_id);
CREATE INDEX idx_virtual_teams_public ON public.virtual_teams(is_public);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.virtual_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'co_leader', 'member')),
  contribution_steps BIGINT DEFAULT 0,
  joined_date TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON public.team_members(team_id);
CREATE INDEX idx_team_members_user ON public.team_members(user_id);

-- ============================================
-- 7. Mini Challenges & Mystery Challenges
-- ============================================
CREATE TABLE IF NOT EXISTS public.mini_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('mini', 'mystery', 'remix')),
  name TEXT NOT NULL,
  description TEXT,
  target_steps INTEGER NOT NULL,
  time_limit_minutes INTEGER DEFAULT 60,
  reward_coins INTEGER DEFAULT 0,
  is_mystery BOOLEAN DEFAULT false,
  mystery_reveal TEXT,
  active_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_mini_challenges_type ON public.mini_challenges(type);
CREATE INDEX idx_mini_challenges_active ON public.mini_challenges(active_until);

-- ============================================
-- 8. Enhanced Leaderboards - Add Columns
-- ============================================
ALTER TABLE public.leaderboards 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.virtual_teams(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS leaderboard_type TEXT DEFAULT 'individual' CHECK (leaderboard_type IN ('individual', 'team', 'community'));

CREATE INDEX idx_leaderboards_team ON public.leaderboards(team_id);
CREATE INDEX idx_leaderboards_community ON public.leaderboards(community_id);
CREATE INDEX idx_leaderboards_type ON public.leaderboards(leaderboard_type);

-- ============================================
-- 9. Music & AR Features
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  music_service TEXT CHECK (music_service IN ('spotify', 'youtube', 'apple_music')),
  playlist_url TEXT,
  is_default_walking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_playlists_user ON public.user_playlists(user_id);

CREATE TABLE IF NOT EXISTS public.ar_mode_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ar_enabled BOOLEAN DEFAULT false,
  ar_theme TEXT DEFAULT 'nature' CHECK (ar_theme IN ('nature', 'futuristic', 'fantasy')),
  show_virtual_companions BOOLEAN DEFAULT false,
  achievement_animations BOOLEAN DEFAULT true
);

-- ============================================
-- 10. Route Heatmap Data
-- ============================================
CREATE TABLE IF NOT EXISTS public.route_heatmap_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  location_point POINT NOT NULL,
  intensity_score INTEGER DEFAULT 1,
  last_visited TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_heatmap_user ON public.route_heatmap_data(user_id);
CREATE INDEX idx_heatmap_community ON public.route_heatmap_data(community_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Communities
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public communities" ON public.communities
  FOR SELECT USING (privacy_setting = 'public');

CREATE POLICY "Members can view their communities" ON public.communities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create communities" ON public.communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their communities" ON public.communities
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their communities" ON public.communities
  FOR DELETE USING (auth.uid() = creator_id);

-- Community Members
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view community members" ON public.community_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_id AND (
        c.privacy_setting = 'public' OR
        EXISTS (SELECT 1 FROM public.community_members WHERE community_id = c.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can join communities" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON public.community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Walking Routes
ALTER TABLE public.walking_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own routes" ON public.walking_routes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view public routes" ON public.walking_routes
  FOR SELECT USING (true);

-- Challenge Photos
ALTER TABLE public.challenge_completion_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can upload their own photos" ON public.challenge_completion_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view challenge photos" ON public.challenge_completion_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can delete their own photos" ON public.challenge_completion_photos
  FOR DELETE USING (auth.uid() = user_id);

-- Virtual Teams
ALTER TABLE public.virtual_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public teams" ON public.virtual_teams
  FOR SELECT USING (is_public = true);

CREATE POLICY "Team members can view their teams" ON public.virtual_teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON public.virtual_teams
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their teams" ON public.virtual_teams
  FOR UPDATE USING (auth.uid() = creator_id);

-- Team Members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.virtual_teams t
      WHERE t.id = team_id AND (
        t.is_public = true OR
        EXISTS (SELECT 1 FROM public.team_members WHERE team_id = t.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can join teams" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave teams" ON public.team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Mini Challenges
ALTER TABLE public.mini_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active mini challenges" ON public.mini_challenges
  FOR SELECT USING (active_until > now() OR active_until IS NULL);

-- User Playlists
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own playlists" ON public.user_playlists
  FOR ALL USING (auth.uid() = user_id);

-- AR Settings
ALTER TABLE public.ar_mode_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AR settings" ON public.ar_mode_settings
  FOR ALL USING (auth.uid() = user_id);

-- Route Heatmap
ALTER TABLE public.route_heatmap_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own heatmap data" ON public.route_heatmap_data
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view community heatmap data" ON public.route_heatmap_data
  FOR SELECT USING (
    community_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE community_id = route_heatmap_data.community_id AND user_id = auth.uid()
    )
  );