import { useState, useEffect, useCallback } from 'react';

export interface StepTrackingState {
  dailySteps: number;
  lifetimeSteps: number;
  goalSteps: number;
  coinsEarnedToday: number;
  coinsRedeemedToday: number;
  currentTier: number;
  streak: number;
}

export const useStepTracking = () => {
  const [state, setState] = useState<StepTrackingState>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('yogicmile-step-tracking');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fall back to defaults if parsing fails
      }
    }
    
    return {
      dailySteps: 3247,
      lifetimeSteps: 47892,
      goalSteps: 10000,
      coinsEarnedToday: 24,
      coinsRedeemedToday: 8,
      currentTier: 1,
      streak: 7,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('yogicmile-step-tracking', JSON.stringify(state));
  }, [state]);

  const updateSteps = useCallback((newSteps: number) => {
    setState(prev => ({
      ...prev,
      dailySteps: newSteps,
      lifetimeSteps: prev.lifetimeSteps + Math.max(0, newSteps - prev.dailySteps),
    }));
  }, []);

  const claimReward = useCallback(() => {
    setState(prev => ({
      ...prev,
      coinsEarnedToday: prev.coinsEarnedToday + 10,
    }));
  }, []);

  const redeemCoins = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      coinsEarnedToday: Math.max(0, prev.coinsEarnedToday - amount),
      coinsRedeemedToday: prev.coinsRedeemedToday + amount,
    }));
  }, []);

  const resetDaily = useCallback(() => {
    setState(prev => ({
      ...prev,
      dailySteps: 0,
      coinsEarnedToday: 0,
      coinsRedeemedToday: 0,
    }));
  }, []);

  return {
    ...state,
    updateSteps,
    claimReward,
    redeemCoins,
    resetDaily,
  };
};