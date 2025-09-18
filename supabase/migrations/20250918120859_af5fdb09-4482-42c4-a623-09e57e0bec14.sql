-- Enhanced database structure for advanced Yogic Mile features

-- Remove step cap entirely and add unlimited tracking
ALTER TABLE daily_steps DROP CONSTRAINT IF EXISTS daily_steps_steps_check;

-- Connected devices for wearable integration
CREATE TABLE public.connected_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_type text NOT NULL, -- 'fitbit', 'apple_watch', 'garmin', 'samsung', 'mi_band', 'amazfit'
  device_brand text NOT NULL,
  device_name text,
  connection_status text DEFAULT 'connected' CHECK (connection_status IN ('connected', 'disconnected', 'syncing', 'error')),
  sync_settings jsonb DEFAULT '{
    "frequency": "real_time",
    "data_types": ["steps", "heart_rate", "calories"],
    "auto_sync": true
  }'::jsonb,
  last_sync_time timestamp with time zone DEFAULT now(),
  battery_level integer CHECK (battery_level >= 0 AND battery_level <= 100),
  sync_error text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Social sharing tracking
CREATE TABLE public.social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL CHECK (platform IN ('instagram', 'whatsapp', 'facebook', 'twitter', 'linkedin', 'tiktok')),
  content_type text NOT NULL CHECK (content_type IN ('achievement', 'milestone', 'challenge', 'streak', 'phase_advancement')),
  content_data jsonb DEFAULT '{}'::jsonb,
  engagement_metrics jsonb DEFAULT '{
    "views": 0,
    "likes": 0,
    "shares": 0,
    "comments": 0
  }'::jsonb,
  viral_tracking jsonb DEFAULT '{
    "reach": 0,
    "impressions": 0,
    "viral_coefficient": 0
  }'::jsonb,
  shared_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Email preferences for marketing automation
CREATE TABLE public.email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  subscription_status text DEFAULT 'subscribed' CHECK (subscription_status IN ('subscribed', 'unsubscribed', 'pending')),
  frequency_preference text DEFAULT 'weekly' CHECK (frequency_preference IN ('daily', 'weekly', 'monthly', 'events_only')),
  content_types jsonb DEFAULT '{
    "achievements": true,
    "health_tips": true,
    "offers": true,
    "community_updates": true,
    "challenges": true
  }'::jsonb,
  quiet_hours jsonb DEFAULT '{
    "start": "22:00",
    "end": "07:00",
    "timezone": "Asia/Kolkata"
  }'::jsonb,
  engagement_score integer DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  last_campaign_sent timestamp with time zone,
  verification_token text,
  verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Expanded achievements system
CREATE TABLE public.achievement_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  color_theme text,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert achievement categories
INSERT INTO public.achievement_categories (name, description, icon, color_theme, sort_order) VALUES
('Walking Milestones', 'Step counting achievements', '👣', 'sky-blue', 1),
('Streak Master', 'Consecutive day achievements', '🔥', 'golden', 2),
('Phase Progression', 'Tier advancement achievements', '📈', 'gradient', 3),
('Social Connector', 'Community and sharing achievements', '🤝', 'social', 4),
('Wellness Warrior', 'Health and fitness achievements', '💪', 'health', 5),
('Treasure Hunter', 'Earning and collection achievements', '💰', 'treasure', 6),
('Explorer', 'Location and discovery achievements', '🗺️', 'exploration', 7),
('Time Master', 'Time-based challenges', '⏰', 'time', 8);

-- Enhanced achievement definitions
CREATE TABLE public.achievement_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.achievement_categories(id) ON DELETE CASCADE,
  achievement_type text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  emoji text NOT NULL,
  requirement jsonb NOT NULL, -- Flexible requirement structure
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  reward_coins integer DEFAULT 0,
  motivational_quote text,
  unlock_celebration jsonb DEFAULT '{
    "confetti": true,
    "sound": "achievement",
    "animation": "bounce"
  }'::jsonb,
  is_hidden boolean DEFAULT false, -- Secret achievements
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Theme customization preferences
CREATE TABLE public.customization_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme_settings jsonb DEFAULT '{
    "theme_name": "sky_blue",
    "accent_color": "golden",
    "dark_mode": false,
    "high_contrast": false
  }'::jsonb,
  layout_preferences jsonb DEFAULT '{
    "dashboard_widgets": ["steps", "coins", "streak", "phase"],
    "card_layout": "grid",
    "compact_mode": false
  }'::jsonb,
  notification_config jsonb DEFAULT '{
    "sound_enabled": true,
    "vibration_enabled": true,
    "quiet_hours": {"start": "22:00", "end": "07:00"},
    "achievement_notifications": true,
    "milestone_notifications": true
  }'::jsonb,
  accessibility_settings jsonb DEFAULT '{
    "font_size": "normal",
    "animation_reduced": false,
    "high_contrast": false,
    "screen_reader": false
  }'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Affiliate and partnership tracking
CREATE TABLE public.affiliate_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id uuid DEFAULT gen_random_uuid() UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id text NOT NULL, -- Partner identifier
  partner_name text NOT NULL,
  campaign_name text,
  source_url text,
  referrer_url text,
  clicked_at timestamp with time zone DEFAULT now(),
  conversion_data jsonb DEFAULT '{
    "converted": false,
    "conversion_type": null,
    "conversion_value": 0,
    "commission_rate": 0
  }'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Analytics and reporting
CREATE TABLE public.integration_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  integration_type text NOT NULL, -- 'wearable', 'social', 'email', 'affiliate'
  metrics jsonb DEFAULT '{}'::jsonb,
  performance_data jsonb DEFAULT '{}'::jsonb,
  user_engagement jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.connected_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for connected devices
CREATE POLICY "Users can manage their own devices" ON public.connected_devices
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for social shares
CREATE POLICY "Users can manage their own shares" ON public.social_shares
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for email preferences
CREATE POLICY "Users can manage their own email preferences" ON public.email_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for achievement categories (read-only for users)
CREATE POLICY "Anyone can view achievement categories" ON public.achievement_categories
  FOR SELECT USING (true);

-- RLS policies for achievement definitions (read-only for users)
CREATE POLICY "Anyone can view achievement definitions" ON public.achievement_definitions
  FOR SELECT USING (true);

-- RLS policies for customization preferences
CREATE POLICY "Users can manage their own customization" ON public.customization_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for affiliate tracking
CREATE POLICY "Users can view their own affiliate data" ON public.affiliate_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can track affiliate clicks" ON public.affiliate_tracking
  FOR INSERT WITH CHECK (true);

-- RLS policies for integration analytics (admin only)
CREATE POLICY "Admin can manage analytics" ON public.integration_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Triggers for updated_at columns
CREATE TRIGGER update_connected_devices_updated_at
  BEFORE UPDATE ON public.connected_devices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_achievement_definitions_updated_at
  BEFORE UPDATE ON public.achievement_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customization_preferences_updated_at
  BEFORE UPDATE ON public.customization_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();