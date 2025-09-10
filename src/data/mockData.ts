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

// Mock User Profile - Alex Walker
export const mockUser = {
  id: 'user123',
  displayName: 'Alex Walker',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  currentTier: 1,
  tierName: 'Paisa Phase',
  tierSymbol: '🟡',
  tierColor: '#FFC107',
  joinDate: '2025-09-01',
  streakDays: 5,
  totalLifetimeSteps: 125000,
  dailyGoal: 8000
};

// Mock Daily Progress
export const mockDailyProgress = {
  date: '2025-09-10',
  currentSteps: 3542,
  dailyGoal: 8000,
  distance: 2.8, // km
  calories: 142,
  activeMinutes: 35,
  coinsEarnedToday: 35,
  coinsRedeemedToday: 0,
  sessionsToday: 2
};

// Tier Progress Data
export const tierProgressData = {
  currentTier: 1,
  currentTierSteps: 45000,
  tierTarget: 200000,
  tierStartDate: '2025-09-01',
  tierDeadline: '2025-10-01',
  daysRemaining: 21,
  nextTierPreview: {
    tier: 2,
    name: 'Coin Phase',
    symbol: '🪙',
    requirement: '300K steps in 45 days',
    reward: '2 paisa per 100 steps'
  }
};

// Navigation Sections Content
export const navigationSections = {
  coinsEarned: {
    title: 'Daily Earnings',
    icon: '📊',
    badge: null,
    mockData: [
      { date: '2025-09-10', steps: 3542, coins: 35 },
      { date: '2025-09-09', steps: 7200, coins: 72 },
      { date: '2025-09-08', steps: 5800, coins: 58 },
      { date: '2025-09-07', steps: 6400, coins: 64 },
      { date: '2025-09-06', steps: 4200, coins: 42 },
      { date: '2025-09-05', steps: 8100, coins: 81 },
      { date: '2025-09-04', steps: 5900, coins: 59 }
    ]
  },
  vouchersStore: {
    title: 'Rewards Store',
    icon: '🎁',
    badge: 'NEW',
    mockData: [
      { 
        id: 1, 
        title: '₹100 Amazon Voucher', 
        cost: 10000, 
        image: 'amazon-logo',
        description: 'Shop anything on Amazon',
        category: 'shopping',
        popularity: 'high',
        stock: 50
      },
      { 
        id: 2, 
        title: '₹50 Zomato Voucher', 
        cost: 5000, 
        image: 'zomato-logo',
        description: 'Order your favorite food',
        category: 'food',
        popularity: 'high',
        stock: 75
      },
      { 
        id: 3, 
        title: 'Coffee Coupon', 
        cost: 2500, 
        image: 'coffee-icon',
        description: 'Free coffee at partner cafes',
        category: 'food',
        popularity: 'medium',
        stock: 120
      },
      {
        id: 4,
        title: '₹200 Flipkart Voucher',
        cost: 20000,
        image: 'flipkart-logo',
        description: 'Electronics & more',
        category: 'shopping',
        popularity: 'high',
        stock: 25
      },
      {
        id: 5,
        title: 'Movie Ticket',
        cost: 7500,
        image: 'cinema-icon',
        description: 'Latest blockbusters',
        category: 'entertainment',
        popularity: 'medium',
        stock: 40
      }
    ]
  },
  spinWheel: {
    title: 'Lucky Spin',
    icon: '🎡',
    badge: '1',
    mockData: {
      spinsAvailable: 1,
      lastSpin: '2025-09-09',
      rewards: ['10 coins', '25 coins', '50 coins', '100 coins', 'Better luck!', '5 coins', '75 coins', 'Jackpot!'],
      wheelConfig: [
        { value: 10, label: '10 coins', probability: 0.25, color: '#FFD700' },
        { value: 25, label: '25 coins', probability: 0.20, color: '#FF6B35' },
        { value: 50, label: '50 coins', probability: 0.15, color: '#6A4C93' },
        { value: 100, label: '100 coins', probability: 0.10, color: '#FF0080' },
        { value: 5, label: '5 coins', probability: 0.15, color: '#4ECDC4' },
        { value: 75, label: '75 coins', probability: 0.08, color: '#45B7D1' },
        { value: 0, label: 'Better luck!', probability: 0.05, color: '#95A5A6' },
        { value: 500, label: 'Jackpot!', probability: 0.02, color: '#E74C3C' }
      ]
    }
  },
  wallet: {
    title: 'My Wallet',
    icon: '💰',
    badge: null,
    mockData: {
      totalBalance: 1247,
      thisWeekEarnings: 198,
      pendingRedemptions: 2,
      transactionHistory: [
        { type: 'earned', amount: 35, date: '2025-09-10', source: 'Daily Steps', steps: 3542 },
        { type: 'redeemed', amount: -100, date: '2025-09-09', item: 'Coffee Coupon' },
        { type: 'earned', amount: 72, date: '2025-09-09', source: 'Daily Steps', steps: 7200 },
        { type: 'bonus', amount: 50, date: '2025-09-08', source: 'Lucky Spin' },
        { type: 'earned', amount: 58, date: '2025-09-08', source: 'Daily Steps', steps: 5800 },
        { type: 'earned', amount: 64, date: '2025-09-07', source: 'Daily Steps', steps: 6400 },
        { type: 'redeemed', amount: -250, date: '2025-09-06', item: 'Zomato Voucher' },
        { type: 'earned', amount: 42, date: '2025-09-06', source: 'Daily Steps', steps: 4200 }
      ]
    }
  }
};

// Ad Content Mock
export const adContent = [
  {
    slot: 'header',
    type: 'banner',
    content: {
      text: '🏃‍♂️ Nike Running Shoes - Special Offer!',
      background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
      cta: 'Shop Now',
      discount: '30% OFF',
      urgency: 'Limited Time'
    }
  },
  {
    slot: 'inline',
    type: 'card',
    content: {
      title: 'Boost Your Walking',
      subtitle: 'Premium fitness tracker',
      image: 'fitness-tracker-icon',
      background: 'linear-gradient(45deg, #4ECDC4, #6ED2C8)',
      cta: 'Learn More',
      rating: '4.8★',
      price: '₹2,999'
    }
  },
  {
    slot: 'inline',
    type: 'native',
    content: {
      title: 'Protein Supplements',
      subtitle: 'Fuel your fitness journey',
      image: 'protein-icon',
      background: 'linear-gradient(45deg, #A8E6CF, #88D8A3)',
      cta: 'Browse',
      brand: 'FitLife',
      offer: 'Buy 2 Get 1 Free'
    }
  }
];

// Countdown Timer Logic
export const countdownTimer = {
  targetTime: '23:59:59',
  currentTime: 'real-time',
  urgencyThresholds: {
    orange: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    red: 30 * 60 * 1000, // 30 minutes
    flash: 5 * 60 * 1000 // 5 minutes
  },
  resetMessage: 'Coins reset at midnight! 🌙',
  expiredMessage: 'TIME\'S UP! Coins have reset 🔄',
  warningMessages: {
    2: 'Only 2 hours left! ⚠️',
    1: 'Last hour! Don\'t miss out! 🚨',
    0.5: 'Final 30 minutes! ⏰',
    0.08: 'Last 5 minutes! Hurry! 🏃‍♂️'
  }
};

// Celebration Animations Configuration
export const celebrationAnimations = {
  dailyGoalAchieved: {
    type: 'confetti',
    colors: ['#FFC107', '#FF6B35', '#4ECDC4', '#6A4C93'],
    duration: 3000,
    particles: 50,
    emoji: '🎉',
    message: 'Daily Goal Achieved!'
  },
  streakMilestone: {
    type: 'fire',
    colors: ['#FF4444', '#FF6B35', '#FFD700'],
    duration: 2500,
    particles: 30,
    emoji: '🔥',
    message: 'Streak Milestone!'
  },
  coinRedemption: {
    type: 'success',
    colors: ['#4ECDC4', '#45B7D1'],
    duration: 2000,
    particles: 20,
    emoji: '✅',
    message: 'Redemption Success!'
  },
  tierProgression: {
    type: 'glow',
    colors: ['#FFD700', '#FFC107', '#FF8F00'],
    duration: 4000,
    particles: 40,
    emoji: '⭐',
    message: 'Tier Up!'
  },
  newPersonalBest: {
    type: 'sparkles',
    colors: ['#FFD700', '#FFC107', '#FF6B35'],
    duration: 3500,
    particles: 35,
    emoji: '🏆',
    message: 'New Personal Best!'
  }
};

// Extended user phases for Yogic Mile
export const yogicMilePhases = [
  {
    id: 1,
    name: "Paisa Phase",
    symbol: "🟡",
    color: "#FFC107",
    requirement: "200K steps in 30 days",
    reward: "1 paisa per 100 steps",
    description: "Begin your yogic journey with mindful steps"
  },
  {
    id: 2,
    name: "Coin Phase", 
    symbol: "🪙",
    color: "#FF8F00",
    requirement: "300K steps in 45 days",
    reward: "2 paisa per 100 steps",
    description: "Build consistency in your practice"
  },
  {
    id: 3,
    name: "Token Phase",
    symbol: "🎯",
    color: "#2196F3", 
    requirement: "500K steps in 60 days",
    reward: "3 paisa per 100 steps",
    description: "Establish deeper discipline"
  },
  {
    id: 4,
    name: "Gem Phase",
    symbol: "💎",
    color: "#00BCD4",
    requirement: "750K steps in 75 days", 
    reward: "5 paisa per 100 steps",
    description: "Cultivate inner strength"
  },
  {
    id: 5,
    name: "Diamond Phase",
    symbol: "💠",
    color: "#673AB7",
    requirement: "1M steps in 90 days",
    reward: "8 paisa per 100 steps", 
    description: "Develop unbreakable focus"
  },
  {
    id: 6,
    name: "Crown Phase",
    symbol: "👑",
    color: "#3F51B5",
    requirement: "1.5M steps in 120 days",
    reward: "12 paisa per 100 steps",
    description: "Master of self-discipline"
  },
  {
    id: 7,
    name: "Emperor Phase", 
    symbol: "🏆",
    color: "#E91E63",
    requirement: "2M steps in 150 days",
    reward: "20 paisa per 100 steps",
    description: "Transcend physical limitations"
  },
  {
    id: 8,
    name: "Legend Phase",
    symbol: "⭐",
    color: "#9C27B0", 
    requirement: "3M steps in 180 days",
    reward: "35 paisa per 100 steps",
    description: "Inspire others through example"
  },
  {
    id: 9,
    name: "Immortal Phase",
    symbol: "🌟",
    color: "#6A1B9A",
    requirement: "5M+ lifetime steps",
    reward: "50 paisa per 100 steps",
    description: "Eternal yogic dedication"
  }
];

// Weekly insights and analytics
export const weeklyInsights = {
  weekStats: {
    totalSteps: 37742,
    averageDaily: 5391,
    bestDay: { date: '2025-09-09', steps: 7200 },
    worstDay: { date: '2025-09-06', steps: 4200 },
    consistency: 73, // percentage
    improvement: '+12%' // vs last week
  },
  motivationalQuotes: [
    "Every step is a prayer in motion 🙏",
    "Walk your way to inner peace 🕊️",
    "The journey of a thousand miles begins with one step 👣",
    "Mindful walking, mindful living 🧘‍♂️"
  ],
  challenges: [
    {
      id: 1,
      title: "Morning Walker",
      description: "Take 2000 steps before 9 AM",
      progress: 60,
      reward: 100,
      timeLeft: "2 days"
    },
    {
      id: 2, 
      title: "Weekend Warrior",
      description: "Reach 10K steps on Saturday & Sunday",
      progress: 0,
      reward: 250,
      timeLeft: "4 days"
    }
  ]
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
export const APP_CONFIG = {
  phases: yogicMilePhases,
  dailyResetTime: "23:59",
  maxDailySpins: 3,
  coinToStepRatio: 0.01, // 1 paisa per 100 steps
};