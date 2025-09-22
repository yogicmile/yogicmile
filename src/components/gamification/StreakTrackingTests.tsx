import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Calendar, TrendingUp, AlertTriangle, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface StreakData {
  current: number;
  longest: number;
  lastActivityDate: string;
  isActive: boolean;
  streakBroken: boolean;
  weeklyGoal: number;
  weeklyProgress: number;
}

interface StreakMilestone {
  days: number;
  name: string;
  icon: string;
  unlocked: boolean;
}

const streakMilestones: StreakMilestone[] = [
  { days: 3, name: "Getting Started", icon: "🌱", unlocked: false },
  { days: 7, name: "Week Warrior", icon: "⚔️", unlocked: false },
  { days: 30, name: "Monthly Master", icon: "🎯", unlocked: false },
  { days: 100, name: "Century Champion", icon: "💯", unlocked: false },
  { days: 365, name: "Year Legend", icon: "👑", unlocked: false },
];

export function StreakTrackingTests() {
  const [streakData, setStreakData] = useState<StreakData>({
    current: 12,
    longest: 23,
    lastActivityDate: new Date().toISOString().split('T')[0],
    isActive: true,
    streakBroken: false,
    weeklyGoal: 5,
    weeklyProgress: 4,
  });

  const [milestones, setMilestones] = useState(streakMilestones);
  const [showBreakAnimation, setShowBreakAnimation] = useState(false);
  const [showMilestoneAnimation, setShowMilestoneAnimation] = useState<number | null>(null);

  const addDay = () => {
    setStreakData(prev => {
      const newCurrent = prev.current + 1;
      const newLongest = Math.max(prev.longest, newCurrent);
      
      // Check for milestone unlocks
      const unlockedMilestone = milestones.find(m => 
        !m.unlocked && newCurrent >= m.days
      );
      
      if (unlockedMilestone) {
        setMilestones(prev => prev.map(m => 
          m.days === unlockedMilestone.days ? { ...m, unlocked: true } : m
        ));
        
        setShowMilestoneAnimation(unlockedMilestone.days);
        setTimeout(() => setShowMilestoneAnimation(null), 3000);
        
        toast({
          title: `Streak Milestone Unlocked! ${unlockedMilestone.icon}`,
          description: `${unlockedMilestone.name} - ${unlockedMilestone.days} days!`,
        });
      }

      return {
        ...prev,
        current: newCurrent,
        longest: newLongest,
        lastActivityDate: new Date().toISOString().split('T')[0],
        isActive: true,
        streakBroken: false,
        weeklyProgress: Math.min(prev.weeklyGoal, prev.weeklyProgress + 1),
      };
    });
  };

  const missDay = () => {
    setStreakData(prev => ({
      ...prev,
      current: 0,
      lastActivityDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
      isActive: false,
      streakBroken: true,
    }));

    setShowBreakAnimation(true);
    setTimeout(() => setShowBreakAnimation(false), 2000);

    toast({
      title: "Streak Broken! 💔",
      description: "Don't worry, you can start a new streak tomorrow!",
      variant: "destructive",
    });
  };

  const resetStreak = () => {
    setStreakData({
      current: 0,
      longest: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      isActive: true,
      streakBroken: false,
      weeklyGoal: 5,
      weeklyProgress: 0,
    });
    
    setMilestones(streakMilestones);
    setShowBreakAnimation(false);
    setShowMilestoneAnimation(null);
  };

  const getStreakStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (streakData.lastActivityDate === today) {
      return { status: "active", color: "text-green-500", message: "On fire! 🔥" };
    } else if (streakData.lastActivityDate === yesterday) {
      return { status: "at_risk", color: "text-yellow-500", message: "Log today to keep your streak!" };
    } else {
      return { status: "broken", color: "text-red-500", message: "Streak broken - start fresh!" };
    }
  };

  const streakStatus = getStreakStatus();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Streak Tracking System</h2>
        <Button onClick={resetStreak} variant="outline">
          Reset Streak
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Streak Card */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${streakStatus.color}`} />
              Current Streak
            </CardTitle>
            <CardDescription>Daily activity tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <motion.div
                key={streakData.current}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold"
              >
                {streakData.current}
              </motion.div>
              
              <div className="space-y-2">
                <Badge className={streakStatus.color.replace('text-', 'bg-').replace('-500', '-500/10')}>
                  {streakStatus.message}
                </Badge>
                
                <p className="text-sm text-muted-foreground">
                  Last activity: {streakData.lastActivityDate}
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={addDay} className="flex-1">
                  Add Day
                </Button>
                <Button onClick={missDay} variant="destructive" className="flex-1">
                  Miss Day
                </Button>
              </div>
            </div>
          </CardContent>

          <AnimatePresence>
            {showBreakAnimation && (
              <motion.div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="text-6xl"
                >
                  💔
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{streakData.longest}</div>
                <div className="text-sm text-muted-foreground">Longest Streak</div>
              </div>
              
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {streakData.weeklyProgress}/{streakData.weeklyGoal}
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Weekly Progress</span>
                <span>{Math.round((streakData.weeklyProgress / streakData.weeklyGoal) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-primary h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(100, (streakData.weeklyProgress / streakData.weeklyGoal) * 100)}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Streak Milestones
          </CardTitle>
          <CardDescription>Unlock achievements as your streak grows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {milestones.map((milestone) => (
              <motion.div
                key={milestone.days}
                className={`relative text-center p-4 rounded-lg border transition-all ${
                  milestone.unlocked 
                    ? "bg-primary/10 border-primary/30" 
                    : streakData.current >= milestone.days
                    ? "bg-yellow-500/10 border-yellow-500/30"
                    : "bg-muted border-muted"
                }`}
                layout
              >
                <div className="space-y-2">
                  <div className="text-3xl">
                    {milestone.unlocked ? milestone.icon : "🔒"}
                  </div>
                  <div className="text-lg font-bold">{milestone.days}</div>
                  <div className="text-sm font-medium">{milestone.name}</div>
                  
                  {milestone.unlocked && (
                    <Badge className="bg-green-500 text-white">
                      Unlocked!
                    </Badge>
                  )}
                  
                  {!milestone.unlocked && streakData.current >= milestone.days && (
                    <Badge className="bg-yellow-500 text-white">
                      Ready!
                    </Badge>
                  )}
                </div>

                <AnimatePresence>
                  {showMilestoneAnimation === milestone.days && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 10, 0],
                          scale: [1, 1.2, 1, 1.2, 1]
                        }}
                        transition={{ duration: 1, repeat: 2 }}
                        className="text-4xl"
                      >
                        ✨
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Streak System Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Tracking:</h4>
            <ul className="space-y-1">
              <li>✅ Daily activity logging</li>
              <li>✅ Streak continuation rules</li>
              <li>✅ Break detection & reset</li>
              <li>✅ Weekly goal progress</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Motivation:</h4>
            <ul className="space-y-1">
              <li>✅ Milestone achievements</li>
              <li>✅ Visual celebrations</li>
              <li>✅ Progress statistics</li>
              <li>✅ Recovery encouragement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}