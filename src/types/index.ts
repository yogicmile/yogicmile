// User Profile and Authentication
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarEmoji: string;
  joinDate: Date;
  currentPhase: UserPhase;
  streakCount: number;
  totalLifetimeSteps: number;
  achievements: Achievement[];
  preferences: UserPreferences;
}

export interface UserPhase {
  id: number;
  name: string;
  emoji: string;
  minSteps: number;
  maxSteps: number;
  color: string;
  description: string;
}

export interface UserPreferences {
  dailyStepGoal: number;
  notifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  hapticFeedback: boolean;
  soundEffects: boolean;
}

// Step Tracking and Progress
export interface DailyStepData {
  date: string; // YYYY-MM-DD format
  steps: number;
  distance: number; // in kilometers
  calories: number;
  activeMinutes: number;
  coinsEarned: number;
  goalReached: boolean;
  hourlyData: HourlyStepData[];
}

export interface HourlyStepData {
  hour: number; // 0-23
  steps: number;
  timestamp: Date;
}

export interface WeeklyStats {
  weekStartDate: string;
  totalSteps: number;
  averageSteps: number;
  totalDistance: number;
  totalCalories: number;
  daysGoalReached: number;
  totalCoinsEarned: number;
}

// Coins and Rewards System
export interface CoinTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'penalty';
  amount: number;
  description: string;
  timestamp: Date;
  relatedSteps?: number;
  sourceType: 'daily_steps' | 'bonus_spin' | 'achievement' | 'voucher_purchase' | 'manual';
}

export interface CoinBalance {
  total: number;
  todayEarned: number;
  todayRedeemed: number;
  pendingRedemption: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
}

// Vouchers and Rewards Store
export interface Voucher {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: VoucherCategory;
  coinCost: number;
  originalValue: number;
  discountPercentage: number;
  imageUrl: string;
  expiryDays: number;
  termsAndConditions: string[];
  isPopular: boolean;
  isLimitedTime: boolean;
  stockRemaining?: number;
}

export type VoucherCategory = 'fitness' | 'food' | 'entertainment' | 'shopping' | 'travel' | 'technology';

export interface PurchasedVoucher {
  id: string;
  voucherId: string;
  purchaseDate: Date;
  expiryDate: Date;
  redemptionCode: string;
  status: 'active' | 'used' | 'expired';
  usedDate?: Date;
}

// Spin Wheel System
export interface SpinWheelReward {
  id: string;
  type: 'coins' | 'voucher' | 'multiplier' | 'steps_bonus';
  value: number;
  label: string;
  probability: number; // 0-1
  color: string;
  emoji: string;
}

export interface SpinResult {
  id: string;
  userId: string;
  timestamp: Date;
  rewardWon: SpinWheelReward;
  coinsBefore: number;
  coinsAfter: number;
}

// Achievements and Milestones
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  coinReward: number;
  isUnlocked: boolean;
  unlockedDate?: Date;
  progress: number; // 0-100
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export type AchievementCategory = 'steps' | 'streak' | 'distance' | 'coins' | 'social' | 'special';

export interface AchievementRequirement {
  type: 'total_steps' | 'daily_steps' | 'streak_days' | 'total_distance' | 'coins_earned' | 'vouchers_redeemed';
  targetValue: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'lifetime';
}

// Navigation and App State
export interface NavigationItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  hasNotification: boolean;
  notificationCount?: number;
  notificationText?: string;
  isEnabled: boolean;
  quickActions: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: () => void;
  emoji: string;
}

// App Settings and Configuration
export interface AppConfig {
  phases: UserPhase[];
  spinWheelRewards: SpinWheelReward[];
  dailyResetTime: string; // "23:59"
  maxDailySpins: number;
  coinToStepRatio: number; // coins per 1000 steps
  achievementList: Achievement[];
}

// API Response Types
export interface StepTrackingResponse {
  success: boolean;
  data: DailyStepData;
  message?: string;
}

export interface CoinRedemptionResponse {
  success: boolean;
  newBalance: CoinBalance;
  transactionId: string;
  message?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarEmoji: string;
  steps: number;
  rank: number;
  streakDays: number;
  isCurrentUser: boolean;
}

// Analytics and Insights
export interface UserInsights {
  weeklyTrend: 'improving' | 'declining' | 'stable';
  bestDayOfWeek: string;
  averageStepsPerHour: number;
  mostActiveTimeRange: string;
  consistencyScore: number; // 0-100
  recommendations: string[];
}