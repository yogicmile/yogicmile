import { useState, useEffect, useCallback } from 'react';
import { 
  MOCK_USER, 
  MOCK_DAILY_STEPS, 
  MOCK_COIN_BALANCE, 
  MOCK_TRANSACTIONS,
  MOCK_VOUCHERS,
  MOCK_ACHIEVEMENTS,
  MOCK_LEADERBOARD,
  MOCK_WEEKLY_STATS,
  MOCK_SPIN_REWARDS,
  USER_PHASES
} from '@/data/mockData';
import { 
  UserProfile, 
  DailyStepData, 
  CoinBalance, 
  CoinTransaction,
  Voucher,
  Achievement,
  LeaderboardEntry,
  WeeklyStats,
  SpinWheelReward,
  UserPhase
} from '@/types';

// Enhanced hook with realistic mock data
export const useMockStepTracking = () => {
  const [user, setUser] = useState<UserProfile>(MOCK_USER);
  const [dailySteps, setDailySteps] = useState<DailyStepData[]>(MOCK_DAILY_STEPS);
  const [coinBalance, setCoinBalance] = useState<CoinBalance>(MOCK_COIN_BALANCE);
  const [transactions, setTransactions] = useState<CoinTransaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(false);

  // Get today's step data
  const getTodaySteps = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return dailySteps.find(day => day.date === today) || dailySteps[0];
  }, [dailySteps]);

  // Update user phase based on current steps
  const updateUserPhase = useCallback((steps: number) => {
    const newPhase = USER_PHASES.find(phase => 
      steps >= phase.minSteps && steps <= phase.maxSteps
    ) || USER_PHASES[0];

    setUser(prev => ({
      ...prev,
      currentPhase: newPhase
    }));
  }, []);

  // Simulate step update with realistic timing
  const updateSteps = useCallback(async (newSteps: number) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const today = getTodaySteps();
    const stepDiff = newSteps - today.steps;
    const coinsEarned = Math.floor(stepDiff * 0.01); // 1 coin per 100 steps
    
    // Update daily steps
    setDailySteps(prev => 
      prev.map(day => 
        day.date === today.date 
          ? {
              ...day,
              steps: newSteps,
              distance: newSteps * 0.0008, // ~800m per 1000 steps
              calories: Math.floor(newSteps * 0.04), // ~40 cal per 1000 steps
              activeMinutes: Math.floor(newSteps * 0.01), // ~10 min per 1000 steps
              coinsEarned: day.coinsEarned + Math.max(0, coinsEarned),
              goalReached: newSteps >= user.preferences.dailyStepGoal
            }
          : day
      )
    );

    // Update coin balance
    if (coinsEarned > 0) {
      setCoinBalance(prev => ({
        ...prev,
        total: prev.total + coinsEarned,
        todayEarned: prev.todayEarned + coinsEarned,
        lifetimeEarned: prev.lifetimeEarned + coinsEarned
      }));

      // Add transaction record
      const newTransaction: CoinTransaction = {
        id: `tx_${Date.now()}`,
        type: 'earned',
        amount: coinsEarned,
        description: `Steps update: ${newSteps.toLocaleString()} steps`,
        timestamp: new Date(),
        relatedSteps: newSteps,
        sourceType: 'daily_steps'
      };

      setTransactions(prev => [newTransaction, ...prev]);
    }

    // Update user phase and lifetime steps
    updateUserPhase(newSteps);
    setUser(prev => ({
      ...prev,
      totalLifetimeSteps: prev.totalLifetimeSteps + Math.max(0, stepDiff)
    }));

    setIsLoading(false);
  }, [getTodaySteps, user.preferences.dailyStepGoal, updateUserPhase]);

  // Simulate coin redemption
  const redeemCoins = useCallback(async (amount: number) => {
    if (coinBalance.total < amount) {
      throw new Error('Insufficient coin balance');
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));

    setCoinBalance(prev => ({
      ...prev,
      total: prev.total - amount,
      todayRedeemed: prev.todayRedeemed + amount,
      lifetimeRedeemed: prev.lifetimeRedeemed + amount
    }));

    const newTransaction: CoinTransaction = {
      id: `tx_${Date.now()}`,
      type: 'redeemed',
      amount: -amount,
      description: `Daily coins redemption`,
      timestamp: new Date(),
      sourceType: 'manual'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setIsLoading(false);
    return true;
  }, [coinBalance.total]);

  // Simulate spin wheel
  const spinWheel = useCallback(async (): Promise<SpinWheelReward> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Spinner animation time

    // Weighted random selection
    const random = Math.random();
    let accumulator = 0;
    
    const wonReward = MOCK_SPIN_REWARDS.find(reward => {
      accumulator += reward.probability;
      return random <= accumulator;
    }) || MOCK_SPIN_REWARDS[0];

    // Add coins if applicable
    if (wonReward.type === 'coins' && wonReward.value > 0) {
      setCoinBalance(prev => ({
        ...prev,
        total: prev.total + wonReward.value,
        todayEarned: prev.todayEarned + wonReward.value,
        lifetimeEarned: prev.lifetimeEarned + wonReward.value
      }));

      const newTransaction: CoinTransaction = {
        id: `tx_${Date.now()}`,
        type: 'bonus',
        amount: wonReward.value,
        description: `Spin wheel: ${wonReward.label}`,
        timestamp: new Date(),
        sourceType: 'bonus_spin'
      };

      setTransactions(prev => [newTransaction, ...prev]);
    }

    setIsLoading(false);
    return wonReward;
  }, []);

  // Get current user data
  const getCurrentData = useCallback(() => ({
    user,
    todaySteps: getTodaySteps(),
    coinBalance,
    recentTransactions: transactions.slice(0, 10),
    weeklyStats: MOCK_WEEKLY_STATS,
    isLoading
  }), [user, getTodaySteps, coinBalance, transactions, isLoading]);

  return {
    // Data
    user,
    dailySteps,
    coinBalance,
    transactions,
    isLoading,
    
    // Actions
    updateSteps,
    redeemCoins,
    spinWheel,
    
    // Getters
    getTodaySteps,
    getCurrentData,
    
    // Static data
    vouchers: MOCK_VOUCHERS,
    achievements: MOCK_ACHIEVEMENTS,
    leaderboard: MOCK_LEADERBOARD,
    weeklyStats: MOCK_WEEKLY_STATS,
    spinRewards: MOCK_SPIN_REWARDS
  };
};