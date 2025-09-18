// Community Feature Types
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  profile_picture_url?: string;
  location_city?: string;
  location_state?: string;
  stats_visible: boolean;
  activity_visible: boolean;
  profile_visibility: 'public' | 'friends_only' | 'private';
  community_activity_score: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  request_message?: string;
  created_at: string;
  accepted_at?: string;
}

export interface FriendshipWithProfile extends Friendship {
  requester_profile?: UserProfile;
  addressee_profile?: UserProfile;
}

export interface LeaderboardEntry {
  id: string;
  period: 'weekly' | 'monthly' | 'all_time';
  category: 'global' | 'friends' | 'local';
  user_id: string;
  rank_position: number;
  steps: number;
  coins_earned: number;
  weeks_active: number;
  location_filter?: string;
  user_profile?: UserProfile;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  goal_type: 'total_steps' | 'daily_average' | 'streak' | 'distance';
  target_value: number;
  start_date: string;
  end_date: string;
  creator_id: string;
  participant_limit: number;
  privacy_setting: 'public' | 'invite_only';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  group_chat_id?: string;
  created_at: string;
  updated_at: string;
  creator_profile?: UserProfile;
  participants?: ChallengeParticipant[];
  participant_count?: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_date: string;
  current_contribution: number;
  rank_position?: number;
  is_admin: boolean;
  status: 'active' | 'completed' | 'left';
  user_profile?: UserProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  group_id?: string;
  message_text: string;
  message_type: 'direct' | 'group';
  read_status: boolean;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  sender_profile?: UserProfile;
  recipient_profile?: UserProfile;
}

export interface ForumPost {
  id: string;
  author_id: string;
  category: 'health_tips' | 'walking_routes' | 'rewards_sharing' | 'challenges_goals';
  title: string;
  content: string;
  image_urls?: string[];
  tags: string[];
  upvotes: number;
  downvotes: number;
  comments_count: number;
  is_pinned: boolean;
  is_featured: boolean;
  status: 'draft' | 'published' | 'moderated' | 'removed';
  created_at: string;
  updated_at: string;
  author_profile?: UserProfile;
  user_vote?: 'upvote' | 'downvote';
  is_bookmarked?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string;
  upvotes: number;
  downvotes: number;
  status: 'published' | 'moderated' | 'removed';
  created_at: string;
  updated_at: string;
  author_profile?: UserProfile;
  user_vote?: 'upvote' | 'downvote';
  replies?: ForumComment[];
}

export interface ContentVote {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'post' | 'comment';
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface ContentBookmark {
  id: string;
  user_id: string;
  content_id: string;
  content_type: 'post' | 'comment';
  created_at: string;
}

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reported_content_id: string;
  content_type: 'post' | 'comment' | 'message' | 'profile';
  report_reason: 'inappropriate' | 'harassment' | 'spam' | 'cheating' | 'other';
  report_details?: string;
  admin_action?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  reviewed_by?: string;
  created_at: string;
  resolved_at?: string;
}

export interface CommunityAchievement {
  id: string;
  user_id: string;
  achievement_type: 'social_butterfly' | 'helpful_contributor' | 'challenge_champion' | 'forum_expert' | 'friend_magnet';
  achievement_name: string;
  description: string;
  badge_icon: string;
  coins_awarded: number;
  unlocked_at: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  activity_type: 'achievement' | 'challenge_join' | 'challenge_complete' | 'friend_add' | 'post_create' | 'post_upvote';
  activity_data: Record<string, any>;
  visibility: 'public' | 'friends' | 'private';
  created_at: string;
  user_profile?: UserProfile;
}

export interface CommunityStats {
  total_users: number;
  active_challenges: number;
  total_posts: number;
  total_friendships: number;
  weekly_new_users: number;
  top_contributors: UserProfile[];
}

// Forum category configuration
export const FORUM_CATEGORIES = {
  health_tips: {
    id: 'health_tips',
    name: 'Health Tips',
    description: 'Wellness advice, nutrition, and fitness tips',
    icon: '🏥',
    color: 'text-green-600'
  },
  walking_routes: {
    id: 'walking_routes',
    name: 'Walking Routes',
    description: 'Local paths, scenic routes, and safety tips',
    icon: '🗺️',
    color: 'text-blue-600'
  },
  rewards_sharing: {
    id: 'rewards_sharing',
    name: 'Rewards Sharing',
    description: 'Redemption experiences and deal alerts',
    icon: '🎁',
    color: 'text-purple-600'
  },
  challenges_goals: {
    id: 'challenges_goals',
    name: 'Challenges & Goals',
    description: 'Personal goals, motivation, and success stories',
    icon: '🎯',
    color: 'text-orange-600'
  }
} as const;

export type ForumCategory = keyof typeof FORUM_CATEGORIES;