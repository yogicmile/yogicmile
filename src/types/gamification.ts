export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlock_criteria: Record<string, any>;
  icon_url?: string;
  animation_type: string;
  coin_reward: number;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_date: string;
  progress_percentage: number;
  shared_count: number;
  celebration_viewed: boolean;
  achievement?: Achievement;
}

export interface SeasonalChallenge {
  id: string;
  name: string;
  theme: string;
  description?: string;
  start_date: string;
  end_date: string;
  goal_target: number;
  participant_count: number;
  exclusive_badge_id?: string;
  reward_description?: string;
  background_color: string;
  status: string;
  created_at: string;
}

export interface SeasonalChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_date: string;
  progress: number;
  completed: boolean;
  completion_date?: string;
  challenge?: SeasonalChallenge;
}

export interface Collectible {
  id: string;
  name: string;
  description?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlock_criteria: Record<string, any>;
  design_url?: string;
  animation_type: string;
  collection_series?: string;
  awarded_count: number;
  created_at: string;
}

export interface UserCollectible {
  id: string;
  user_id: string;
  collectible_id: string;
  earned_date: string;
  milestone_value?: number;
  shared_count: number;
  collectible?: Collectible;
}

export interface MilestonePhoto {
  id: string;
  user_id: string;
  achievement_id?: string;
  photo_url: string;
  upload_date: string;
  milestone_type: string;
  milestone_value?: number;
  celebration_viewed: boolean;
  shared_count: number;
  caption?: string;
  achievement?: Achievement;
}

export interface GamificationSettings {
  id: string;
  user_id: string;
  animation_enabled: boolean;
  celebration_style: 'full' | 'minimal' | 'off';
  sharing_preferences: {
    internal: boolean;
    external: boolean;
  };
  reduced_motion: boolean;
  notification_preferences: {
    achievements: boolean;
    milestones: boolean;
    challenges: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  steps_completed: string[];
  current_step: string;
  completed: boolean;
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

export const ACHIEVEMENT_CATEGORIES = {
  step_milestones: {
    name: 'Step Milestones',
    description: 'Achievements for reaching step goals',
    icon: '🚶',
    color: 'hsl(var(--primary))'
  },
  streak_champions: {
    name: 'Streak Champions',
    description: 'Achievements for maintaining walking streaks',
    icon: '🔥',
    color: 'hsl(var(--destructive))'
  },
  coin_masters: {
    name: 'Coin Masters',
    description: 'Achievements for earning coins',
    icon: '💰',
    color: 'hsl(var(--warning))'
  },
  community_heroes: {
    name: 'Community Heroes',
    description: 'Achievements for community participation',
    icon: '👥',
    color: 'hsl(var(--success))'
  },
  challenge_winners: {
    name: 'Challenge Winners',
    description: 'Achievements for completing challenges',
    icon: '🎯',
    color: 'hsl(var(--secondary))'
  },
  onboarding: {
    name: 'First Steps',
    description: 'Achievements for getting started',
    icon: '🎉',
    color: 'hsl(var(--accent))'
  }
} as const;

export const RARITY_STYLES = {
  common: {
    name: 'Common',
    background: 'from-slate-400 to-slate-500',
    glow: 'shadow-slate-500/20',
    border: 'border-slate-500/30'
  },
  uncommon: {
    name: 'Uncommon',
    background: 'from-green-400 to-green-500',
    glow: 'shadow-green-500/20',
    border: 'border-green-500/30'
  },
  rare: {
    name: 'Rare',
    background: 'from-blue-400 to-blue-500',
    glow: 'shadow-blue-500/20',
    border: 'border-blue-500/30'
  },
  epic: {
    name: 'Epic',
    background: 'from-purple-400 to-purple-500',
    glow: 'shadow-purple-500/20',
    border: 'border-purple-500/30'
  },
  legendary: {
    name: 'Legendary',
    background: 'from-gradient-start to-gradient-end',
    glow: 'shadow-primary/20',
    border: 'border-primary/30'
  }
} as const;

export const SEASONAL_THEMES = {
  monsoon: {
    name: 'Monsoon',
    colors: ['#4A90E2', '#357ABD'],
    icon: '🌧️',
    background: 'from-blue-400 to-blue-600'
  },
  festive: {
    name: 'Festive',
    colors: ['#FF6B35', '#E55A2B'],
    icon: '🪔',
    background: 'from-orange-400 to-red-500'
  },
  mindfulness: {
    name: 'Mindfulness',
    colors: ['#8B5A3C', '#6D4430'],
    icon: '🧘',
    background: 'from-amber-600 to-orange-700'
  },
  winter: {
    name: 'Winter',
    colors: ['#2196F3', '#1976D2'],
    icon: '❄️',
    background: 'from-blue-500 to-indigo-600'
  }
} as const;