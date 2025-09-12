import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface YogicData {
  // User data
  user: {
    id: string;
    fullName: string;
    currentPhase: number;
    totalLifetimeSteps: number;
    currentStreak: number;
    longestStreak: number;
  };
  
  // Daily progress
  dailyProgress: {
    currentSteps: number;
    dailyGoal: number;
    coinsEarnedToday: number;
    distance: number;
    activeMinutes: number;
    isRedeemed: boolean;
  };

  // Wallet data
  wallet: {
    totalBalance: number; // in paisa
    totalEarned: number;
    totalRedeemed: number;
  };

  // Phase system
  phases: {
    currentPhase: number;
    currentPhaseSteps: number;
    phaseTarget: number;
    daysRemaining: number;
  };
}

const phaseDefinitions = [
  { id: 1, name: 'Paisa Phase', symbol: '🟡', rate: 1, stepRequirement: 200000, timeLimit: 60 },
  { id: 2, name: 'Coin Phase', symbol: '🪙', rate: 2, stepRequirement: 300000, timeLimit: 60 },
  { id: 3, name: 'Token Phase', symbol: '🎟️', rate: 3, stepRequirement: 400000, timeLimit: 60 },
  { id: 4, name: 'Gem Phase', symbol: '💎', rate: 5, stepRequirement: 500000, timeLimit: 60 },
  { id: 5, name: 'Diamond Phase', symbol: '💠', rate: 7, stepRequirement: 600000, timeLimit: 60 },
  { id: 6, name: 'Crown Phase', symbol: '👑', rate: 10, stepRequirement: 800000, timeLimit: 60 },
  { id: 7, name: 'Emperor Phase', symbol: '🏵️', rate: 15, stepRequirement: 1000000, timeLimit: 60 },
  { id: 8, name: 'Legend Phase', symbol: '🏅', rate: 20, stepRequirement: 1200000, timeLimit: 60 },
  { id: 9, name: 'Immortal Phase', symbol: '🏆', rate: 30, stepRequirement: 1500000, timeLimit: 60 },
];

export const useYogicData = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [yogicData, setYogicData] = useState<YogicData>({
    user: {
      id: '',
      fullName: 'Guest User',
      currentPhase: 1,
      totalLifetimeSteps: 0,
      currentStreak: 0,
      longestStreak: 0,
    },
    dailyProgress: {
      currentSteps: 0,
      dailyGoal: 10000,
      coinsEarnedToday: 0,
      distance: 0,
      activeMinutes: 0,
      isRedeemed: false,
    },
    wallet: {
      totalBalance: 0,
      totalEarned: 0,
      totalRedeemed: 0,
    },
    phases: {
      currentPhase: 1,
      currentPhaseSteps: 0,
      phaseTarget: 200000,
      daysRemaining: 60,
    },
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load user data from database
  const loadUserData = useCallback(async () => {
    if (isGuest || !user) {
      // For guests, use mock data but don't persist
      setYogicData(prev => ({
        ...prev,
        user: {
          id: 'guest',
          fullName: 'Guest User',
          currentPhase: 1,
          totalLifetimeSteps: Math.floor(Math.random() * 50000),
          currentStreak: Math.floor(Math.random() * 7),
          longestStreak: Math.floor(Math.random() * 15),
        },
        dailyProgress: {
          currentSteps: Math.floor(Math.random() * 12000),
          dailyGoal: 10000,
          coinsEarnedToday: Math.floor(Math.random() * 100),
          distance: Math.random() * 10,
          activeMinutes: Math.floor(Math.random() * 120),
          isRedeemed: false,
        },
      }));
      setIsLoading(false);
      return;
    }

    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load user phase data
      const { data: userPhase } = await supabase
        .from('user_phases')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load wallet balance
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Load today's steps
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySteps } = await supabase
        .from('daily_steps')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const currentPhase = userPhase?.current_phase || 1;
      const phaseInfo = phaseDefinitions.find(p => p.id === currentPhase) || phaseDefinitions[0];

      setYogicData({
        user: {
          id: user.id,
          fullName: profile?.full_name || 'Yogic Walker',
          currentPhase: currentPhase,
          totalLifetimeSteps: userPhase?.total_lifetime_steps || 0,
          currentStreak: userPhase?.current_streak || 0,
          longestStreak: userPhase?.longest_streak || 0,
        },
        dailyProgress: {
          currentSteps: todaySteps?.steps || 0,
          dailyGoal: 10000,
          coinsEarnedToday: todaySteps?.paisa_earned || 0,
          distance: (todaySteps?.steps || 0) * 0.0008, // Approximate km
          activeMinutes: Math.floor((todaySteps?.steps || 0) / 100), // Approximate minutes
          isRedeemed: todaySteps?.is_redeemed || false,
        },
        wallet: {
          totalBalance: wallet?.total_balance || 0,
          totalEarned: wallet?.total_earned || 0,
          totalRedeemed: wallet?.total_redeemed || 0,
        },
        phases: {
          currentPhase: currentPhase,
          currentPhaseSteps: userPhase?.current_phase_steps || 0,
          phaseTarget: phaseInfo.stepRequirement,
          daysRemaining: Math.max(0, phaseInfo.timeLimit - Math.floor((Date.now() - new Date(userPhase?.phase_start_date || Date.now()).getTime()) / (1000 * 60 * 60 * 24))),
        },
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load your profile data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest, toast]);

  // Update daily steps
  const updateSteps = useCallback(async (newSteps: number) => {
    if (isGuest) {
      // For guests, just update local state
      setYogicData(prev => ({
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          currentSteps: newSteps,
          coinsEarnedToday: Math.floor(Math.min(newSteps, 12000) / 25),
          distance: newSteps * 0.0008,
          activeMinutes: Math.floor(newSteps / 100),
        },
      }));
      return;
    }

    if (!user) return;

    try {
      const cappedSteps = Math.min(newSteps, 12000);
      const units = Math.floor(cappedSteps / 25);
      const currentPhase = yogicData.user.currentPhase;
      const phaseRate = phaseDefinitions.find(p => p.id === currentPhase)?.rate || 1;
      const paisaEarned = units * phaseRate;

      const today = new Date().toISOString().split('T')[0];

      // Update or insert today's steps
      const { error } = await supabase
        .from('daily_steps')
        .upsert({
          user_id: user.id,
          date: today,
          steps: newSteps,
          capped_steps: cappedSteps,
          units_earned: units,
          paisa_earned: paisaEarned,
          phase_id: currentPhase,
          phase_rate: phaseRate,
        });

      if (error) throw error;

      // Update local state
      setYogicData(prev => ({
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          currentSteps: newSteps,
          coinsEarnedToday: paisaEarned,
          distance: newSteps * 0.0008,
          activeMinutes: Math.floor(newSteps / 100),
        },
      }));

      // Check for phase progression
      const newLifetimeSteps = yogicData.user.totalLifetimeSteps + Math.max(0, newSteps - yogicData.dailyProgress.currentSteps);
      const currentPhaseSteps = yogicData.phases.currentPhaseSteps + Math.max(0, newSteps - yogicData.dailyProgress.currentSteps);
      
      if (currentPhaseSteps >= yogicData.phases.phaseTarget) {
        // Phase advancement logic would go here
        toast({
          title: "🎉 Phase Advanced!",
          description: `Congratulations! You've reached the next phase!`,
        });
      }
    } catch (error) {
      console.error('Error updating steps:', error);
    }
  }, [user, isGuest, yogicData, toast]);

  // Redeem daily coins
  const redeemDailyCoins = useCallback(async () => {
    if (isGuest) {
      toast({
        title: "Sign up required",
        description: "Create an account to redeem your coins!",
        variant: "destructive",
      });
      return false;
    }

    if (!user || yogicData.dailyProgress.isRedeemed) return false;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Mark today's earnings as redeemed
      await supabase
        .from('daily_steps')
        .update({ 
          is_redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('date', today);

      // Add transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'earning',
        amount: yogicData.dailyProgress.coinsEarnedToday,
        description: `Daily earnings: ${yogicData.dailyProgress.currentSteps} steps`,
      });

      // Update wallet balance
      const newBalance = yogicData.wallet.totalBalance + yogicData.dailyProgress.coinsEarnedToday;
      await supabase.from('wallet_balances')
        .update({
          total_balance: newBalance,
          total_earned: yogicData.wallet.totalEarned + yogicData.dailyProgress.coinsEarnedToday,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      // Update local state
      setYogicData(prev => ({
        ...prev,
        dailyProgress: {
          ...prev.dailyProgress,
          isRedeemed: true,
        },
        wallet: {
          ...prev.wallet,
          totalBalance: newBalance,
          totalEarned: prev.wallet.totalEarned + prev.dailyProgress.coinsEarnedToday,
        },
      }));

      toast({
        title: "Coins redeemed!",
        description: `₹${(yogicData.dailyProgress.coinsEarnedToday / 100).toFixed(2)} added to your wallet!`,
      });

      return true;
    } catch (error) {
      console.error('Error redeeming coins:', error);
      toast({
        title: "Redemption failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, isGuest, yogicData, toast]);

  // Load data on mount and user changes
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Simulate step increments for demo (remove in production)
  useEffect(() => {
    if (isGuest) {
      const interval = setInterval(() => {
        setYogicData(prev => ({
          ...prev,
          dailyProgress: {
            ...prev.dailyProgress,
            currentSteps: Math.min(prev.dailyProgress.currentSteps + Math.floor(Math.random() * 50), 15000),
          },
        }));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isGuest]);

  return {
    ...yogicData,
    isLoading,
    updateSteps,
    redeemDailyCoins,
    refreshData: loadUserData,
  };
};