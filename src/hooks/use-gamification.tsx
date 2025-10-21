import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  Achievement, 
  UserAchievement, 
  SeasonalChallenge,
  SeasonalChallengeParticipant,
  Collectible,
  UserCollectible,
  MilestonePhoto,
  GamificationSettings,
  OnboardingProgress
} from '@/types/gamification';

export function useGamification() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [seasonalChallenges, setSeasonalChallenges] = useState<SeasonalChallenge[]>([]);
  const [userChallengeParticipation, setUserChallengeParticipation] = useState<SeasonalChallengeParticipant[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<UserCollectible[]>([]);
  const [milestonePhotos, setMilestonePhotos] = useState<MilestonePhoto[]>([]);
  const [gamificationSettings, setGamificationSettings] = useState<GamificationSettings | null>(null);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Load all achievements (using community_achievements as template)
  const loadAchievements = useCallback(async () => {
    try {
      setLoading(true);
      // For now, create mock achievement templates since we don't have a proper achievements template table
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          name: 'First Steps',
          description: 'Take your very first steps with Yogic Mile',
          category: 'step_milestones',
          rarity: 'common',
          unlock_criteria: { daily_steps: 1 },
          icon_url: '🚶',
          animation_type: 'glow',
          coin_reward: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Thousand Steps',
          description: 'Achieve 1,000 steps in one day',
          category: 'step_milestones',
          rarity: 'common',
          unlock_criteria: { daily_steps: 1000 },
          icon_url: '🎯',
          animation_type: 'glow',
          coin_reward: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Week Warrior',
          description: 'Maintain a 7-day walking streak',
          category: 'streak_champions',
          rarity: 'uncommon',
          unlock_criteria: { streak_days: 7 },
          icon_url: '🔥',
          animation_type: 'glow',
          coin_reward: 150,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Friend Finder',
          description: 'Add your first friend',
          category: 'community_heroes',
          rarity: 'common',
          unlock_criteria: { friends_count: 1 },
          icon_url: '👥',
          animation_type: 'glow',
          coin_reward: 50,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load user achievements (using existing community_achievements)
  const loadUserAchievements = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('community_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our UserAchievement type
      const transformedData: UserAchievement[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        achievement_id: item.id, // Using same ID for now
        unlocked_date: item.unlocked_at,
        progress_percentage: 100, // Assume completed if in this table
        shared_count: 0,
        celebration_viewed: false,
        achievement: {
          id: item.id,
          name: item.achievement_name,
          description: item.description,
          category: item.achievement_type,
          rarity: 'common' as const,
          unlock_criteria: {},
          icon_url: item.badge_icon,
          animation_type: 'glow',
          coin_reward: item.coins_awarded || 0,
          created_at: item.unlocked_at,
          updated_at: item.unlocked_at
        }
      }));
      
      setUserAchievements(transformedData);
    } catch (error) {
      console.error('Error loading user achievements:', error);
    }
  }, []);

  // Load seasonal challenges
  const loadSeasonalChallenges = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('seasonal_challenges')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      setSeasonalChallenges(data || []);
    } catch (error) {
      console.error('Error loading seasonal challenges:', error);
    }
  }, []);

  // Load user challenge participation
  const loadUserChallengeParticipation = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('seasonal_challenge_participants')
        .select(`
          *,
          challenge:seasonal_challenges(*)
        `)
        .eq('user_id', user.id)
        .order('joined_date', { ascending: false });

      if (error) throw error;
      setUserChallengeParticipation(data || []);
    } catch (error) {
      console.error('Error loading user challenge participation:', error);
    }
  }, []);

  // Load collectibles
  const loadCollectibles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('collectibles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCollectibles((data || []) as Collectible[]);
    } catch (error) {
      console.error('Error loading collectibles:', error);
    }
  }, []);

  // Load user collectibles
  const loadUserCollectibles = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_collectibles')
        .select(`
          *,
          collectible:collectibles(*)
        `)
        .eq('user_id', user.id)
        .order('earned_date', { ascending: false });

      if (error) throw error;
      setUserCollectibles((data || []) as UserCollectible[]);
    } catch (error) {
      console.error('Error loading user collectibles:', error);
    }
  }, []);

  // Load gamification settings
  const loadGamificationSettings = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('gamification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create default settings
        const { data: newSettings, error: createError } = await supabase
          .from('gamification_settings')
          .insert({
            user_id: user.id,
            animation_enabled: true,
            celebration_style: 'full',
            sharing_preferences: { internal: true, external: false },
            reduced_motion: false,
            notification_preferences: { achievements: true, milestones: true, challenges: true }
          })
          .select()
          .single();

        if (createError) throw createError;
        setGamificationSettings(newSettings as GamificationSettings);
      } else {
        setGamificationSettings(data as GamificationSettings);
      }
    } catch (error) {
      console.error('Error loading gamification settings:', error);
    }
  }, []);

  // Load onboarding progress
  const loadOnboardingProgress = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create initial onboarding record
        const { data: newProgress, error: createError } = await supabase
          .from('onboarding_progress')
          .insert({
            user_id: user.id,
            steps_completed: [],
            current_step: 'welcome',
            completed: false
          })
          .select()
          .single();

        if (createError) throw createError;
        setOnboardingProgress(newProgress as OnboardingProgress);
      } else {
        setOnboardingProgress(data as OnboardingProgress);
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  }, []);

  // Join seasonal challenge
  const joinSeasonalChallenge = async (challengeId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to join challenges",
          variant: "destructive",
        });
        return;
      }

      // Check if already participating
      const { data: existingParticipation } = await supabase
        .from('seasonal_challenge_participants')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .single();

      if (existingParticipation) {
        toast({
          title: "Already Joined",
          description: "You're already participating in this challenge",
        });
        return;
      }

      // Insert participation
      const { error } = await supabase
        .from('seasonal_challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          progress: 0,
          completed: false
        });

      if (error) throw error;

      // Increment participant count
      const { data: challenge } = await supabase
        .from('seasonal_challenges')
        .select('participant_count')
        .eq('id', challengeId)
        .single();

      if (challenge) {
        await supabase
          .from('seasonal_challenges')
          .update({ 
            participant_count: (challenge.participant_count || 0) + 1 
          })
          .eq('id', challengeId);
      }

      await loadUserChallengeParticipation();
      await loadSeasonalChallenges();

      toast({
        title: "Challenge Joined! 🎯",
        description: "Start walking to make progress",
      });
    } catch (error) {
      console.error('Error joining challenge:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update challenge progress (called after daily steps are recorded)
  const updateChallengeProgress = async (stepsAdded: number) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Get active participations
      const { data: participations, error: fetchError } = await supabase
        .from('seasonal_challenge_participants')
        .select(`
          *,
          challenge:seasonal_challenges(*)
        `)
        .eq('user_id', user.id)
        .eq('completed', false);

      if (fetchError) throw fetchError;
      if (!participations || participations.length === 0) return;

      // Update progress for each active challenge
      for (const participation of participations) {
        const challenge = participation.challenge as any;
        if (!challenge) continue;

        // Check if challenge is still active
        const now = new Date();
        const endDate = new Date(challenge.end_date);
        if (now > endDate) continue;

        const newProgress = participation.progress + stepsAdded;
        const isCompleted = newProgress >= challenge.goal_target;

        // Update participation
        const { error: updateError } = await supabase
          .from('seasonal_challenge_participants')
          .update({
            progress: newProgress,
            completed: isCompleted,
            completion_date: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', participation.id);

        if (updateError) {
          console.error('Error updating challenge progress:', updateError);
          continue;
        }

        // If completed, award rewards
        if (isCompleted) {
          toast({
            title: "Challenge Completed! 🏆",
            description: `You've completed ${challenge.name}! Rewards: ${challenge.reward_description}`,
          });

          // Award coins if specified
          if (challenge.reward_coins > 0) {
            await supabase.from('transactions').insert({
              user_id: user.id,
              type: 'challenge_reward',
              amount: challenge.reward_coins,
              description: `Completed ${challenge.name}`
            });
          }
        }
      }

      // Reload participation data
      await loadUserChallengeParticipation();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  // Update gamification settings
  const updateGamificationSettings = async (updates: Partial<GamificationSettings>) => {
    try {
      const user = await getCurrentUser();
      if (!user || !gamificationSettings) return;

      const { error } = await supabase
        .from('gamification_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setGamificationSettings({ ...gamificationSettings, ...updates });

      toast({
        title: "Settings Updated",
        description: "Your gamification settings have been saved",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  // Complete onboarding step
  const completeOnboardingStep = async (step: string) => {
    try {
      const user = await getCurrentUser();
      if (!user || !onboardingProgress) return;

      const newStepsCompleted = [...onboardingProgress.steps_completed, step];
      const isCompleted = newStepsCompleted.length >= 5; // Assuming 5 steps total

      const { error } = await supabase
        .from('onboarding_progress')
        .update({
          steps_completed: newStepsCompleted,
          completed: isCompleted,
          completion_date: isCompleted ? new Date().toISOString() : null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await loadOnboardingProgress();

      if (isCompleted) {
        toast({
          title: "Onboarding Complete!",
          description: "Welcome to Yogic Mile! Start your walking journey.",
        });
      }
    } catch (error) {
      console.error('Error completing onboarding step:', error);
    }
  };

  // Check and award achievements
  const checkAchievements = async (userStats: {
    totalSteps?: number;
    dailySteps?: number;
    streakDays?: number;
    coinsEarned?: number;
    friendsCount?: number;
    forumPosts?: number;
    challengesCompleted?: number;
  }) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // This would typically be implemented as a more sophisticated system
      // checking various criteria and awarding achievements
      
      const potentialAchievements = achievements.filter(achievement => {
        const criteria = achievement.unlock_criteria;
        
        // Check if user already has this achievement
        const hasAchievement = userAchievements.some(ua => ua.achievement_id === achievement.id);
        if (hasAchievement) return false;

        // Check various criteria
        if (criteria.daily_steps && userStats.dailySteps && userStats.dailySteps >= criteria.daily_steps) return true;
        if (criteria.lifetime_steps && userStats.totalSteps && userStats.totalSteps >= criteria.lifetime_steps) return true;
        if (criteria.streak_days && userStats.streakDays && userStats.streakDays >= criteria.streak_days) return true;
        if (criteria.coins_earned && userStats.coinsEarned && userStats.coinsEarned >= criteria.coins_earned) return true;
        if (criteria.friends_count && userStats.friendsCount && userStats.friendsCount >= criteria.friends_count) return true;
        
        return false;
      });

      // Award new achievements
      for (const achievement of potentialAchievements) {
        await awardAchievement(achievement.id);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  // Award achievement
  const awardAchievement = async (achievementId: string) => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          progress_percentage: 100
        });

      if (error) throw error;

      await loadUserAchievements();

      const achievement = achievements.find(a => a.id === achievementId);
      if (achievement) {
        toast({
          title: "Achievement Unlocked! 🏆",
          description: `${achievement.name} - ${achievement.description}`,
        });
      }
    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  };

  // Set up real-time subscriptions (OPTIMIZED: Only user's participation)
  useEffect(() => {
    const getCurrentUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    };

    let participationChannel: any;
    let reloadTimeout: NodeJS.Timeout | null = null;

    const debouncedReload = () => {
      if (reloadTimeout) clearTimeout(reloadTimeout);
      reloadTimeout = setTimeout(() => {
        loadSeasonalChallenges();
        loadUserChallengeParticipation();
      }, 2000);
    };

    const setupSubscriptions = async () => {
      const userId = await getCurrentUserId();
      if (!userId) return;

      // Only subscribe to user's participation changes (removed global challenges subscription)
      participationChannel = supabase
        .channel('challenge-participation-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'seasonal_challenge_participants',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            debouncedReload(); // Debounce to batch updates
          }
        )
        .subscribe();
    };

    setupSubscriptions();

    return () => {
      if (reloadTimeout) clearTimeout(reloadTimeout);
      if (participationChannel) supabase.removeChannel(participationChannel);
    };
  }, [loadSeasonalChallenges, loadUserChallengeParticipation]);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadAchievements(),
        loadUserAchievements(),
        loadSeasonalChallenges(),
        loadUserChallengeParticipation(),
        loadCollectibles(),
        loadUserCollectibles(),
        loadGamificationSettings(),
        loadOnboardingProgress()
      ]);
    };

    initializeData();
  }, [
    loadAchievements,
    loadUserAchievements,
    loadSeasonalChallenges,
    loadUserChallengeParticipation,
    loadCollectibles,
    loadUserCollectibles,
    loadGamificationSettings,
    loadOnboardingProgress
  ]);

  return {
    // Data
    achievements,
    userAchievements,
    seasonalChallenges,
    userChallengeParticipation,
    collectibles,
    userCollectibles,
    milestonePhotos,
    gamificationSettings,
    onboardingProgress,
    loading,

    // Actions
    joinSeasonalChallenge,
    updateChallengeProgress,
    updateGamificationSettings,
    completeOnboardingStep,
    checkAchievements,
    awardAchievement,

    // Refresh functions
    loadAchievements,
    loadUserAchievements,
    loadSeasonalChallenges,
    loadUserChallengeParticipation,
    loadCollectibles,
    loadUserCollectibles,
    loadGamificationSettings,
    loadOnboardingProgress
  };
}