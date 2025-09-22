import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Users, Zap, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
}

const mockAchievements: Achievement[] = [
  {
    id: "steps_5k",
    name: "5K Walker",
    description: "Walk 5,000 steps in a day",
    icon: <Target className="w-5 h-5" />,
    category: "Steps",
    requirement: 5000,
    currentProgress: 4800,
    unlocked: false,
  },
  {
    id: "coins_50",
    name: "Half Century",
    description: "Earn 50 coins",
    icon: <Star className="w-5 h-5" />,
    category: "Coins",
    requirement: 50,
    currentProgress: 48,
    unlocked: false,
  },
  {
    id: "friends_3",
    name: "Social Circle",
    description: "Add 3 friends",
    icon: <Users className="w-5 h-5" />,
    category: "Social",
    requirement: 3,
    currentProgress: 2,
    unlocked: false,
  },
  {
    id: "streak_5",
    name: "Consistent Walker",
    description: "Maintain 5-day streak",
    icon: <Zap className="w-5 h-5" />,
    category: "Streaks",
    requirement: 5,
    currentProgress: 4,
    unlocked: false,
  },
  {
    id: "challenges_1",
    name: "First Victory",
    description: "Complete your first challenge",
    icon: <Trophy className="w-5 h-5" />,
    category: "Challenges",
    requirement: 1,
    currentProgress: 0,
    unlocked: false,
  },
];

interface UnlockEvent {
  id: string;
  achievement: Achievement;
  timestamp: number;
}

export function MultipleUnlockTests() {
  const [achievements, setAchievements] = useState(mockAchievements);
  const [unlockQueue, setUnlockQueue] = useState<UnlockEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processUnlockQueue = () => {
    if (unlockQueue.length === 0) return;
    
    setIsProcessing(true);
    
    // Process all unlocks simultaneously
    const unlockedIds = unlockQueue.map(event => event.id);
    
    setAchievements(prev => prev.map(achievement => 
      unlockedIds.includes(achievement.id)
        ? { 
            ...achievement, 
            unlocked: true,
            currentProgress: achievement.requirement 
          }
        : achievement
    ));

    // Show combined toast notification
    const count = unlockQueue.length;
    const names = unlockQueue.map(e => e.achievement.name);
    
    toast({
      title: `${count} Achievements Unlocked! 🎉`,
      description: `${names.slice(0, 2).join(", ")}${count > 2 ? ` +${count - 2} more` : ""}`,
    });

    // Clear the queue after processing
    setTimeout(() => {
      setUnlockQueue([]);
      setIsProcessing(false);
    }, 3000);
  };

  const simulateMultipleProgress = () => {
    const readyAchievements = achievements.filter(a => 
      !a.unlocked && a.currentProgress >= a.requirement * 0.8
    );

    if (readyAchievements.length === 0) {
      toast({
        title: "No achievements ready",
        description: "Build up more progress first!",
        variant: "destructive",
      });
      return;
    }

    // Add multiple achievements to unlock queue
    const newUnlocks = readyAchievements.map(achievement => ({
      id: achievement.id,
      achievement,
      timestamp: Date.now(),
    }));

    setUnlockQueue(prev => [...prev, ...newUnlocks]);

    // Auto-process after a brief delay to simulate real-world scenario
    setTimeout(() => {
      processUnlockQueue();
    }, 500);
  };

  const unlockAll = () => {
    const lockedAchievements = achievements.filter(a => !a.unlocked);
    
    if (lockedAchievements.length === 0) {
      toast({
        title: "All unlocked!",
        description: "All achievements are already unlocked.",
      });
      return;
    }

    const allUnlocks = lockedAchievements.map(achievement => ({
      id: achievement.id,
      achievement,
      timestamp: Date.now(),
    }));

    setUnlockQueue(allUnlocks);
    processUnlockQueue();
  };

  const resetAchievements = () => {
    setAchievements(mockAchievements);
    setUnlockQueue([]);
    setIsProcessing(false);
  };

  const addProgress = (id: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === id && !achievement.unlocked) {
        const increment = Math.floor(achievement.requirement * 0.2);
        return {
          ...achievement,
          currentProgress: Math.min(
            achievement.requirement, 
            achievement.currentProgress + increment
          ),
        };
      }
      return achievement;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Multiple Unlock System</h2>
          <p className="text-muted-foreground">Test simultaneous achievement processing</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={simulateMultipleProgress}>
            Simulate Multiple
          </Button>
          <Button onClick={unlockAll} variant="outline">
            Unlock All
          </Button>
          <Button onClick={resetAchievements} variant="outline">
            Reset
          </Button>
        </div>
      </div>

      {/* Unlock Queue Display */}
      {unlockQueue.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Processing Unlocks ({unlockQueue.length})
            </CardTitle>
            <CardDescription>
              {isProcessing ? "Processing achievements..." : "Achievements ready to unlock"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {unlockQueue.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge className="flex items-center gap-1">
                    {event.achievement.icon}
                    {event.achievement.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
            
            {!isProcessing && (
              <Button onClick={processUnlockQueue} className="w-full">
                Process All Unlocks
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Achievement Grid */}
      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            layout
            className={`p-4 rounded-lg border transition-all ${
              achievement.unlocked 
                ? "bg-green-500/10 border-green-500/30" 
                : unlockQueue.some(u => u.id === achievement.id)
                ? "bg-yellow-500/10 border-yellow-500/30 animate-pulse"
                : "bg-card border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  achievement.unlocked 
                    ? "bg-green-500 text-white" 
                    : unlockQueue.some(u => u.id === achievement.id)
                    ? "bg-yellow-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {achievement.icon}
                </div>
                
                <div>
                  <h3 className="font-semibold">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  <Badge variant="secondary" className="mt-1">
                    {achievement.category}
                  </Badge>
                </div>
              </div>

              <div className="text-right space-y-2">
                <div className="text-sm font-medium">
                  {achievement.currentProgress} / {achievement.requirement}
                </div>
                <div className="w-32 bg-muted rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      achievement.unlocked 
                        ? "bg-green-500" 
                        : unlockQueue.some(u => u.id === achievement.id)
                        ? "bg-yellow-500"
                        : "bg-primary"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min(100, (achievement.currentProgress / achievement.requirement) * 100)}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                {!achievement.unlocked && !unlockQueue.some(u => u.id === achievement.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addProgress(achievement.id)}
                  >
                    Add Progress
                  </Button>
                )}

                {unlockQueue.some(u => u.id === achievement.id) && (
                  <Badge className="bg-yellow-500 text-white">
                    Queued for Unlock
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Multiple Unlock Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Processing:</h4>
            <ul className="space-y-1">
              <li>✅ Simultaneous unlock detection</li>
              <li>✅ Queue-based processing</li>
              <li>✅ Batch notifications</li>
              <li>✅ Atomic state updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">User Experience:</h4>
            <ul className="space-y-1">
              <li>✅ Visual unlock preview</li>
              <li>✅ Staggered animations</li>
              <li>✅ Combined toast messages</li>
              <li>✅ Progress preservation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}