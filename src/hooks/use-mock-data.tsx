import { useState, useEffect, useCallback } from 'react';
import { 
  mockUser, 
  mockDailyProgress, 
  tierProgressData,
  navigationSections,
  adContent,
  countdownTimer,
  celebrationAnimations,
  yogicMilePhases,
  weeklyInsights
} from '@/data/mockData';

// Enhanced hook with Yogic Mile mock data
export const useYogicMileData = () => {
  const [user, setUser] = useState(mockUser);
  const [dailyProgress, setDailyProgress] = useState(mockDailyProgress);
  const [tierProgress, setTierProgress] = useState(tierProgressData);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate step update with Yogic Mile logic
  const updateSteps = useCallback(async (newSteps: number) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const stepDiff = newSteps - dailyProgress.currentSteps;
    const coinsEarned = Math.floor(stepDiff * 0.01); // 1 paisa per 100 steps
    
    // Update daily progress
    setDailyProgress(prev => ({
      ...prev,
      currentSteps: newSteps,
      distance: (newSteps * 0.8) / 1000, // 0.8m per step
      calories: Math.floor(newSteps * 0.04), // 40 cal per 1000 steps
      activeMinutes: Math.floor(newSteps * 0.01), // 10 min per 1000 steps
      coinsEarnedToday: prev.coinsEarnedToday + Math.max(0, coinsEarned)
    }));

    // Update user lifetime steps
    setUser(prev => ({
      ...prev,
      totalLifetimeSteps: prev.totalLifetimeSteps + Math.max(0, stepDiff)
    }));

    // Update tier progress
    setTierProgress(prev => ({
      ...prev,
      currentTierSteps: prev.currentTierSteps + Math.max(0, stepDiff)
    }));

    setIsLoading(false);
  }, [dailyProgress.currentSteps]);

  // Simulate coin redemption
  const redeemDailyCoins = useCallback(async (amount: number = 10) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    setDailyProgress(prev => ({
      ...prev,
      coinsRedeemedToday: prev.coinsRedeemedToday + amount
    }));

    // Add to wallet balance (simulate)
    const walletData = navigationSections.wallet.mockData;
    walletData.totalBalance += amount;
    walletData.transactionHistory.unshift({
      type: 'earned',
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      source: 'Daily Redemption'
    });

    setIsLoading(false);
    return true;
  }, []);

  // Simulate spin wheel
  const spinWheel = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const spinData = navigationSections.spinWheel.mockData;
    const wheelConfig = spinData.wheelConfig;
    
    // Weighted random selection
    const random = Math.random();
    let accumulator = 0;
    
    const wonReward = wheelConfig.find(reward => {
      accumulator += reward.probability;
      return random <= accumulator;
    }) || wheelConfig[0];

    // Update spins available
    spinData.spinsAvailable = Math.max(0, spinData.spinsAvailable - 1);
    spinData.lastSpin = new Date().toISOString().split('T')[0];

    // Add coins if won
    if (wonReward.value > 0) {
      setDailyProgress(prev => ({
        ...prev,
        coinsEarnedToday: prev.coinsEarnedToday + wonReward.value
      }));
    }

    setIsLoading(false);
    return wonReward;
  }, []);

  // Get celebration config for different achievements
  const getCelebrationConfig = useCallback((achievementType: string) => {
    return celebrationAnimations[achievementType as keyof typeof celebrationAnimations] || celebrationAnimations.dailyGoalAchieved;
  }, []);

  // Check if daily goal is reached
  const isDailyGoalReached = useCallback(() => {
    return dailyProgress.currentSteps >= dailyProgress.dailyGoal;
  }, [dailyProgress]);

  // Get tier progress percentage
  const getTierProgressPercentage = useCallback(() => {
    return Math.min((tierProgress.currentTierSteps / tierProgress.tierTarget) * 100, 100);
  }, [tierProgress]);

  // Get next tier info
  const getNextTierInfo = useCallback(() => {
    return tierProgress.nextTierPreview;
  }, [tierProgress]);

  return {
    // Core data
    user,
    dailyProgress,
    tierProgress,
    isLoading,
    
    // Navigation sections
    coinsEarned: navigationSections.coinsEarned,
    vouchersStore: navigationSections.vouchersStore,
    spinWheelSection: navigationSections.spinWheel,
    wallet: navigationSections.wallet,
    
    // Ad content
    ads: adContent,
    
    // Timer logic
    countdown: countdownTimer,
    
    // Phase system
    phases: yogicMilePhases,
    
    // Analytics
    insights: weeklyInsights,
    
    // Actions
    updateSteps,
    redeemDailyCoins,
    spinWheelAction: spinWheel,
    
    // Utilities
    getCelebrationConfig,
    isDailyGoalReached,
    getTierProgressPercentage,
    getNextTierInfo,
    
    // Celebration configs
    celebrations: celebrationAnimations
  };
};