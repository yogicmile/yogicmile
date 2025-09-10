import { 
  UserProfile, 
  UserPhase, 
  DailyStepData, 
  CoinTransaction, 
  CoinBalance,
  Voucher,
  PurchasedVoucher,
  SpinWheelReward,
  SpinResult,
  Achievement,
  NavigationItem,
  AppConfig,
  LeaderboardEntry,
  WeeklyStats,
  UserInsights
} from '@/types';

// User Phases Configuration
export const USER_PHASES: UserPhase[] = [
  {
    id: 1,
    name: "Paisa Phase",
    emoji: "🟡",
    minSteps: 0,
    maxSteps: 4999,
    color: "tier-1-paisa",
    description: "Starting your fitness journey - every step counts!"
  },
  {
    id: 2,
    name: "Coin Phase", 
    emoji: "🥉",
    minSteps: 5000,
    maxSteps: 7999,
    color: "tier-2-coin",
    description: "Building momentum - you're getting stronger!"
  },
  {
    id: 3,
    name: "Token Phase",
    emoji: "🥈", 
    minSteps: 8000,
    maxSteps: 9999,
    color: "tier-3-token",
    description: "Consistent performer - keep up the great work!"
  },
  {
    id: 4,
    name: "Gem Phase",
    emoji: "💎",
    minSteps: 10000,
    maxSteps: 12499,
    color: "tier-4-gem", 
    description: "Daily goals achieved - you're a gem!"
  },
  {
    id: 5,
    name: "Diamond Phase",
    emoji: "💠",
    minSteps: 12500,
    maxSteps: 14999,
    color: "tier-5-diamond",
    description: "Exceptional dedication - diamond level commitment!"
  },
  {
    id: 6,
    name: "Crown Phase",
    emoji: "👑",
    minSteps: 15000,
    maxSteps: 17499,
    color: "tier-6-crown",
    description: "Royal performance - you wear the crown!"
  },
  {
    id: 7,
    name: "Emperor Phase",
    emoji: "🏆",
    minSteps: 17500,
    maxSteps: 19999,
    color: "tier-7-emperor",
    description: "Elite athlete status - commanding respect!"
  },
  {
    id: 8,
    name: "Legend Phase",
    emoji: "⭐",
    minSteps: 20000,
    maxSteps: 24999,
    color: "tier-8-legend",
    description: "Legendary performance - inspiring others!"
  },
  {
    id: 9,
    name: "Immortal Phase",
    emoji: "🌟",
    minSteps: 25000,
    maxSteps: 999999,
    color: "tier-9-immortal",
    description: "Immortal dedication - beyond human limits!"
  }
];

// Mock User Profile
export const MOCK_USER: UserProfile = {
  id: "user_12345",
  username: "Alex",
  email: "alex.runner@steptracker.com",
  avatarEmoji: "👟",
  joinDate: new Date("2024-01-15"),
  currentPhase: USER_PHASES[0], // Paisa Phase
  streakCount: 7,
  totalLifetimeSteps: 147892,
  achievements: [],
  preferences: {
    dailyStepGoal: 10000,
    notifications: true,
    theme: 'auto',
    hapticFeedback: true,
    soundEffects: true
  }
};

// Mock Daily Step Data (Last 7 days)
export const MOCK_DAILY_STEPS: DailyStepData[] = [
  {
    date: "2024-12-10",
    steps: 3247,
    distance: 2.4,
    calories: 156,
    activeMinutes: 28,
    coinsEarned: 32,
    goalReached: false,
    hourlyData: []
  },
  {
    date: "2024-12-09", 
    steps: 8943,
    distance: 6.7,
    calories: 428,
    activeMinutes: 67,
    coinsEarned: 89,
    goalReached: false,
    hourlyData: []
  },
  {
    date: "2024-12-08",
    steps: 12156,
    distance: 9.1,
    calories: 582,
    activeMinutes: 89,
    coinsEarned: 121,
    goalReached: true,
    hourlyData: []
  },
  {
    date: "2024-12-07",
    steps: 6789,
    distance: 5.1,
    calories: 325,
    activeMinutes: 45,
    coinsEarned: 67,
    goalReached: false,
    hourlyData: []
  },
  {
    date: "2024-12-06",
    steps: 15234,
    distance: 11.4,
    calories: 729,
    activeMinutes: 112,
    coinsEarned: 152,
    goalReached: true,
    hourlyData: []
  },
  {
    date: "2024-12-05",
    steps: 9876,
    distance: 7.4,
    calories: 472,
    activeMinutes: 73,
    coinsEarned: 98,
    goalReached: false,
    hourlyData: []
  },
  {
    date: "2024-12-04",
    steps: 11543,
    distance: 8.6,
    calories: 552,
    activeMinutes: 85,
    coinsEarned: 115,
    goalReached: true,
    hourlyData: []
  }
];

// Mock Coin Balance
export const MOCK_COIN_BALANCE: CoinBalance = {
  total: 1247,
  todayEarned: 32,
  todayRedeemed: 0,
  pendingRedemption: 0,
  lifetimeEarned: 3456,
  lifetimeRedeemed: 2209
};

// Mock Coin Transactions
export const MOCK_TRANSACTIONS: CoinTransaction[] = [
  {
    id: "tx_001",
    type: "earned",
    amount: 32,
    description: "Daily steps: 3,247 steps",
    timestamp: new Date("2024-12-10T18:30:00"),
    relatedSteps: 3247,
    sourceType: "daily_steps"
  },
  {
    id: "tx_002",
    type: "bonus",
    amount: 50,
    description: "Lucky spin bonus!",
    timestamp: new Date("2024-12-10T12:15:00"),
    sourceType: "bonus_spin"
  },
  {
    id: "tx_003",
    type: "redeemed",
    amount: -300,
    description: "Amazon Gift Card ($10)",
    timestamp: new Date("2024-12-09T16:45:00"),
    sourceType: "voucher_purchase"
  },
  {
    id: "tx_004",
    type: "earned",
    amount: 89,
    description: "Daily steps: 8,943 steps",
    timestamp: new Date("2024-12-09T19:22:00"),
    relatedSteps: 8943,
    sourceType: "daily_steps"
  },
  {
    id: "tx_005",
    type: "earned",
    amount: 100,
    description: "Achievement: First 10K day!",
    timestamp: new Date("2024-12-08T21:15:00"),
    sourceType: "achievement"
  }
];

// Mock Vouchers Store
export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: "voucher_001",
    title: "Amazon Gift Card",
    description: "$10 Amazon shopping credit",
    brand: "Amazon",
    category: "shopping",
    coinCost: 500,
    originalValue: 10,
    discountPercentage: 0,
    imageUrl: "/vouchers/amazon.png",
    expiryDays: 365,
    termsAndConditions: ["Valid for Amazon purchases only", "Non-transferable", "Expires in 1 year"],
    isPopular: true,
    isLimitedTime: false,
    stockRemaining: 127
  },
  {
    id: "voucher_002", 
    title: "Nike Store Coupon",
    description: "20% off fitness gear & apparel",
    brand: "Nike",
    category: "fitness",
    coinCost: 400,
    originalValue: 50,
    discountPercentage: 20,
    imageUrl: "/vouchers/nike.png",
    expiryDays: 90,
    termsAndConditions: ["Valid on Nike.com and select stores", "Minimum $50 purchase", "Cannot combine with other offers"],
    isPopular: true,
    isLimitedTime: true,
    stockRemaining: 45
  },
  {
    id: "voucher_003",
    title: "Starbucks Gift Card", 
    description: "$5 coffee & treats",
    brand: "Starbucks",
    category: "food",
    coinCost: 250,
    originalValue: 5,
    discountPercentage: 0,
    imageUrl: "/vouchers/starbucks.png",
    expiryDays: 180,
    termsAndConditions: ["Valid at participating locations", "Non-refundable", "Check balance online"],
    isPopular: false,
    isLimitedTime: false,
    stockRemaining: 89
  },
  {
    id: "voucher_004",
    title: "Spotify Premium",
    description: "3 months music streaming", 
    brand: "Spotify",
    category: "entertainment",
    coinCost: 750,
    originalValue: 30,
    discountPercentage: 0,
    imageUrl: "/vouchers/spotify.png",
    expiryDays: 30,
    termsAndConditions: ["New subscribers only", "Auto-renewal after trial", "Cancel anytime"],
    isPopular: true,
    isLimitedTime: true,
    stockRemaining: 23
  },
  {
    id: "voucher_005",
    title: "Local Gym Pass",
    description: "Week-long gym access",
    brand: "FitZone Gym", 
    category: "fitness",
    coinCost: 600,
    originalValue: 35,
    discountPercentage: 0,
    imageUrl: "/vouchers/gym.png",
    expiryDays: 14,
    termsAndConditions: ["Valid at FitZone locations", "Must show ID", "7 consecutive days"],
    isPopular: false,
    isLimitedTime: false,
    stockRemaining: 12
  },
  {
    id: "voucher_006",
    title: "MoviePass Ticket",
    description: "One movie theater ticket",
    brand: "CinemaMax",
    category: "entertainment", 
    coinCost: 350,
    originalValue: 15,
    discountPercentage: 0,
    imageUrl: "/vouchers/movie.png",
    expiryDays: 60,
    termsAndConditions: ["Valid for regular screenings", "Exclude 3D/IMAX", "Subject to availability"],
    isPopular: false,
    isLimitedTime: false,
    stockRemaining: 67
  }
];

// Mock Spin Wheel Rewards
export const MOCK_SPIN_REWARDS: SpinWheelReward[] = [
  {
    id: "spin_001",
    type: "coins",
    value: 10,
    label: "10 Coins",
    probability: 0.3,
    color: "#FFD700",
    emoji: "🪙"
  },
  {
    id: "spin_002", 
    type: "coins",
    value: 25,
    label: "25 Coins",
    probability: 0.25,
    color: "#FF6B35",
    emoji: "💰"
  },
  {
    id: "spin_003",
    type: "coins", 
    value: 50,
    label: "50 Coins",
    probability: 0.15,
    color: "#6A4C93", 
    emoji: "💎"
  },
  {
    id: "spin_004",
    type: "coins",
    value: 100,
    label: "100 Coins!",
    probability: 0.1,
    color: "#FF0080",
    emoji: "🎉"
  },
  {
    id: "spin_005",
    type: "multiplier",
    value: 2,
    label: "2x Steps",
    probability: 0.1,
    color: "#00D9FF", 
    emoji: "⚡"
  },
  {
    id: "spin_006",
    type: "steps_bonus",
    value: 1000,
    label: "+1K Steps",
    probability: 0.08,
    color: "#4ECDC4",
    emoji: "👟"
  },
  {
    id: "spin_007", 
    type: "coins",
    value: 0,
    label: "Try Again",
    probability: 0.02,
    color: "#95A5A6",
    emoji: "😔"
  }
];

// Mock Achievements
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach_001",
    title: "First Steps",
    description: "Complete your first day of step tracking",
    emoji: "👶",
    category: "steps",
    requirement: {
      type: "daily_steps",
      targetValue: 1,
      timeframe: "daily"
    },
    coinReward: 50,
    isUnlocked: true,
    unlockedDate: new Date("2024-12-04"),
    progress: 100,
    rarity: "common"
  },
  {
    id: "ach_002", 
    title: "10K Champion",
    description: "Reach 10,000 steps in a single day",
    emoji: "🏆",
    category: "steps", 
    requirement: {
      type: "daily_steps",
      targetValue: 10000,
      timeframe: "daily"
    },
    coinReward: 100,
    isUnlocked: true,
    unlockedDate: new Date("2024-12-08"),
    progress: 100,
    rarity: "rare"
  },
  {
    id: "ach_003",
    title: "Week Warrior", 
    description: "Maintain a 7-day step streak",
    emoji: "🔥",
    category: "streak",
    requirement: {
      type: "streak_days", 
      targetValue: 7,
      timeframe: "lifetime"
    },
    coinReward: 150,
    isUnlocked: true,
    unlockedDate: new Date("2024-12-10"),
    progress: 100,
    rarity: "epic"
  },
  {
    id: "ach_004",
    title: "Marathon Walker",
    description: "Walk 42.2 kilometers total",
    emoji: "🏃‍♀️", 
    category: "distance",
    requirement: {
      type: "total_distance",
      targetValue: 42.2,
      timeframe: "lifetime"
    },
    coinReward: 200,
    isUnlocked: false,
    progress: 78,
    rarity: "epic"
  },
  {
    id: "ach_005",
    title: "Coin Collector",
    description: "Earn 1,000 coins total",
    emoji: "💰",
    category: "coins",
    requirement: {
      type: "coins_earned",
      targetValue: 1000,
      timeframe: "lifetime"  
    },
    coinReward: 100,
    isUnlocked: true,
    unlockedDate: new Date("2024-12-09"),
    progress: 100,
    rarity: "rare"
  },
  {
    id: "ach_006",
    title: "Legendary Status",
    description: "Reach 100,000 lifetime steps",
    emoji: "⭐",
    category: "steps",
    requirement: {
      type: "total_steps",
      targetValue: 100000,
      timeframe: "lifetime"
    },
    coinReward: 500,
    isUnlocked: true,
    unlockedDate: new Date("2024-12-05"),
    progress: 100,
    rarity: "legendary"
  }
];

// Mock Leaderboard
export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    userId: "user_001",
    username: "RunnerMike",
    avatarEmoji: "🏃‍♂️",
    steps: 18743,
    rank: 1,
    streakDays: 23,
    isCurrentUser: false
  },
  {
    userId: "user_002", 
    username: "FitSarah",
    avatarEmoji: "🚶‍♀️",
    steps: 16254,
    rank: 2,
    streakDays: 18,
    isCurrentUser: false
  },
  {
    userId: "user_12345",
    username: "Alex",
    avatarEmoji: "👟", 
    steps: 3247,
    rank: 847,
    streakDays: 7,
    isCurrentUser: true
  },
  {
    userId: "user_003",
    username: "WalkingTom",
    avatarEmoji: "🚶‍♂️",
    steps: 12891,
    rank: 3,
    streakDays: 15,
    isCurrentUser: false
  },
  {
    userId: "user_004",
    username: "SpeedyLisa", 
    avatarEmoji: "💨",
    steps: 11456,
    rank: 4,
    streakDays: 12,
    isCurrentUser: false
  }
];

// Mock Weekly Stats
export const MOCK_WEEKLY_STATS: WeeklyStats = {
  weekStartDate: "2024-12-04",
  totalSteps: 67788,
  averageSteps: 9684,
  totalDistance: 50.7,
  totalCalories: 3244,
  daysGoalReached: 3,
  totalCoinsEarned: 674
};

// Mock User Insights  
export const MOCK_USER_INSIGHTS: UserInsights = {
  weeklyTrend: 'stable',
  bestDayOfWeek: 'Saturday',
  averageStepsPerHour: 428,
  mostActiveTimeRange: '6:00 PM - 8:00 PM',
  consistencyScore: 73,
  recommendations: [
    "Try taking a walk during your lunch break to boost afternoon activity",
    "You're most active on weekends - maintain that energy on weekdays!",
    "Consider setting hourly reminders to reach 500 steps per hour"
  ]
};

// App Configuration
export const APP_CONFIG: AppConfig = {
  phases: USER_PHASES,
  spinWheelRewards: MOCK_SPIN_REWARDS,
  dailyResetTime: "23:59",
  maxDailySpins: 3,
  coinToStepRatio: 0.01, // 1 coin per 100 steps
  achievementList: MOCK_ACHIEVEMENTS
};