import { useState, useCallback } from 'react';

// Simplified hook for real fitness app data without mock content
export const useFitnessData = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Basic user data structure
  const user = {
    id: 'user_001',
    displayName: 'Fitness Walker',
    currentTier: 1,
    tierName: 'Paisa Phase',
    tierSymbol: '🟡',
    tierColor: '#FFC107',
    streakDays: 0,
    totalLifetimeSteps: 0,
    dailyGoal: 8000
  };

  // Daily progress tracking
  const dailyProgress = {
    date: new Date().toISOString().split('T')[0],
    currentSteps: 0,
    dailyGoal: 8000,
    distance: 0,
    calories: 0,
    activeMinutes: 0,
    coinsEarnedToday: 0,
    coinsRedeemedToday: 0,
    sessionsToday: 0
  };

  // Tier progress
  const tierProgress = {
    currentTier: 1,
    currentTierSteps: 0,
    tierTarget: 200000,
    tierStartDate: new Date().toISOString().split('T')[0],
    tierDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysRemaining: 30,
    nextTierPreview: {
      tier: 2,
      name: 'Coin Phase',
      symbol: '🪙',
      requirement: '300K steps in 45 days',
      reward: '2 paisa per 100 steps'
    }
  };

  // Wallet data
  const wallet = {
    totalBalance: 0,
    thisWeekEarnings: 0,
    pendingRedemptions: 0,
    transactionHistory: []
  };

  // Weekly insights
  const insights = {
    weekStats: {
      totalSteps: 0,
      averageDaily: 0,
      bestDay: { date: '', steps: 0 },
      worstDay: { date: '', steps: 0 },
      consistency: 0,
      improvement: '0%'
    }
  };

  // Action functions
  const updateSteps = useCallback(async (newSteps: number) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Real step update logic would go here
    // For now, this is just a placeholder
    
    setIsLoading(false);
  }, []);

  const redeemDailyCoins = useCallback(async (amount: number = 10) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Real coin redemption logic would go here
    
    setIsLoading(false);
    return true;
  }, []);

  const spinWheelAction = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Real spin wheel logic would go here
    
    setIsLoading(false);
    return { value: 10, label: '10 coins' };
  }, []);

  return {
    // Core data
    user,
    dailyProgress,
    tierProgress,
    wallet: { mockData: wallet }, // Temporary wrapper for compatibility
    insights,
    isLoading,
    
    // Actions
    updateSteps,
    redeemDailyCoins,
    spinWheelAction,
    
    // Utilities
    isDailyGoalReached: () => dailyProgress.currentSteps >= dailyProgress.dailyGoal,
    getTierProgressPercentage: () => Math.min((tierProgress.currentTierSteps / tierProgress.tierTarget) * 100, 100),
    getNextTierInfo: () => tierProgress.nextTierPreview,
    getCelebrationConfig: () => ({ type: 'confetti', colors: ['#FFC107'], duration: 2000 })
  };
};