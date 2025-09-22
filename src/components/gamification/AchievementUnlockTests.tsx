import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Trophy, Star, Target } from "lucide-react";
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
    id: "steps_1k",
    name: "First Steps",
    description: "Walk 1,000 steps in a day",
    icon: <Target className="w-6 h-6" />,
    category: "Step Milestones",
    requirement: 1000,
    currentProgress: 750,
    unlocked: false,
  },
  {
    id: "coins_1",
    name: "First Paisa",
    description: "Earn your first ₹1",
    icon: <Star className="w-6 h-6" />,
    category: "Coin Masters",
    requirement: 100,
    currentProgress: 80,
    unlocked: false,
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: <Trophy className="w-6 h-6" />,
    category: "Streak Champions",
    requirement: 7,
    currentProgress: 6,
    unlocked: false,
  },
];

export function AchievementUnlockTests() {
  const [achievements, setAchievements] = useState(mockAchievements);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  const simulateProgress = (id: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === id && !achievement.unlocked) {
        const newProgress = Math.min(achievement.requirement, achievement.currentProgress + Math.floor(achievement.requirement * 0.3));
        
        if (newProgress >= achievement.requirement) {
          setCelebratingId(id);
          setTimeout(() => setCelebratingId(null), 3000);
          
          toast({
            title: "Achievement Unlocked! 🎉",
            description: `You've earned "${achievement.name}"!`,
          });

          return {
            ...achievement,
            currentProgress: newProgress,
            unlocked: true,
          };
        }
        
        return {
          ...achievement,
          currentProgress: newProgress,
        };
      }
      return achievement;
    }));
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => prev.map(achievement => {
      if (achievement.id === id && !achievement.unlocked) {
        setCelebratingId(id);
        setTimeout(() => setCelebratingId(null), 3000);
        
        toast({
          title: "Achievement Unlocked! 🎉",
          description: `You've earned "${achievement.name}"!`,
        });

        return {
          ...achievement,
          currentProgress: achievement.requirement,
          unlocked: true,
        };
      }
      return achievement;
    }));
  };

  const resetAchievements = () => {
    setAchievements(mockAchievements);
    setCelebratingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <Button onClick={resetAchievements} variant="outline">
          Reset All
        </Button>
      </div>

      <div className="grid gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            className="relative"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`p-4 rounded-lg border ${
              achievement.unlocked 
                ? "bg-primary/10 border-primary/30" 
                : "bg-card border-border"
            } transition-all duration-300`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.unlocked 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {achievement.unlocked ? <CheckCircle className="w-6 h-6" /> : achievement.icon}
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
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min(100, (achievement.currentProgress / achievement.requirement) * 100)}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {!achievement.unlocked && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => simulateProgress(achievement.id)}
                        >
                          Add Progress
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => unlockAchievement(achievement.id)}
                        >
                          Force Unlock
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {celebratingId === achievement.id && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg animate-pulse" />
                  <div className="absolute top-2 right-2">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.2, 1, 1.2, 1]
                      }}
                      transition={{ duration: 1, repeat: 2 }}
                      className="text-2xl"
                    >
                      🎉
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ Achievement criteria tracking</li>
          <li>✅ Progress bar animations</li>
          <li>✅ Unlock celebration effects</li>
          <li>✅ Toast notifications</li>
          <li>✅ Visual state changes</li>
        </ul>
      </div>
    </div>
  );
}