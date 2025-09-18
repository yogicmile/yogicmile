-- Community Features Database Schema
-- Create comprehensive database structure for all community features

-- User Profiles Table
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT CHECK (length(bio) <= 150),
  profile_picture_url TEXT,
  location_city TEXT,
  location_state TEXT,
  stats_visible BOOLEAN DEFAULT true,
  activity_visible BOOLEAN DEFAULT true,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends_only', 'private')),
  community_activity_score INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Friendships Table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  request_message TEXT CHECK (length(request_message) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Leaderboards Table
CREATE TABLE public.leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'all_time')),
  category TEXT NOT NULL CHECK (category IN ('global', 'friends', 'local')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank_position INTEGER NOT NULL,
  steps INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  weeks_active INTEGER DEFAULT 0,
  location_filter TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(period, category, user_id, location_filter)
);

-- Group Challenges Table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) <= 100),
  description TEXT CHECK (length(description) <= 500),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('total_steps', 'daily_average', 'streak', 'distance')),
  target_value BIGINT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_limit INTEGER DEFAULT 50 CHECK (participant_limit >= 5 AND participant_limit <= 50),
  privacy_setting TEXT DEFAULT 'public' CHECK (privacy_setting IN ('public', 'invite_only')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  group_chat_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (end_date > start_date)
);

-- Challenge Participants Table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_contribution BIGINT DEFAULT 0,
  rank_position INTEGER,
  is_admin BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'left')),
  UNIQUE(challenge_id, user_id)
);

-- Messages Table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID, -- References challenges for group chats
  message_text TEXT NOT NULL CHECK (length(message_text) <= 2000),
  message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'group')),
  read_status BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (
    (message_type = 'direct' AND recipient_id IS NOT NULL AND group_id IS NULL) OR
    (message_type = 'group' AND group_id IS NOT NULL AND recipient_id IS NULL)
  )
);

-- Forum Posts Table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('health_tips', 'walking_routes', 'rewards_sharing', 'challenges_goals')),
  title TEXT NOT NULL CHECK (length(title) <= 100),
  content TEXT NOT NULL CHECK (length(content) <= 2000),
  image_urls TEXT[], -- Array of up to 3 image URLs
  tags TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'moderated', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CHECK (array_length(image_urls, 1) <= 3 OR image_urls IS NULL)
);

-- Forum Comments Table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  parent_comment_id UUID REFERENCES public.forum_comments(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'moderated', 'removed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Post/Comment Votes Table
CREATE TABLE public.content_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id, content_type)
);

-- Content Bookmarks Table
CREATE TABLE public.content_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, content_id, content_type)
);

-- Moderation Reports Table
CREATE TABLE public.moderation_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'message', 'profile')),
  report_reason TEXT NOT NULL CHECK (report_reason IN ('inappropriate', 'harassment', 'spam', 'cheating', 'other')),
  report_details TEXT CHECK (length(report_details) <= 500),
  admin_action TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Community Achievements Table
CREATE TABLE public.community_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('social_butterfly', 'helpful_contributor', 'challenge_champion', 'forum_expert', 'friend_magnet')),
  achievement_name TEXT NOT NULL,
  description TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  coins_awarded INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Community Activity Feed Table
CREATE TABLE public.activity_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('achievement', 'challenge_join', 'challenge_complete', 'friend_add', 'post_create', 'post_upvote')),
  activity_data JSONB DEFAULT '{}',
  visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User Profiles
CREATE POLICY "Users can view public profiles and their own"
  ON public.user_profiles FOR SELECT
  USING (
    profile_visibility = 'public' OR 
    auth.uid() = user_id OR
    (profile_visibility = 'friends_only' AND EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE ((requester_id = auth.uid() AND addressee_id = user_id) OR 
             (requester_id = user_id AND addressee_id = auth.uid())) 
      AND status = 'accepted'
    ))
  );

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Friendships
CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendship status"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

-- RLS Policies for Leaderboards
CREATE POLICY "Authenticated users can view leaderboards"
  ON public.leaderboards FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage leaderboards"
  ON public.leaderboards FOR ALL
  USING (true);

-- RLS Policies for Challenges
CREATE POLICY "Users can view public challenges and their own"
  ON public.challenges FOR SELECT
  USING (
    privacy_setting = 'public' OR 
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM public.challenge_participants WHERE challenge_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Challenge creators can update their challenges"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS Policies for Challenge Participants
CREATE POLICY "Users can view challenge participants"
  ON public.challenge_participants FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.challenges WHERE id = challenge_id AND (privacy_setting = 'public' OR creator_id = auth.uid())) OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can join challenges"
  ON public.challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON public.challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for Messages
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id OR
    (message_type = 'group' AND EXISTS (
      SELECT 1 FROM public.challenge_participants 
      WHERE challenge_id = group_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = recipient_id); -- For read status

-- RLS Policies for Forum Posts
CREATE POLICY "Anyone can view published forum posts"
  ON public.forum_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can create forum posts"
  ON public.forum_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON public.forum_posts FOR UPDATE
  USING (auth.uid() = author_id);

-- RLS Policies for Forum Comments
CREATE POLICY "Anyone can view published comments"
  ON public.forum_comments FOR SELECT
  USING (status = 'published');

CREATE POLICY "Users can create comments"
  ON public.forum_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
  ON public.forum_comments FOR UPDATE
  USING (auth.uid() = author_id);

-- RLS Policies for Content Votes
CREATE POLICY "Users can manage their own votes"
  ON public.content_votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Content Bookmarks
CREATE POLICY "Users can manage their own bookmarks"
  ON public.content_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Moderation Reports
CREATE POLICY "Users can create reports"
  ON public.moderation_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.moderation_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- RLS Policies for Community Achievements
CREATE POLICY "Users can view their own achievements"
  ON public.community_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage achievements"
  ON public.community_achievements FOR ALL
  USING (true);

-- RLS Policies for Activity Feed
CREATE POLICY "Users can view activity based on visibility"
  ON public.activity_feed FOR SELECT
  USING (
    visibility = 'public' OR
    auth.uid() = user_id OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE ((requester_id = auth.uid() AND addressee_id = user_id) OR 
             (requester_id = user_id AND addressee_id = auth.uid())) 
      AND status = 'accepted'
    ))
  );

CREATE POLICY "Users can create their own activity"
  ON public.activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_display_name ON public.user_profiles(display_name);
CREATE INDEX idx_friendships_users ON public.friendships(requester_id, addressee_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);
CREATE INDEX idx_leaderboards_period_category ON public.leaderboards(period, category);
CREATE INDEX idx_challenges_status ON public.challenges(status);
CREATE INDEX idx_challenge_participants_challenge ON public.challenge_participants(challenge_id);
CREATE INDEX idx_messages_sender_recipient ON public.messages(sender_id, recipient_id);
CREATE INDEX idx_messages_group ON public.messages(group_id);
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_posts_created_at ON public.forum_posts(created_at DESC);
CREATE INDEX idx_forum_comments_post ON public.forum_comments(post_id);
CREATE INDEX idx_content_votes_content ON public.content_votes(content_id, content_type);
CREATE INDEX idx_activity_feed_user_created ON public.activity_feed(user_id, created_at DESC);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_forum_comments_updated_at BEFORE UPDATE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_community()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Yogic Walker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created_community
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_community();

-- Create function to update post comment counts
CREATE OR REPLACE FUNCTION public.update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count_trigger
  AFTER INSERT OR DELETE ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comment_count();