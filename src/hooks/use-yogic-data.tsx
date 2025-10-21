import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PHASE_DEFINITIONS } from '@/constants/phases';
import { useGamification } from '@/hooks/use-gamification';
import { guestDataManager } from '@/services/GuestDataManager';

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

const phaseDefinitions = PHASE_DEFINITIONS;

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
      // For guests, load from localStorage
      const guestSteps = guestDataManager.getTodaySteps();
      const guestWallet = guestDataManager.getWallet();
      const guestPhase = guestDataManager.getPhase();
      
      setYogicData(prev => ({
        ...prev,
        user: {
          id: 'guest',
          fullName: 'Guest User',
          currentPhase: guestPhase.currentPhase,
          totalLifetimeSteps: guestPhase.totalSteps,
          currentStreak: 0,
          longestStreak: 0,
        },
        dailyProgress: {
          currentSteps: guestSteps?.steps || 0,
          dailyGoal: 10000,
          coinsEarnedToday: guestSteps?.coins || 0,
          distance: (guestSteps?.steps || 0) * 0.0008,
          activeMinutes: Math.floor((guestSteps?.steps || 0) / 100),
          isRedeemed: false,
        },
        wallet: {
          totalBalance: guestWallet.balance,
          totalEarned: guestWallet.totalEarned,
          totalRedeemed: 0,
        },
        phases: {
          currentPhase: guestPhase.currentPhase,
          currentPhaseSteps: guestPhase.totalSteps,
          phaseTarget: phaseDefinitions[guestPhase.currentPhase]?.stepRequirement || 200000,
          daysRemaining: phaseDefinitions[guestPhase.currentPhase]?.timeLimit || 60,
        },
      }));
      setIsLoading(false);
      return;
    }

    try {
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      // Load user phase data
      const { data: userPhase, error: phaseError } = await supabase
        .from('user_phases')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (phaseError) {
        console.error('Error loading user phase:', phaseError);
      }

      // Load wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError) {
        console.error('Error loading wallet:', walletError);
      }

      // Load today's steps
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySteps, error: stepsError } = await supabase
        .from('daily_steps')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (stepsError) {
        console.error('Error loading daily steps:', stepsError);
      }

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
      const stepDiff = Math.max(0, newSteps - yogicData.dailyProgress.currentSteps);
      const newLifetimeSteps = yogicData.user.totalLifetimeSteps + stepDiff;
      const newCurrentPhaseSteps = yogicData.phases.currentPhaseSteps + stepDiff;
      
      // Update user_phases with new lifetime and phase steps
      await supabase
        .from('user_phases')
        .update({
          total_lifetime_steps: newLifetimeSteps,
          current_phase_steps: newCurrentPhaseSteps,
        })
        .eq('user_id', user.id);
      
      // Check if user should advance to next phase
      if (newCurrentPhaseSteps >= yogicData.phases.phaseTarget && currentPhase < 9) {
        const nextPhase = currentPhase + 1;
        const nextPhaseInfo = phaseDefinitions.find(p => p.id === nextPhase);
        
        if (nextPhaseInfo) {
          await supabase
            .from('user_phases')
            .update({
              current_phase: nextPhase,
              current_phase_steps: 0,
              phase_start_date: new Date().toISOString(),
            })
            .eq('user_id', user.id);

          toast({
            title: `🎉 ${nextPhaseInfo.symbol} Phase ${nextPhase} Unlocked!`,
            description: `${nextPhaseInfo.name} - Earn ${nextPhaseInfo.rate}x paisa per 25 steps!`,
          });

          // Refresh data to show new phase
          await loadUserData();
        }
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

  // Real-time database subscriptions (OPTIMIZED: Reduced reloads)
  useEffect(() => {
    if (isGuest || !user) return;

    // Only subscribe to critical real-time updates
    const criticalUpdatesChannel = supabase
      .channel('yogic-critical-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'daily_steps',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Optimistic update without full reload
          if (payload.new && payload.new.date === new Date().toISOString().split('T')[0]) {
            loadUserData(); // Refresh data when steps update
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(criticalUpdatesChannel);
    };
  }, [isGuest, user, loadUserData]);

  return {
    ...yogicData,
    isLoading,
    updateSteps,
    redeemDailyCoins,
    refreshData: loadUserData,
  };
};