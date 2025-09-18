import { useState, useEffect, useCallback } from 'react';

interface TierRate {
  tier: number;
  symbol: string;
  name: string;
  rate: number; // paisa per 25 steps
  stepRequirement: number;
  timeLimit: number;
  spiritualName: string;
}

interface MilestoneReward {
  type: 'quarter' | 'streak' | 'weekend' | 'daily_goal';
  multiplier: number;
  description: string;
  icon: string;
}

interface CelebrationEvent {
  type: 'tier_upgrade' | 'rate_increase' | 'milestone' | 'streak' | 'daily_goal';
  tier?: number;
  newRate?: number;
  milestone?: string;
  isVisible: boolean;
  message: string;
  subMessage?: string;
  icon: string;
}

export const useCoinRateSystem = () => {
  const [currentTier, setCurrentTier] = useState(1);
  const [currentSteps, setCurrentSteps] = useState(45000);
  const [dailySteps, setDailySteps] = useState(3542);
  const [currentStreak, setCurrentStreak] = useState(5);
  const [celebrationEvent, setCelebrationEvent] = useState<CelebrationEvent | null>(null);

  // Tier rate structure - Updated with paisa per 25 steps calculation
  const tierRates: TierRate[] = [
    { tier: 1, symbol: '🟡', name: 'Paisa Phase', rate: 1, stepRequirement: 200000, timeLimit: 30, spiritualName: 'Foundation of Discipline' }, // 1 paisa per 25 steps
    { tier: 2, symbol: '🪙', name: 'Coin Phase', rate: 2, stepRequirement: 300000, timeLimit: 45, spiritualName: 'Consistent Practice' }, // 2 paisa per 25 steps
    { tier: 3, symbol: '🎟️', name: 'Token Phase', rate: 3, stepRequirement: 400000, timeLimit: 60, spiritualName: 'Strengthened Willpower' }, // 3 paisa per 25 steps
    { tier: 4, symbol: '💎', name: 'Gem Phase', rate: 5, stepRequirement: 500000, timeLimit: 75, spiritualName: 'Inner Clarity' }, // 5 paisa per 25 steps
    { tier: 5, symbol: '💠', name: 'Diamond Phase', rate: 7, stepRequirement: 600000, timeLimit: 80, spiritualName: 'Unshakeable Focus' }, // 7 paisa per 25 steps
    { tier: 6, symbol: '👑', name: 'Crown Phase', rate: 10, stepRequirement: 1000000, timeLimit: 120, spiritualName: 'Mastery of Self' }, // 10 paisa per 25 steps
    { tier: 7, symbol: '🏵️', name: 'Emperor Phase', rate: 15, stepRequirement: 1700000, timeLimit: 200, spiritualName: 'Transcendent Power' }, // 15 paisa per 25 steps
    { tier: 8, symbol: '🏅', name: 'Legend Phase', rate: 20, stepRequirement: 2000000, timeLimit: 250, spiritualName: 'Enlightened Being' }, // 20 paisa per 25 steps
    { tier: 9, symbol: '🏆', name: 'Immortal Phase', rate: 30, stepRequirement: 3000000, timeLimit: 365, spiritualName: 'Eternal Consciousness' } // 30 paisa per 25 steps
  ];

  const currentTierData = tierRates[currentTier - 1];
  const nextTierData = tierRates[currentTier] || null;

  // Calculate current coin rate with bonuses
  const calculateCurrentRate = useCallback(() => {
    let baseRate = currentTierData.rate;
    let totalMultiplier = 1;
    const activeBonus: string[] = [];

    // Weekend bonus (1.5x on Saturday/Sunday)
    const today = new Date().getDay();
    if (today === 0 || today === 6) {
      totalMultiplier *= 1.5;
      activeBonus.push('Weekend Bonus: 1.5x');
    }

    // Indian Seasonal bonus
    const currentMonth = new Date().getMonth(); // 0-11
    let seasonalMultiplier = 1;
    let seasonName = '';
    
    if ([2, 3, 4].includes(currentMonth)) { // March-May: Summer
      seasonalMultiplier = 1.2;
      seasonName = 'Summer';
    } else if ([5, 6, 7, 8].includes(currentMonth)) { // June-September: Rainy
      seasonalMultiplier = 1.3;
      seasonName = 'Rainy';
    } else { // October-February: Winter
      seasonalMultiplier = 1.15;
      seasonName = 'Winter';
    }
    
    totalMultiplier *= seasonalMultiplier;
    activeBonus.push(`${seasonName} Season: ${seasonalMultiplier}x`);

    // Streak bonus (increases with tier level)
    if (currentStreak >= 7) {
      const streakMultiplier = 1 + (currentTier * 0.1);
      totalMultiplier *= streakMultiplier;
      activeBonus.push(`${currentStreak}-day Streak: ${streakMultiplier.toFixed(1)}x`);
    }

    // Quarter milestone bonus within tier
    const tierProgress = (currentSteps / currentTierData.stepRequirement) * 100;
    if (tierProgress >= 75) {
      totalMultiplier *= 1.25;
      activeBonus.push('75% Milestone: 1.25x');
    } else if (tierProgress >= 50) {
      totalMultiplier *= 1.15;
      activeBonus.push('50% Milestone: 1.15x');
    } else if (tierProgress >= 25) {
      totalMultiplier *= 1.1;
      activeBonus.push('25% Milestone: 1.1x');
    }

    return {
      baseRate,
      effectiveRate: baseRate * totalMultiplier,
      totalMultiplier,
      activeBonuses: activeBonus
    };
  }, [currentTier, currentTierData, currentSteps, currentStreak]);

  // Calculate base earnings for given steps - UNLIMITED STEPS FOR EVERYONE! 
  const calculateBaseEarnings = useCallback((steps: number) => {
    // No daily cap - unlimited steps for all users completely FREE!
    const cappedSteps = steps;
    
    // Calculate units (every 25 steps = 1 unit)
    const units = Math.floor(cappedSteps / 25);
    
    // Calculate paisa earnings (base rate: paisa per 25 steps)
    const paisaEarned = Math.floor(units * currentTierData.rate);
    
    return {
      cappedSteps,
      units,
      paisaEarned,
      rupeesEarned: paisaEarned / 100,
      wasCapExceeded: false // No cap anymore!
    };
  }, [currentTierData.rate]);

  // Calculate earnings with bonuses for given steps with daily cap
  const calculateEarnings = useCallback((steps: number) => {
    const { cappedSteps } = calculateBaseEarnings(steps);
    const { effectiveRate } = calculateCurrentRate();
    
    // Calculate units (every 25 steps = 1 unit)
    const units = Math.floor(cappedSteps / 25);
    
    // Calculate paisa earnings with bonuses
    const paisaEarned = Math.floor(units * effectiveRate);
    
    return paisaEarned;
  }, [calculateBaseEarnings, calculateCurrentRate]);

  // Get daily earning potential
  const getDailyPotential = useCallback((targetSteps: number = 10000) => {
    const earnings = calculateEarnings(targetSteps);
    return {
      steps: targetSteps,
      coins: earnings,
      rupees: earnings / 100
    };
  }, [calculateEarnings]);

  // Check for tier progression
  const checkTierProgression = useCallback(() => {
    const tierProgress = (currentSteps / currentTierData.stepRequirement) * 100;
    
    if (currentSteps >= currentTierData.stepRequirement && currentTier < 9) {
      // Tier upgrade!
      const newTier = currentTier + 1;
      const newTierData = tierRates[newTier - 1];
      
      setCelebrationEvent({
        type: 'tier_upgrade',
        tier: newTier,
        newRate: newTierData.rate,
        isVisible: true,
        message: `Welcome to ${newTierData.name}! 🎉`,
        subMessage: `New rate: ${newTierData.rate} paisa per 25 steps`,
        icon: newTierData.symbol
      });

      setCurrentTier(newTier);
      setCurrentSteps(0); // Reset for new tier
      return true;
    }

    // Check quarter milestones
    const quarterMilestones = [25, 50, 75];
    const currentQuarter = Math.floor(tierProgress / 25) * 25;
    
    if (quarterMilestones.includes(currentQuarter) && tierProgress >= currentQuarter && tierProgress < currentQuarter + 5) {
      setCelebrationEvent({
        type: 'milestone',
        milestone: `${currentQuarter}%`,
        isVisible: true,
        message: `${currentQuarter}% Milestone Reached! ✨`,
        subMessage: 'Bonus multiplier activated',
        icon: '🎯'
      });
      return true;
    }

    return false;
  }, [currentSteps, currentTier, currentTierData, tierRates]);

  // Check daily goal achievement
  const checkDailyGoal = useCallback((goalSteps: number = 8000) => {
    if (dailySteps >= goalSteps) {
      setCelebrationEvent({
        type: 'daily_goal',
        isVisible: true,
        message: 'Daily Goal Achieved! 🏃‍♂️',
        subMessage: 'Mindful progress on your journey',
        icon: '✅'
      });
      return true;
    }
    return false;
  }, [dailySteps]);

  // Check streak milestones
  const checkStreakMilestone = useCallback(() => {
    if ([7, 14, 21, 30, 50, 100].includes(currentStreak)) {
      setCelebrationEvent({
        type: 'streak',
        isVisible: true,
        message: `${currentStreak} Day Streak! 🔥`,
        subMessage: "Don't break the chain!",
        icon: '🔥'
      });
      return true;
    }
    return false;
  }, [currentStreak]);

  // Dismiss celebration
  const dismissCelebration = useCallback(() => {
    setCelebrationEvent(null);
  }, []);

  // Add steps (for simulation)
  const addSteps = useCallback((steps: number) => {
    setDailySteps(prev => prev + steps);
    setCurrentSteps(prev => {
      const newSteps = prev + steps;
      setTimeout(() => checkTierProgression(), 100);
      return newSteps;
    });
  }, [checkTierProgression]);

  // Get tier progress percentage
  const getTierProgress = useCallback(() => {
    return Math.min((currentSteps / currentTierData.stepRequirement) * 100, 100);
  }, [currentSteps, currentTierData]);

  // Get motivational mantras based on current tier
  const getTierMantra = useCallback(() => {
    const mantras = [
      "Every step builds the foundation of discipline 🙏",
      "Consistency is the path to success 💪", 
      "Your willpower grows with each determined step 💪",
      "Clarity emerges through dedicated practice ✨",
      "Focus transforms ordinary moments into special ones 🔸",
      "You are mastering the art of purposeful movement 👑",
      "Powerful energy flows through intentional action ⚡",
      "You walk among the dedicated ones 🌟",
      "Your determination expands with every step 🔥"
    ];
    return mantras[currentTier - 1] || mantras[0];
  }, [currentTier]);

  // Get spiritual reflection for tier completion
  const getSpiritualReflection = useCallback(() => {
    const reflections = [
      "Reflect on the discipline you've cultivated in this phase 🤲",
      "How has consistent practice transformed your daily life? 📿",
      "Notice the strength of will you've developed within 💎",
      "What clarity has emerged from your mindful steps? 🔍",
      "Celebrate the unshakeable focus you've achieved 🎯",
      "Acknowledge your mastery over mind and body 🏛️",
      "Feel the transcendent power you've awakened ⚡",
      "You've joined the ranks of the spiritually awakened 🌅",
      "Your journey has led to eternal consciousness 🕉️"
    ];
    return reflections[currentTier - 1] || reflections[0];
  }, [currentTier]);

  // Simulate daily step increment
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance each second
        const stepIncrement = Math.floor(Math.random() * 5) + 1;
        addSteps(stepIncrement);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [addSteps]);

  // Check for achievements periodically
  useEffect(() => {
    checkDailyGoal();
    checkStreakMilestone();
  }, [checkDailyGoal, checkStreakMilestone]);

  // No daily cap anymore - unlimited steps for everyone!
  const isDailyCapExceeded = useCallback((steps: number) => {
    return false; // No cap - walk as much as you want!
  }, []);

  // Get motivational message about unlimited steps
  const getUnlimitedStepsMessage = useCallback(() => {
    return "🎉 NO DAILY LIMITS! Walk unlimited steps and earn unlimited rewards - completely FREE for everyone!";
  }, []);

  return {
    // Current state
    currentTier,
    currentTierData,
    nextTierData,
    currentSteps,
    dailySteps,
    currentStreak,
    
    // Rate calculations
    calculateCurrentRate,
    calculateBaseEarnings,
    calculateEarnings,
    getDailyPotential,
    getTierProgress,
    
    // No limits utilities
    isDailyCapExceeded,
    getUnlimitedStepsMessage,
    
    // Celebrations
    celebrationEvent,
    dismissCelebration,
    
    // Utilities
    addSteps,
    getTierMantra,
    getSpiritualReflection,
    tierRates,
    
    // Progression checks
    checkTierProgression,
    checkDailyGoal,
    checkStreakMilestone
  };
};