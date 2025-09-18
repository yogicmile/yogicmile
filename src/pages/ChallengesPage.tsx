import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Users, Calendar } from 'lucide-react';
import { SeasonalChallenges } from '@/components/challenges/SeasonalChallenges';
import { AchievementGallery } from '@/components/achievements/AchievementGallery';

export function ChallengesPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-warning" />
          <h1 className="text-3xl font-bold">Challenges & Achievements</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Take on seasonal challenges, unlock achievements, and earn exclusive rewards for your walking journey
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="seasonal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="seasonal" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Seasonal Challenges
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seasonal" className="space-y-6">
          <SeasonalChallenges />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementGallery />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        <Card className="text-center p-4">
          <Trophy className="w-6 h-6 mx-auto mb-2 text-warning" />
          <div className="text-xl font-bold">0</div>
          <div className="text-xs text-muted-foreground">Achievements</div>
        </Card>
        <Card className="text-center p-4">
          <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
          <div className="text-xl font-bold">0</div>
          <div className="text-xs text-muted-foreground">Challenges</div>
        </Card>
        <Card className="text-center p-4">
          <Users className="w-6 h-6 mx-auto mb-2 text-success" />
          <div className="text-xl font-bold">0</div>
          <div className="text-xs text-muted-foreground">Friends</div>
        </Card>
        <Card className="text-center p-4">
          <Badge className="mx-auto mb-2 bg-gradient-to-r from-primary to-primary/60">
            Common
          </Badge>
          <div className="text-xs text-muted-foreground">Highest Rarity</div>
        </Card>
      </div>
    </div>
  );
}