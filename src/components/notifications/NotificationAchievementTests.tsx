import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Users, Zap, Gift, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
}

interface NotificationEvent {
  id: string;
  type: "achievement" | "milestone" | "social" | "challenge" | "system";
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

const mockAchievements: Achievement[] = [
  {
    id: "steps_1k",
    name: "First Steps",
    description: "Walk 1,000 steps in a day",
    icon: <Target className="w-5 h-5" />,
    category: "Steps",
    rarity: "common",
    unlocked: false,
  },
  {
    id: "coins_100",
    name: "Century Earner",
    description: "Earn 100 coins",
    icon: <Star className="w-5 h-5" />,
    category: "Coins", 
    rarity: "rare",
    unlocked: false,
  },
  {
    id: "streak_30",
    name: "Monthly Master",
    description: "Maintain 30-day streak",
    icon: <Zap className="w-5 h-5" />,
    category: "Streaks",
    rarity: "epic",
    unlocked: false,
  },
  {
    id: "phase_complete",
    name: "Phase Legend",
    description: "Complete Phase Journey",
    icon: <Trophy className="w-5 h-5" />,
    category: "Journey",
    rarity: "legendary",
    unlocked: false,
  },
];

const notificationTemplates = {
  achievement: (name: string, rarity: string) => ({
    title: "Achievement Unlocked! 🏆",
    message: `Congratulations! You've unlocked "${name}" (${rarity})`,
  }),
  milestone: (steps: number) => ({
    title: "Milestone Reached! 🎯", 
    message: `Amazing! You've reached ${steps.toLocaleString()} steps today!`,
  }),
  social: (friend: string, action: string) => ({
    title: "Social Update 👥",
    message: `${friend} ${action}`,
  }),
  challenge: (challenge: string) => ({
    title: "New Challenge! 🏃‍♀️",
    message: `"${challenge}" is now available!`,
  }),
  system: (coins: number) => ({
    title: "Coins Added 💰",
    message: `Your ${coins} coins from yesterday have been added`,
  }),
};

export function NotificationAchievementTests() {
  const [achievements, setAchievements] = useState(mockAchievements);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [deliveryDelay, setDeliveryDelay] = useState(0); // 0 = immediate
  
  const createNotification = (type: keyof typeof notificationTemplates, data: any) => {
    const id = Date.now().toString();
    let notification: NotificationEvent;

    switch (type) {
      case "achievement":
        const template = notificationTemplates.achievement(data.name, data.rarity);
        notification = {
          id,
          type,
          title: template.title,
          message: template.message,
          timestamp: new Date(),
          data,
        };
        break;
      case "milestone":
        const milestoneTemplate = notificationTemplates.milestone(data.steps);
        notification = {
          id,
          type,
          title: milestoneTemplate.title,
          message: milestoneTemplate.message,
          timestamp: new Date(),
          data,
        };
        break;
      case "social":
        const socialTemplate = notificationTemplates.social(data.friend, data.action);
        notification = {
          id,
          type,
          title: socialTemplate.title,
          message: socialTemplate.message,
          timestamp: new Date(),
          data,
        };
        break;
      case "challenge":
        const challengeTemplate = notificationTemplates.challenge(data.challenge);
        notification = {
          id,
          type,
          title: challengeTemplate.title,
          message: challengeTemplate.message,
          timestamp: new Date(),
          data,
        };
        break;
      case "system":
        const systemTemplate = notificationTemplates.system(data.coins);
        notification = {
          id,
          type,
          title: systemTemplate.title,
          message: systemTemplate.message,
          timestamp: new Date(),
          data,
        };
        break;
    }

    // Simulate delivery delay if set
    if (deliveryDelay > 0) {
      setTimeout(() => {
        setNotifications(prev => [notification, ...prev]);
        toast({
          title: notification.title,
          description: notification.message,
        });
      }, deliveryDelay);
    } else {
      setNotifications(prev => [notification, ...prev]);
      toast({
        title: notification.title,
        description: notification.message,
      });
    }
  };

  const unlockAchievement = (id: string) => {
    const achievement = achievements.find(a => a.id === id);
    if (!achievement || achievement.unlocked) return;

    setAchievements(prev => prev.map(a => 
      a.id === id ? { ...a, unlocked: true } : a
    ));

    createNotification("achievement", {
      name: achievement.name,
      rarity: achievement.rarity,
      category: achievement.category,
    });
  };

  const simulateMilestone = () => {
    const steps = [5000, 10000, 15000, 20000][Math.floor(Math.random() * 4)];
    createNotification("milestone", { steps });
  };

  const simulateSocial = () => {
    const friends = ["Alice", "Bob", "Charlie", "Diana", "Eva"];
    const actions = [
      "accepted your friend request",
      "liked your achievement", 
      "commented on your post",
      "invited you to a challenge",
      "shared a route with you",
    ];
    
    const friend = friends[Math.floor(Math.random() * friends.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    createNotification("social", { friend, action });
  };

  const simulateChallenge = () => {
    const challenges = [
      "Monsoon Miles Challenge",
      "Festive Steps Marathon", 
      "Weekend Warrior Challenge",
      "Morning Walk Habit",
      "Neighborhood Explorer",
    ];
    
    const challenge = challenges[Math.floor(Math.random() * challenges.length)];
    createNotification("challenge", { challenge });
  };

  const simulateSystem = () => {
    const coins = Math.floor(Math.random() * 100) + 10;
    createNotification("system", { coins });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetAchievements = () => {
    setAchievements(mockAchievements);
    setNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "achievement": return <Trophy className="w-4 h-4 text-yellow-500" />;
      case "milestone": return <Target className="w-4 h-4 text-green-500" />;
      case "social": return <Users className="w-4 h-4 text-blue-500" />;
      case "challenge": return <Zap className="w-4 h-4 text-purple-500" />;
      case "system": return <Gift className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "text-gray-500";
      case "rare": return "text-blue-500";
      case "epic": return "text-purple-500";
      case "legendary": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Delivery Delay:</label>
            <select 
              value={deliveryDelay}
              onChange={(e) => setDeliveryDelay(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={0}>Immediate</option>
              <option value={500}>0.5s</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearNotifications}>
            Clear All
          </Button>
          <Button variant="outline" size="sm" onClick={resetAchievements}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievement Triggers */}
        <div className="space-y-4">
          <h3 className="font-semibold">Achievement Unlocks</h3>
          
          <div className="grid gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${
                  achievement.unlocked 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${achievement.unlocked ? "bg-green-500 text-white" : "bg-muted"}`}>
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{achievement.name}</div>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {achievement.category}
                        </Badge>
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {!achievement.unlocked && (
                    <Button
                      size="sm"
                      onClick={() => unlockAchievement(achievement.id)}
                    >
                      Unlock
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Other Notifications</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={simulateMilestone}>
                Step Milestone
              </Button>
              <Button variant="outline" size="sm" onClick={simulateSocial}>
                Social Update
              </Button>
              <Button variant="outline" size="sm" onClick={simulateChallenge}>
                New Challenge
              </Button>
              <Button variant="outline" size="sm" onClick={simulateSystem}>
                System Alert
              </Button>
            </div>
          </div>
        </div>

        {/* Notification Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Feed ({notifications.length})
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-3 bg-card border rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {notification.type}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {notifications.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2" />
              <p>No notifications yet</p>
              <p className="text-sm">Trigger achievements to see notifications</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Achievement Notification System:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Notification Types:</h4>
            <ul className="space-y-1">
              <li>✅ Achievement unlocks</li>
              <li>✅ Step milestones</li>
              <li>✅ Social interactions</li>
              <li>✅ Challenge announcements</li>
              <li>✅ System updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Delivery Features:</h4>
            <ul className="space-y-1">
              <li>✅ Immediate delivery</li>
              <li>✅ Configurable delays</li>
              <li>✅ Rich notification content</li>
              <li>✅ Type-specific icons</li>
              <li>✅ Timeline tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}