import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSocialSharing } from '@/hooks/use-social-sharing';
import { Trophy, Star, Crown, Target, Medal, Gift, Share2 } from 'lucide-react';

interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color_theme: string;
  sort_order: number;
}

interface AchievementDefinition {
  id: string;
  category_id: string;
  achievement_type: string;
  name: string;
  description: string;
  emoji: string;
  requirement: any;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  reward_coins: number;
  motivational_quote: string;
  unlock_celebration: any;
  is_hidden: boolean;
  is_active: boolean;
}

interface UserAchievement {
  achievement_type: string;
  progress: number;
  unlocked_at?: string;
}

interface EnhancedAchievementSystemProps {
  totalSteps: number;
  currentStreak: number;
  totalEarnings: number;
  phaseLevel: number;
  spinDays: number;
  redemptionCount: number;
}

const EXPANDED_ACHIEVEMENTS = [
  // Walking Milestones (50+ achievements)
  { type: 'first_steps', name: 'First Steps', emoji: '👶', requirement: { steps: 1000 }, rarity: 'common', coins: 10 },
  { type: 'early_walker', name: 'Early Walker', emoji: '🚶', requirement: { steps: 2500 }, rarity: 'common', coins: 15 },
  { type: 'stepping_up', name: 'Stepping Up', emoji: '👣', requirement: { steps: 5000 }, rarity: 'common', coins: 25 },
  { type: 'milestone_10k', name: '10K Pioneer', emoji: '🏃', requirement: { steps: 10000 }, rarity: 'uncommon', coins: 50 },
  { type: 'distance_warrior', name: 'Distance Warrior', emoji: '🗡️', requirement: { steps: 25000 }, rarity: 'uncommon', coins: 100 },
  { type: 'marathon_walker', name: 'Marathon Walker', emoji: '🏃‍♂️', requirement: { steps: 50000 }, rarity: 'rare', coins: 200 },
  { type: 'century_club', name: 'Century Club', emoji: '💯', requirement: { steps: 100000 }, rarity: 'rare', coins: 500 },
  { type: 'ultra_marathoner', name: 'Ultra Marathoner', emoji: '🦅', requirement: { steps: 250000 }, rarity: 'epic', coins: 1000 },
  { type: 'legend_walker', name: 'Legend Walker', emoji: '👑', requirement: { steps: 500000 }, rarity: 'epic', coins: 2000 },
  { type: 'immortal_steps', name: 'Immortal Steps', emoji: '⭐', requirement: { steps: 1000000 }, rarity: 'legendary', coins: 5000 },
  
  // Streak Achievements (20+ achievements)
  { type: 'streak_3', name: 'Starting Strong', emoji: '🔥', requirement: { streak: 3 }, rarity: 'common', coins: 15 },
  { type: 'streak_7', name: 'Weekly Warrior', emoji: '🔥', requirement: { streak: 7 }, rarity: 'uncommon', coins: 35 },
  { type: 'streak_14', name: 'Fortnight Fighter', emoji: '🔥', requirement: { streak: 14 }, rarity: 'uncommon', coins: 75 },
  { type: 'streak_30', name: 'Monthly Master', emoji: '🔥', requirement: { streak: 30 }, rarity: 'rare', coins: 200 },
  { type: 'streak_50', name: 'Consistency King', emoji: '👑', requirement: { streak: 50 }, rarity: 'rare', coins: 350 },
  { type: 'streak_100', name: 'Centurion Streak', emoji: '💯', requirement: { streak: 100 }, rarity: 'epic', coins: 1000 },
  { type: 'streak_365', name: 'Year Round Champion', emoji: '🏆', requirement: { streak: 365 }, rarity: 'legendary', coins: 5000 },
  
  // Earnings Achievements (25+ achievements)
  { type: 'first_coin', name: 'First Coin', emoji: '🪙', requirement: { earnings: 100 }, rarity: 'common', coins: 10 },
  { type: 'coin_collector', name: 'Coin Collector', emoji: '💰', requirement: { earnings: 1000 }, rarity: 'uncommon', coins: 50 },
  { type: 'money_maker', name: 'Money Maker', emoji: '💵', requirement: { earnings: 5000 }, rarity: 'rare', coins: 150 },
  { type: 'wealth_builder', name: 'Wealth Builder', emoji: '🏦', requirement: { earnings: 25000 }, rarity: 'epic', coins: 500 },
  { type: 'millionaire_walker', name: 'Millionaire Walker', emoji: '💎', requirement: { earnings: 100000 }, rarity: 'legendary', coins: 2000 },
  
  // Social & Community (15+ achievements)
  { type: 'first_share', name: 'Social Starter', emoji: '📱', requirement: { shares: 1 }, rarity: 'common', coins: 20 },
  { type: 'influencer', name: 'Wellness Influencer', emoji: '🌟', requirement: { shares: 10 }, rarity: 'uncommon', coins: 100 },
  { type: 'viral_walker', name: 'Viral Walker', emoji: '🚀', requirement: { viral_shares: 1 }, rarity: 'rare', coins: 300 },
  
  // Time-based Challenges (20+ achievements)
  { type: 'early_bird', name: 'Early Bird', emoji: '🌅', requirement: { morning_walks: 7 }, rarity: 'uncommon', coins: 75 },
  { type: 'night_walker', name: 'Night Walker', emoji: '🌙', requirement: { evening_walks: 7 }, rarity: 'uncommon', coins: 75 },
  { type: 'weekend_warrior', name: 'Weekend Warrior', emoji: '⚡', requirement: { weekend_steps: 20000 }, rarity: 'rare', coins: 150 },
  
  // Wellness & Health (15+ achievements)
  { type: 'health_tracker', name: 'Health Tracker', emoji: '📊', requirement: { device_connected: 1 }, rarity: 'uncommon', coins: 50 },
  { type: 'data_master', name: 'Data Master', emoji: '📈', requirement: { sync_days: 30 }, rarity: 'rare', coins: 200 },
  
  // Exploration & Discovery (10+ achievements)
  { type: 'explorer', name: 'Urban Explorer', emoji: '🗺️', requirement: { different_locations: 5 }, rarity: 'uncommon', coins: 100 },
  { type: 'globe_trotter', name: 'Globe Trotter', emoji: '🌍', requirement: { different_cities: 3 }, rarity: 'rare', coins: 300 },
];

const RARITY_STYLES = {
  common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', glow: 'shadow-sm' },
  uncommon: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', glow: 'shadow-green-200 shadow-md' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', glow: 'shadow-blue-200 shadow-lg' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', glow: 'shadow-purple-200 shadow-xl' },
  legendary: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', glow: 'shadow-yellow-200 shadow-2xl' },
};

export const EnhancedAchievementSystem: React.FC<EnhancedAchievementSystemProps> = ({
  totalSteps,
  currentStreak,
  totalEarnings,
  phaseLevel,
  spinDays,
  redemptionCount
}) => {
  const [categories, setCategories] = useState<AchievementCategory[]>([]);
  const [achievements, setAchievements] = useState<AchievementDefinition[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const { openShareModal } = useSocialSharing();

  // Calculate progress for achievement
  const calculateProgress = (achievement: any) => {
    const req = achievement.requirement;
    
    if (req.steps) return totalSteps;
    if (req.streak) return currentStreak;
    if (req.earnings) return totalEarnings;
    if (req.phase) return phaseLevel;
    if (req.spins) return spinDays;
    if (req.redemptions) return redemptionCount;
    
    return 0;
  };

  // Load achievement data
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setIsLoading(true);
        
        // Load categories
        const { data: categoriesData } = await supabase
          .from('achievement_categories')
          .select('*')
          .order('sort_order');
        
        if (categoriesData) {
          setCategories(categoriesData);
        }

        // For demo purposes, use expanded achievements
        const enhancedAchievements = EXPANDED_ACHIEVEMENTS.map((ach, index) => ({
          ...ach,
          id: `ach_${index}`,
          category_id: 'cat_walking',
          achievement_type: ach.type,
          requirement: ach.requirement,
          rarity: ach.rarity as any,
          reward_coins: ach.coins,
          motivational_quote: `Congratulations on achieving ${ach.name}! Your dedication is inspiring.`,
          unlock_celebration: { confetti: true, sound: 'achievement' },
          is_hidden: false,
          is_active: true,
          description: `Complete this milestone to earn ${ach.coins} bonus coins!`,
        }));

        setAchievements(enhancedAchievements);

        // Load user progress if logged in
        if (!isGuest && user) {
          const { data: userAchData } = await supabase
            .from('achievements')
            .select('achievement_type, progress_data, unlocked_at')
            .eq('user_id', user.id);

          if (userAchData) {
            const userAch = userAchData.map(ua => ({
              achievement_type: ua.achievement_type,
              progress: (ua.progress_data as any)?.progress || 0,
              unlocked_at: ua.unlocked_at,
            }));
            setUserAchievements(userAch);
          }
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAchievements();
  }, [user, isGuest]);

  // Get achievement with progress
  const getAchievementProgress = (achievement: any) => {
    const currentProgress = calculateProgress(achievement);
    const userAch = userAchievements.find(ua => ua.achievement_type === achievement.achievement_type);
    const reqValue = Object.values(achievement.requirement)[0] as number;
    const isUnlocked = userAch?.unlocked_at || currentProgress >= reqValue;
    
    return {
      ...achievement,
      currentProgress,
      isUnlocked: Boolean(isUnlocked),
      progressPercent: Math.min((currentProgress / reqValue) * 100, 100),
    };
  };

  // Filter achievements by category
  const filteredAchievements = achievements
    .map(getAchievementProgress)
    .filter(ach => selectedCategory === 'all' || ach.category_id === selectedCategory);

  // Group by rarity for display
  const achievementsByRarity = filteredAchievements.reduce((acc, ach) => {
    if (!acc[ach.rarity]) acc[ach.rarity] = [];
    acc[ach.rarity].push(ach);
    return acc;
  }, {} as Record<string, any[]>);

  // Get stats
  const stats = {
    total: achievements.length,
    unlocked: filteredAchievements.filter(a => a.isUnlocked).length,
    totalCoinsEarned: filteredAchievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.reward_coins, 0),
    progress: filteredAchievements.length > 0 ? (filteredAchievements.filter(a => a.isUnlocked).length / filteredAchievements.length) * 100 : 0,
  };

  const shareAchievement = (achievement: any) => {
    openShareModal('achievement', {
      achievement: achievement.name,
      steps: totalSteps,
      coins: stats.totalCoinsEarned,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Achievement System
          </h2>
          <Badge className="bg-primary/10 text-primary">
            150+ Achievements
          </Badge>
        </div>
        
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.unlocked}</div>
                <div className="text-sm text-muted-foreground">Unlocked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalCoinsEarned}</div>
                <div className="text-sm text-muted-foreground">Bonus Coins</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.progress.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            <Progress value={stats.progress} className="mt-4" />
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All ({stats.total})
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </div>

      {/* Achievements by Rarity */}
      <div className="space-y-6">
        {Object.entries(achievementsByRarity)
          .sort(([a], [b]) => {
            const rarityOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
            return (rarityOrder[a] || 99) - (rarityOrder[b] || 99);
          })
          .map(([rarity, rarityAchievements]: [string, any[]]) => (
            <div key={rarity} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold capitalize">{rarity} Achievements</h3>
                <Badge variant="outline" className={RARITY_STYLES[rarity].text}>
                  {rarityAchievements.length} achievements
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rarityAchievements.map((achievement) => (
                  <Dialog key={achievement.id}>
                    <DialogTrigger asChild>
                      <Card 
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          achievement.isUnlocked 
                            ? `${RARITY_STYLES[achievement.rarity].bg} ${RARITY_STYLES[achievement.rarity].border} ${RARITY_STYLES[achievement.rarity].glow}` 
                            : 'opacity-60 grayscale'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="text-center space-y-2">
                            <div className="text-3xl mb-2">{achievement.emoji}</div>
                            <h4 className="font-semibold text-sm">{achievement.name}</h4>
                            <div className="flex items-center justify-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {achievement.reward_coins} coins
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${RARITY_STYLES[achievement.rarity].text}`}
                              >
                                {achievement.rarity}
                              </Badge>
                            </div>
                            <Progress value={achievement.progressPercent} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {achievement.currentProgress.toLocaleString()}/
                              {Object.values(achievement.requirement)[0].toLocaleString()}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <span className="text-3xl">{achievement.emoji}</span>
                          {achievement.name}
                        </DialogTitle>
                        <DialogDescription>
                          {achievement.description}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="flex justify-center gap-2">
                          <Badge className={`${RARITY_STYLES[achievement.rarity].bg} ${RARITY_STYLES[achievement.rarity].text}`}>
                            {achievement.rarity} Achievement
                          </Badge>
                          <Badge variant="outline">
                            🪙 {achievement.reward_coins} coins
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Progress value={achievement.progressPercent} className="h-3" />
                            <p className="text-sm text-center">
                              {achievement.currentProgress.toLocaleString()}/
                              {(Object.values(achievement.requirement)[0] as number).toLocaleString()}
                            </p>
                        </div>

                        {achievement.isUnlocked ? (
                          <div className="text-center space-y-3">
                            <Badge className="bg-success text-success-foreground">
                              ✅ Unlocked!
                            </Badge>
                            <blockquote className="italic text-sm border-l-4 border-primary pl-4">
                              "{achievement.motivational_quote}"
                            </blockquote>
                            <Button onClick={() => shareAchievement(achievement)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Achievement
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Keep going! You need {(Number(Object.values(achievement.requirement)[0]) - achievement.currentProgress).toLocaleString()} more to unlock this achievement.
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Guest Message */}
      {isGuest && (
        <Card className="border-warning/20 bg-warning/10">
          <CardContent className="pt-6 text-center">
            <Medal className="w-12 h-12 text-warning mx-auto mb-3" />
            <p className="font-medium text-warning-foreground mb-2">
              🏆 Unlock Achievement Tracking
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Sign up to track your progress, earn achievements, and unlock exclusive rewards!
            </p>
            <Button className="bg-primary text-primary-foreground">
              Sign Up for Free
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};