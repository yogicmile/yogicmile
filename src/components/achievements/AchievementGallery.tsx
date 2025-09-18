import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Lock, Star, Share, Award, Target } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';
import { ACHIEVEMENT_CATEGORIES, RARITY_STYLES } from '@/types/gamification';
import type { Achievement, UserAchievement } from '@/types/gamification';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  isLocked?: boolean;
}

function AchievementCard({ achievement, userAchievement, isLocked = false }: AchievementCardProps) {
  const rarityStyle = RARITY_STYLES[achievement.rarity];
  const category = ACHIEVEMENT_CATEGORIES[achievement.category as keyof typeof ACHIEVEMENT_CATEGORIES];
  const isUnlocked = !!userAchievement;
  const progress = userAchievement?.progress_percentage || 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card 
          className={`
            cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden
            ${isUnlocked 
              ? `border-2 ${rarityStyle.border} ${rarityStyle.glow} shadow-lg` 
              : 'border-muted/20 opacity-60 hover:opacity-80'
            }
          `}
        >
          {/* Rarity Background */}
          {isUnlocked && (
            <div className={`absolute inset-0 bg-gradient-to-br ${rarityStyle.background} opacity-10`} />
          )}
          
          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          <CardHeader className="relative pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category?.icon}</span>
                  <CardTitle className={`text-sm ${isUnlocked ? '' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </CardTitle>
                </div>
                <Badge 
                  variant={isUnlocked ? "secondary" : "outline"}
                  className={isUnlocked ? `bg-gradient-to-r ${rarityStyle.background} text-white border-0` : ''}
                >
                  {rarityStyle.name}
                </Badge>
              </div>
              
              {isUnlocked && (
                <Trophy className={`w-5 h-5 text-warning ${achievement.animation_type === 'glow' ? 'animate-pulse' : ''}`} />
              )}
            </div>
          </CardHeader>

          <CardContent className="relative space-y-3">
            <CardDescription className={`text-xs ${isUnlocked ? '' : 'text-muted-foreground/60'}`}>
              {achievement.description}
            </CardDescription>

            {/* Progress Bar (if in progress) */}
            {userAchievement && progress < 100 && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
            )}

            {/* Coin Reward */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Reward:</span>
              <span className="font-medium text-warning">
                {achievement.coin_reward} coins
              </span>
            </div>

            {/* Unlock Date */}
            {userAchievement && (
              <p className="text-xs text-muted-foreground">
                Unlocked {new Date(userAchievement.unlocked_date).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{category?.icon}</span>
            {achievement.name}
            {isUnlocked && <Trophy className="w-5 h-5 text-warning" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rarity and Category */}
          <div className="flex items-center gap-2">
            <Badge className={`bg-gradient-to-r ${rarityStyle.background} text-white border-0`}>
              {rarityStyle.name}
            </Badge>
            <Badge variant="outline">
              {category?.name}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            {achievement.description}
          </p>

          {/* Unlock Criteria */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Requirements
            </h4>
            <div className="bg-muted/50 rounded p-3 text-xs">
              {Object.entries(achievement.unlock_criteria).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace('_', ' ')}:</span>
                  <span className="font-medium">{value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reward */}
          <div className="flex items-center justify-between p-3 bg-warning/10 rounded">
            <span className="text-sm font-medium">Coin Reward:</span>
            <span className="text-sm font-bold text-warning">
              {achievement.coin_reward} coins
            </span>
          </div>

          {/* Progress (if applicable) */}
          {userAchievement && progress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          )}

          {/* Share Button (if unlocked) */}
          {isUnlocked && (
            <Button variant="outline" className="w-full">
              <Share className="w-4 h-4 mr-2" />
              Share Achievement
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AchievementGallery() {
  const { achievements, userAchievements, loading } = useGamification();
  const [activeCategory, setActiveCategory] = useState('all');

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId);
  };

  const filteredAchievements = achievements.filter(achievement => 
    activeCategory === 'all' || achievement.category === activeCategory
  );

  const achievementsByStatus = {
    unlocked: filteredAchievements.filter(a => getUserAchievement(a.id)),
    locked: filteredAchievements.filter(a => !getUserAchievement(a.id))
  };

  const stats = {
    totalUnlocked: userAchievements.length,
    totalAchievements: achievements.length,
    completionPercentage: achievements.length > 0 ? Math.round((userAchievements.length / achievements.length) * 100) : 0
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Achievement Gallery</h2>
          <p className="text-muted-foreground">
            Unlock achievements by completing various milestones
          </p>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalUnlocked}</div>
              <div className="text-xs text-muted-foreground">Unlocked</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalAchievements}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.completionPercentage}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <div className="max-w-md mx-auto space-y-2">
          <Progress value={stats.completionPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {stats.totalUnlocked} of {stats.totalAchievements} achievements unlocked
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
            <TabsTrigger key={key} value={key} className="text-xs">
              <span className="mr-1">{category.icon}</span>
              <span className="hidden lg:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-6">
          {/* Unlocked Achievements */}
          {achievementsByStatus.unlocked.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold">Unlocked ({achievementsByStatus.unlocked.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievementsByStatus.unlocked.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    userAchievement={getUserAchievement(achievement.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {achievementsByStatus.locked.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Locked ({achievementsByStatus.locked.length})</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {achievementsByStatus.locked.map(achievement => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isLocked
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredAchievements.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Achievements</h3>
                <p className="text-muted-foreground">
                  No achievements found in this category.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}