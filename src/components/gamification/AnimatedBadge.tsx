import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface AnimatedBadgeProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon?: string;
    rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
    is_locked?: boolean;
  };
  onClick?: () => void;
}

const rarityStyles = {
  common: {
    bg: "from-slate-500/20 to-slate-500/5",
    glow: "shadow-slate-500/20",
    border: "border-slate-500/30",
    text: "text-slate-600"
  },
  uncommon: {
    bg: "from-green-500/20 to-green-500/5",
    glow: "shadow-green-500/20",
    border: "border-green-500/30",
    text: "text-green-600"
  },
  rare: {
    bg: "from-blue-500/20 to-blue-500/5",
    glow: "shadow-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-600"
  },
  epic: {
    bg: "from-purple-500/20 to-purple-500/5",
    glow: "shadow-purple-500/20",
    border: "border-purple-500/30",
    text: "text-purple-600"
  },
  legendary: {
    bg: "from-amber-500/20 to-amber-500/5",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/30",
    text: "text-amber-600"
  }
};

export const AnimatedBadge = ({ badge, onClick }: AnimatedBadgeProps) => {
  const style = rarityStyles[badge.rarity];

  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateY: badge.is_locked ? 0 : 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`border-2 ${style.border} ${style.glow} shadow-lg overflow-hidden relative`}>
        <CardContent className={`p-4 bg-gradient-to-br ${style.bg}`}>
          {/* Sparkle Effect for non-locked badges */}
          {!badge.is_locked && (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-2 right-2"
            >
              <Sparkles className={`w-4 h-4 ${style.text}`} />
            </motion.div>
          )}

          {/* Badge Icon */}
          <div className="text-center mb-3">
            <motion.div
              animate={badge.is_locked ? {} : {
                rotate: [0, -5, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`text-6xl inline-block ${badge.is_locked ? 'grayscale opacity-40' : ''}`}
            >
              {badge.is_locked ? "🔒" : (badge.icon || "🏆")}
            </motion.div>
          </div>

          {/* Badge Info */}
          <div className="text-center space-y-1">
            <Badge variant="outline" className={`text-xs ${style.text} ${style.border}`}>
              {badge.rarity}
            </Badge>
            <h4 className={`font-bold text-foreground ${badge.is_locked ? 'opacity-50' : ''}`}>
              {badge.name}
            </h4>
            <p className={`text-xs text-muted-foreground line-clamp-2 ${badge.is_locked ? 'opacity-50' : ''}`}>
              {badge.is_locked ? "Complete challenges to unlock" : badge.description}
            </p>
          </div>

          {/* Locked Overlay */}
          {badge.is_locked && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className="text-4xl">🔒</div>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
