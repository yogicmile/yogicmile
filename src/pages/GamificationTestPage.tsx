import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementUnlockTests } from "@/components/gamification/AchievementUnlockTests";
import { BadgeGalleryTests } from "@/components/gamification/BadgeGalleryTests";
import { SeasonalChallengeTests } from "@/components/gamification/SeasonalChallengeTests";
import { StreakTrackingTests } from "@/components/gamification/StreakTrackingTests";
import { MultipleUnlockTests } from "@/components/gamification/MultipleUnlockTests";
import { ThresholdTests } from "@/components/gamification/ThresholdTests";

export default function GamificationTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Gamification System Testing</h1>
        <p className="text-muted-foreground">Test achievements, badges, and seasonal challenges</p>
      </div>

      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
          <TabsTrigger value="multiple">Multiple</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Unlock Tests (TC076)</CardTitle>
              <CardDescription>Test achievement unlock criteria and celebration animations</CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementUnlockTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Badge Gallery Tests (TC077)</CardTitle>
              <CardDescription>Test badge display and locked/unlocked states</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeGalleryTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonal">
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Challenge Tests (TC078)</CardTitle>
              <CardDescription>Test seasonal events and exclusive rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <SeasonalChallengeTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaks">
          <Card>
            <CardHeader>
              <CardTitle>Streak Tracking Tests (TC079-TC080)</CardTitle>
              <CardDescription>Test streak maintenance and breaking</CardDescription>
            </CardHeader>
            <CardContent>
              <StreakTrackingTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multiple">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Unlock Tests (TC082)</CardTitle>
              <CardDescription>Test simultaneous achievement processing</CardDescription>
            </CardHeader>
            <CardContent>
              <MultipleUnlockTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="thresholds">
          <Card>
            <CardHeader>
              <CardTitle>Threshold Tests (TC081-TC083)</CardTitle>
              <CardDescription>Test exact requirement thresholds and progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <ThresholdTests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}