import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Target, Calendar, Zap, Users, Star, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EnhancedAchievementSystem } from '@/components/features/EnhancedAchievementSystem';
import { useYogicData } from '@/hooks/use-yogic-data';

const ACHIEVEMENT_CATEGORIES = [
  { id: 'steps', name: 'Step Goals', icon: Target, color: 'text-blue-600', count: 12 },
  { id: 'streaks', name: 'Streaks', icon: Calendar, color: 'text-green-600', count: 8 },
  { id: 'earnings', name: 'Earnings', icon: Zap, color: 'text-yellow-600', count: 6 },
  { id: 'social', name: 'Social', icon: Users, color: 'text-purple-600', count: 5 },
  { id: 'milestones', name: 'Milestones', icon: Star, color: 'text-red-600', count: 10 },
];

export function AchievementsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const { user, dailyProgress, wallet } = useYogicData();

  // Mock user stats for achievements  
  const userStats = {
    totalSteps: user.totalLifetimeSteps,
    currentStreak: user.currentStreak,
    totalEarnings: wallet.totalBalance,
    phaseLevel: user.currentPhase,
    spinDays: 7, // Mock spin days
    redemptionCount: 5 // Mock redemption count
  };

  const totalAchievements = ACHIEVEMENT_CATEGORIES.reduce((sum, cat) => sum + cat.count, 0);
  const unlockedAchievements = 23; // Mock unlocked count
  
  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Achievements
            </h1>
            <p className="text-muted-foreground">
              {unlockedAchievements}/{totalAchievements} unlocked • Track your wellness milestones
            </p>
          </div>
        </div>

        {/* Achievement Progress Summary */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary">Achievement Progress</h3>
                <p className="text-sm text-muted-foreground">Keep walking to unlock more!</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {Math.round((unlockedAchievements / totalAchievements) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
            <Progress 
              value={(unlockedAchievements / totalAchievements) * 100} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>{unlockedAchievements} achievements</span>
              <span>{totalAchievements - unlockedAchievements} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                <TabsTrigger value="locked">Locked</TabsTrigger>
              </TabsList>
              
              {/* Category Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ACHIEVEMENT_CATEGORIES.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <Card 
                      key={category.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/30"
                      onClick={() => setActiveCategory(category.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <IconComponent className={`w-6 h-6 mx-auto mb-2 ${category.color}`} />
                        <h4 className="font-semibold text-sm">{category.name}</h4>
                        <p className="text-xs text-muted-foreground">{category.count} achievements</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {Math.floor(Math.random() * category.count) + 1}/{category.count}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <TabsContent value="all">
                <EnhancedAchievementSystem {...userStats} />
              </TabsContent>
              
              <TabsContent value="unlocked">
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your Unlocked Achievements</h3>
                  <p className="text-muted-foreground mb-4">
                    Great job! You've unlocked {unlockedAchievements} achievements.
                  </p>
                  <EnhancedAchievementSystem {...userStats} />
                </div>
              </TabsContent>
              
              <TabsContent value="locked">
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Locked Achievements</h3>
                  <p className="text-muted-foreground mb-4">
                    Keep walking to unlock {totalAchievements - unlockedAchievements} more achievements!
                  </p>
                  <EnhancedAchievementSystem {...userStats} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Recent Unlocks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: '10K Steps Master', emoji: '🏃‍♂️', date: '2 days ago', rarity: 'Epic' },
              { name: '7 Day Streak', emoji: '🔥', date: '1 week ago', rarity: 'Rare' },
              { name: 'Early Bird Walker', emoji: '🌅', date: '2 weeks ago', rarity: 'Common' },
            ].map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.emoji}</div>
                  <div>
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
                <Badge 
                  variant={achievement.rarity === 'Epic' ? 'default' : 'secondary'}
                  className={achievement.rarity === 'Epic' ? 'bg-purple-100 text-purple-700' : ''}
                >
                  {achievement.rarity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Motivation Card */}
        <Card className="bg-gradient-to-r from-accent/20 to-accent/10 border-accent/30">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-accent mx-auto mb-3" />
            <h3 className="text-lg font-bold text-accent-foreground">Keep Going!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You're only {Math.floor(Math.random() * 1000) + 500} steps away from your next achievement.
            </p>
            <Button onClick={() => navigate('/')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Start Walking
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}