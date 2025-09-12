import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  motivationalQuote: string;
}

const achievementDefinitions: Omit<Achievement, 'id' | 'currentProgress' | 'isUnlocked' | 'unlockedAt'>[] = [
  {
    type: 'first_steps',
    name: 'First Steps',
    description: 'Take your first 1,000 steps',
    emoji: '👶',
    requirement: 1000,
    motivationalQuote: 'Every journey begins with a single step. Well done on starting yours!'
  },
  {
    type: 'quick_starter',
    name: 'Quick Starter',
    description: 'Walk 5,000 steps in one day',
    emoji: '⚡',
    requirement: 5000,
    motivationalQuote: 'Speed and determination - you\'re off to a great start!'
  },
  {
    type: 'daily_streak_7',
    name: 'Weekly Walker',
    description: '7 consecutive days of walking',
    emoji: '🔥',
    requirement: 7,
    motivationalQuote: 'Consistency is key! Seven days of dedication shows real commitment.'
  },
  {
    type: 'daily_streak_14',
    name: 'Fortnight Fighter',
    description: '14 consecutive days of walking',
    emoji: '🔥',
    requirement: 14,
    motivationalQuote: 'Two weeks of dedication! You\'re building a habit that lasts.'
  },
  {
    type: 'daily_streak_30',
    name: 'Monthly Master',
    description: '30 consecutive days of walking',
    emoji: '🔥',
    requirement: 30,
    motivationalQuote: 'A month of mindful walking! You\'ve truly embraced the yogic way.'
  },
  {
    type: 'phase_upgrader',
    name: 'Phase Climber',
    description: 'Advance to the next phase',
    emoji: '📈',
    requirement: 1,
    motivationalQuote: 'Growth through movement! You\'ve earned your progression.'
  },
  {
    type: 'marathoner',
    name: 'Marathoner',
    description: 'Walk 100,000 cumulative steps',
    emoji: '🏃',
    requirement: 100000,
    motivationalQuote: 'Like a marathon runner, you\'ve shown incredible endurance!'
  },
  {
    type: 'big_earner',
    name: 'Coin Collector',
    description: 'Earn ₹100 in total rewards',
    emoji: '💰',
    requirement: 10000, // 10000 paisa = ₹100
    motivationalQuote: 'Your steps are paying off! You\'ve earned your first major milestone.'
  },
  {
    type: 'spin_master',
    name: 'Spin Master',
    description: 'Use the spin wheel for 7 days',
    emoji: '🎡',
    requirement: 7,
    motivationalQuote: 'Lucky and consistent! You\'ve mastered the art of the daily spin.'
  },
  {
    type: 'wallet_redeemer',
    name: 'Redemption Expert',
    description: 'Complete 5 reward redemptions',
    emoji: '🛒',
    requirement: 5,
    motivationalQuote: 'Smart spender! You know how to turn steps into rewards.'
  }
];

interface AchievementSystemProps {
  totalSteps: number;
  currentStreak: number;
  totalEarnings: number;
  phaseLevel: number;
  spinDays: number;
  redemptionCount: number;
}

export const AchievementSystem: React.FC<AchievementSystemProps> = ({
  totalSteps,
  currentStreak,
  totalEarnings,
  phaseLevel,
  spinDays,
  redemptionCount
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  // Calculate current progress for each achievement
  const calculateProgress = (achievement: Omit<Achievement, 'id' | 'currentProgress' | 'isUnlocked' | 'unlockedAt'>) => {
    switch (achievement.type) {
      case 'first_steps':
      case 'marathoner':
        return totalSteps;
      case 'quick_starter':
        return totalSteps; // This should check daily max, but simplified for now
      case 'daily_streak_7':
      case 'daily_streak_14':
      case 'daily_streak_30':
        return currentStreak;
      case 'phase_upgrader':
        return phaseLevel - 1; // Phase levels start at 1, so subtract 1
      case 'big_earner':
        return totalEarnings;
      case 'spin_master':
        return spinDays;
      case 'wallet_redeemer':
        return redemptionCount;
      default:
        return 0;
    }
  };

  // Load achievements from database and check for new unlocks
  useEffect(() => {
    const loadAchievements = async () => {
      if (isGuest) {
        // For guest users, show achievements but all locked
        const guestAchievements = achievementDefinitions.map((def, index) => ({
          ...def,
          id: `guest_${index}`,
          currentProgress: calculateProgress(def),
          isUnlocked: false,
        }));
        setAchievements(guestAchievements);
        return;
      }

      if (!user) return;

      try {
        // Fetch existing achievements
        const { data: existingAchievements } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id);

        const updatedAchievements = achievementDefinitions.map((def, index) => {
          const existing = existingAchievements?.find(a => a.achievement_type === def.type);
          const currentProgress = calculateProgress(def);
          const isUnlocked = existing ? true : currentProgress >= def.requirement;

          return {
            ...def,
            id: existing?.id || `new_${index}`,
            currentProgress,
            isUnlocked,
            unlockedAt: existing?.unlocked_at,
          };
        });

        // Check for newly unlocked achievements
        const newUnlocks = updatedAchievements.filter(achievement => 
          achievement.isUnlocked && 
          !existingAchievements?.find(a => a.achievement_type === achievement.type) &&
          achievement.currentProgress >= achievement.requirement
        );

        // Save newly unlocked achievements to database
        for (const achievement of newUnlocks) {
          await supabase.from('achievements').insert({
            user_id: user.id,
            achievement_type: achievement.type,
            achievement_name: achievement.name,
            description: achievement.description,
            emoji: achievement.emoji,
            progress_data: {
              requirement: achievement.requirement,
              progress: achievement.currentProgress
            }
          });
        }

        if (newUnlocks.length > 0) {
          setNewlyUnlocked(newUnlocks);
          // Show celebration for first new achievement
          toast({
            title: `🎉 Achievement Unlocked!`,
            description: `${newUnlocks[0].emoji} ${newUnlocks[0].name}`,
          });
        }

        setAchievements(updatedAchievements);
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    };

    loadAchievements();
  }, [user, isGuest, totalSteps, currentStreak, totalEarnings, phaseLevel, spinDays, redemptionCount]);

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min((achievement.currentProgress / achievement.requirement) * 100, 100);
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">🏆 Achievements</h3>
        <Badge variant="secondary">
          {unlockedCount}/{achievements.length} Unlocked
        </Badge>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {achievements.map((achievement) => (
          <Dialog key={achievement.id}>
            <DialogTrigger asChild>
              <Card 
                className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                  achievement.isUnlocked 
                    ? 'bg-gradient-to-br from-tier-1-paisa/10 to-tier-2-coin/10 border-tier-1-paisa/30' 
                    : 'opacity-60 grayscale'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.emoji}</div>
                  <h4 className="font-semibold text-sm mb-1">{achievement.name}</h4>
                  <Progress 
                    value={getProgressPercentage(achievement)} 
                    className="h-2 mb-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {achievement.currentProgress.toLocaleString()}/{achievement.requirement.toLocaleString()}
                  </p>
                </div>
              </Card>
            </DialogTrigger>
            
            <DialogContent className="text-center">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-center gap-2">
                  <span className="text-3xl">{achievement.emoji}</span>
                  {achievement.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-muted-foreground">{achievement.description}</p>
                
                <div className="space-y-2">
                  <Progress value={getProgressPercentage(achievement)} className="h-3" />
                  <p className="text-sm">
                    Progress: {achievement.currentProgress.toLocaleString()}/{achievement.requirement.toLocaleString()}
                  </p>
                </div>

                {achievement.isUnlocked && (
                  <>
                    <Badge className="bg-success text-success-foreground">
                      ✅ Unlocked!
                    </Badge>
                    <blockquote className="italic text-sm border-l-4 border-tier-1-paisa pl-4">
                      "{achievement.motivationalQuote}"
                    </blockquote>
                    {achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}

                {!achievement.isUnlocked && (
                  <p className="text-sm text-muted-foreground">
                    Keep going! You're {(achievement.requirement - achievement.currentProgress).toLocaleString()} away from unlocking this achievement.
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Guest Mode Message */}
      {isGuest && (
        <Card className="p-4 bg-warning/10 border-warning/20">
          <div className="text-center">
            <p className="text-sm text-warning-foreground">
              🎯 Sign up to unlock achievements and track your progress!
            </p>
          </div>
        </Card>
      )}

      {/* Celebration Modal for New Achievements */}
      {newlyUnlocked.length > 0 && (
        <Dialog open={newlyUnlocked.length > 0} onOpenChange={() => setNewlyUnlocked([])}>
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle>🎉 Achievement Unlocked!</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-6xl">{newlyUnlocked[0].emoji}</div>
              <h3 className="text-2xl font-bold">{newlyUnlocked[0].name}</h3>
              <p className="text-muted-foreground">{newlyUnlocked[0].description}</p>
              <blockquote className="italic border-l-4 border-tier-1-paisa pl-4">
                "{newlyUnlocked[0].motivationalQuote}"
              </blockquote>
              
              <div className="flex gap-2 justify-center">
                <Button onClick={() => setNewlyUnlocked([])}>
                  Continue
                </Button>
                <Button variant="outline">
                  Share Achievement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};