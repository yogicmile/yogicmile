import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Trophy, Star, Target, Users, Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedAt?: string;
  progress?: { current: number; total: number };
}

const mockBadges: BadgeData[] = [
  // Step Milestones
  {
    id: "steps_1k",
    name: "First Steps",
    description: "Walk 1,000 steps in a day",
    icon: <Target className="w-6 h-6" />,
    category: "steps",
    rarity: "common",
    unlocked: true,
    unlockedAt: "2024-01-15",
  },
  {
    id: "steps_10k",
    name: "Step Master",
    description: "Walk 10,000 steps in a day",
    icon: <Target className="w-6 h-6" />,
    category: "steps",
    rarity: "rare",
    unlocked: false,
    progress: { current: 7500, total: 10000 },
  },
  {
    id: "steps_lifetime_1m",
    name: "Million Steps",
    description: "Walk 1 million lifetime steps",
    icon: <Target className="w-6 h-6" />,
    category: "steps",
    rarity: "legendary",
    unlocked: false,
    progress: { current: 750000, total: 1000000 },
  },

  // Streak Champions
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain 7-day streak",
    icon: <Zap className="w-6 h-6" />,
    category: "streaks",
    rarity: "common",
    unlocked: true,
    unlockedAt: "2024-01-22",
  },
  {
    id: "streak_365",
    name: "Year Legend",
    description: "Maintain 365-day streak",
    icon: <Calendar className="w-6 h-6" />,
    category: "streaks",
    rarity: "legendary",
    unlocked: false,
    progress: { current: 45, total: 365 },
  },

  // Community Heroes
  {
    id: "friends_1",
    name: "Social Starter",
    description: "Add your first friend",
    icon: <Users className="w-6 h-6" />,
    category: "community",
    rarity: "common",
    unlocked: false,
  },
  {
    id: "friends_10",
    name: "Popular Walker",
    description: "Have 10 friends",
    icon: <Users className="w-6 h-6" />,
    category: "community",
    rarity: "rare",
    unlocked: false,
    progress: { current: 3, total: 10 },
  },

  // Coin Masters
  {
    id: "coins_100",
    name: "Coin Collector",
    description: "Earn ₹100",
    icon: <Star className="w-6 h-6" />,
    category: "coins",
    rarity: "epic",
    unlocked: false,
    progress: { current: 65, total: 100 },
  },
];

const categoryNames = {
  steps: "Step Milestones",
  streaks: "Streak Champions", 
  community: "Community Heroes",
  coins: "Coin Masters",
};

const rarityColors = {
  common: "bg-zinc-500",
  rare: "bg-blue-500", 
  epic: "bg-purple-500",
  legendary: "bg-yellow-500",
};

export function BadgeGalleryTests() {
  const [badges, setBadges] = useState(mockBadges);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "steps", "streaks", "community", "coins"];
  
  const filteredBadges = selectedCategory === "all" 
    ? badges 
    : badges.filter(badge => badge.category === selectedCategory);

  const unlockBadge = (id: string) => {
    setBadges(prev => prev.map(badge => 
      badge.id === id 
        ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] }
        : badge
    ));
  };

  const lockBadge = (id: string) => {
    setBadges(prev => prev.map(badge => 
      badge.id === id 
        ? { ...badge, unlocked: false, unlockedAt: undefined }
        : badge
    ));
  };

  const resetAll = () => {
    setBadges(mockBadges);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all" ? "All" : categoryNames[category as keyof typeof categoryNames]}
            </Button>
          ))}
        </div>
        <Button onClick={resetAll} variant="outline" size="sm">
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => (
          <motion.div
            key={badge.id}
            layout
            className={`relative p-4 rounded-lg border transition-all duration-300 ${
              badge.unlocked
                ? "bg-card border-primary/30 shadow-lg"
                : "bg-muted/30 border-muted"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {!badge.unlocked && (
              <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            <div className="text-center space-y-3">
              <div className={`relative inline-flex p-3 rounded-full ${
                badge.unlocked 
                  ? `${rarityColors[badge.rarity]} text-white`
                  : "bg-muted text-muted-foreground"
              }`}>
                {badge.icon}
                {badge.unlocked && (
                  <div className={`absolute -top-1 -right-1 w-4 h-4 ${rarityColors[badge.rarity]} rounded-full border-2 border-white`} />
                )}
              </div>

              <div>
                <h3 className={`font-semibold ${badge.unlocked ? "" : "text-muted-foreground"}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {badge.description}
                </p>
              </div>

              <div className="flex justify-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {badge.rarity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {categoryNames[badge.category as keyof typeof categoryNames]}
                </Badge>
              </div>

              {badge.progress && !badge.unlocked && (
                <div className="space-y-1">
                  <div className="text-xs font-medium">
                    {badge.progress.current.toLocaleString()} / {badge.progress.total.toLocaleString()}
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(badge.progress.current / badge.progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {badge.unlocked && badge.unlockedAt && (
                <div className="text-xs text-muted-foreground">
                  Unlocked: {badge.unlockedAt}
                </div>
              )}

              <div className="flex gap-2 justify-center">
                {badge.unlocked ? (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => lockBadge(badge.id)}
                  >
                    Lock
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => unlockBadge(badge.id)}
                  >
                    Unlock
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Gallery Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Display States:</h4>
            <ul className="space-y-1">
              <li>✅ Locked/Unlocked visual states</li>
              <li>✅ Rarity indicators</li>
              <li>✅ Category filtering</li>
              <li>✅ Progress tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Interactions:</h4>
            <ul className="space-y-1">
              <li>✅ Hover animations</li>
              <li>✅ Category switching</li>
              <li>✅ Manual unlock/lock</li>
              <li>✅ Responsive grid layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}