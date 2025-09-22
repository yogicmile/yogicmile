import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudRain, Sparkles, Heart, Calendar, Trophy, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface SeasonalChallenge {
  id: string;
  name: string;
  description: string;
  theme: string;
  month: string;
  icon: React.ReactNode;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed" | "expired";
  progress: {
    current: number;
    target: number;
    unit: string;
  };
  rewards: {
    exclusive: string;
    coins: number;
    badge: string;
  };
  participants: number;
  isJoined: boolean;
}

const mockChallenges: SeasonalChallenge[] = [
  {
    id: "monsoon_miles",
    name: "Monsoon Miles",
    description: "Stay active during the rainy season with indoor walking goals",
    theme: "Indoor walking focus during monsoon season",
    month: "September",
    icon: <CloudRain className="w-6 h-6" />,
    startDate: "2024-09-01",
    endDate: "2024-09-30",
    status: "active",
    progress: {
      current: 45000,
      target: 100000,
      unit: "steps"
    },
    rewards: {
      exclusive: "Monsoon Walker Badge",
      coins: 500,
      badge: "🌧️"
    },
    participants: 1247,
    isJoined: true,
  },
  {
    id: "festive_steps", 
    name: "Festive Steps",
    description: "Celebrate Diwali with community walking challenges",
    theme: "Diwali celebration theme with light-themed rewards",
    month: "October",
    icon: <Sparkles className="w-6 h-6" />,
    startDate: "2024-10-01", 
    endDate: "2024-10-31",
    status: "upcoming",
    progress: {
      current: 0,
      target: 150000,
      unit: "steps"
    },
    rewards: {
      exclusive: "Diwali Diya Badge",
      coins: 750,
      badge: "🪔"
    },
    participants: 0,
    isJoined: false,
  },
  {
    id: "gratitude_walks",
    name: "Gratitude Walks", 
    description: "Mindful walking with daily gratitude reflection",
    theme: "Mindfulness and gratitude theme",
    month: "November",
    icon: <Heart className="w-6 h-6" />,
    startDate: "2024-11-01",
    endDate: "2024-11-30", 
    status: "upcoming",
    progress: {
      current: 0,
      target: 120000,
      unit: "steps"
    },
    rewards: {
      exclusive: "Gratitude Guardian Badge",
      coins: 600,
      badge: "🙏"
    },
    participants: 0,
    isJoined: false,
  },
];

export function SeasonalChallengeTests() {
  const [challenges, setChallenges] = useState(mockChallenges);
  const [completedReward, setCompletedReward] = useState<string | null>(null);

  const joinChallenge = (id: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === id 
        ? { 
            ...challenge, 
            isJoined: true, 
            participants: challenge.participants + 1,
            status: challenge.status === "upcoming" ? "active" : challenge.status
          }
        : challenge
    ));
    
    toast({
      title: "Challenge Joined! 🎯",
      description: "You're now participating in the seasonal challenge",
    });
  };

  const leaveChallenge = (id: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === id 
        ? { 
            ...challenge, 
            isJoined: false, 
            participants: Math.max(0, challenge.participants - 1)
          }
        : challenge
    ));
  };

  const simulateProgress = (id: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === id && challenge.isJoined) {
        const increment = Math.floor(challenge.progress.target * 0.15);
        const newCurrent = Math.min(
          challenge.progress.target, 
          challenge.progress.current + increment
        );
        
        const wasCompleted = challenge.progress.current >= challenge.progress.target;
        const isNowCompleted = newCurrent >= challenge.progress.target;
        
        if (!wasCompleted && isNowCompleted) {
          setCompletedReward(id);
          setTimeout(() => setCompletedReward(null), 4000);
          
          toast({
            title: "Challenge Completed! 🏆",
            description: `You've earned the ${challenge.rewards.exclusive}!`,
          });
          
          return {
            ...challenge,
            progress: { ...challenge.progress, current: newCurrent },
            status: "completed" as const
          };
        }
        
        return {
          ...challenge,
          progress: { ...challenge.progress, current: newCurrent }
        };
      }
      return challenge;
    }));
  };

  const completeChallenge = (id: string) => {
    setChallenges(prev => prev.map(challenge => {
      if (challenge.id === id && challenge.isJoined) {
        setCompletedReward(id);
        setTimeout(() => setCompletedReward(null), 4000);
        
        toast({
          title: "Challenge Completed! 🏆", 
          description: `You've earned the ${challenge.rewards.exclusive}!`,
        });
        
        return {
          ...challenge,
          progress: { ...challenge.progress, current: challenge.progress.target },
          status: "completed" as const
        };
      }
      return challenge;
    }));
  };

  const resetChallenges = () => {
    setChallenges(mockChallenges);
    setCompletedReward(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "completed": return "bg-blue-500";
      case "upcoming": return "bg-yellow-500";
      case "expired": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Seasonal Challenges 2024</h2>
          <p className="text-muted-foreground">Limited-time events with exclusive rewards</p>
        </div>
        <Button onClick={resetChallenges} variant="outline">
          Reset All
        </Button>
      </div>

      <div className="grid gap-6">
        {challenges.map((challenge) => (
          <motion.div key={challenge.id} layout>
            <Card className={`relative overflow-hidden ${
              challenge.status === "completed" ? "border-primary bg-primary/5" : ""
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      challenge.status === "active" ? "bg-primary text-primary-foreground" :
                      challenge.status === "completed" ? "bg-green-500 text-white" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {challenge.icon}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {challenge.name}
                        <Badge className={`${getStatusColor(challenge.status)} text-white`}>
                          {challenge.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">{challenge.month}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{challenge.progress.current.toLocaleString()} {challenge.progress.unit}</span>
                        <span>{challenge.progress.target.toLocaleString()} {challenge.progress.unit}</span>
                      </div>
                      <Progress 
                        value={(challenge.progress.current / challenge.progress.target) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Rewards</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        <span>{challenge.rewards.exclusive}</span>
                        <span className="text-lg">{challenge.rewards.badge}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        <span>{challenge.rewards.coins} coins</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{challenge.participants.toLocaleString()} participants</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {challenge.isJoined ? (
                      <>
                        {challenge.status === "active" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => simulateProgress(challenge.id)}
                            >
                              Add Progress
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => completeChallenge(challenge.id)}
                            >
                              Complete
                            </Button>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => leaveChallenge(challenge.id)}
                        >
                          Leave
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={() => joinChallenge(challenge.id)}
                        disabled={challenge.status === "expired"}
                      >
                        Join Challenge
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>

              <AnimatePresence>
                {completedReward === challenge.id && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse" />
                    <div className="absolute top-4 right-4 text-3xl animate-bounce">
                      🏆
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-black/80 text-white px-4 py-2 rounded-lg"
                      >
                        Seasonal Reward Unlocked! {challenge.rewards.badge}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Seasonal Challenge Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Challenge Mechanics:</h4>
            <ul className="space-y-1">
              <li>✅ Time-limited events</li>
              <li>✅ Exclusive themed rewards</li>
              <li>✅ Community participation</li>
              <li>✅ Progress tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Reward System:</h4>
            <ul className="space-y-1">
              <li>✅ Unique seasonal badges</li>
              <li>✅ Bonus coin rewards</li>
              <li>✅ Completion celebrations</li>
              <li>✅ Limited availability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}