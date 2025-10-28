import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Share2, X } from "lucide-react";
import confetti from "canvas-confetti";

interface AnimatedRewardPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: {
    type: "badge" | "coins" | "collectible" | "achievement";
    title: string;
    description: string;
    icon?: string;
    amount?: number;
  };
  onShare?: () => void;
}

export const AnimatedRewardPopup = ({ open, onOpenChange, reward, onShare }: AnimatedRewardPopupProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (open) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#87CEEB"],
      });

      // Countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onOpenChange(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(5);
    }
  }, [open, onOpenChange]);

  const getRewardIcon = () => {
    if (reward.icon) return reward.icon;
    switch (reward.type) {
      case "badge":
        return "🏆";
      case "coins":
        return "🪙";
      case "collectible":
        return "💎";
      case "achievement":
        return "⭐";
      default:
        return "🎁";
    }
  };

  const getRewardColor = () => {
    switch (reward.type) {
      case "badge":
        return "from-warning/20 to-warning/5";
      case "coins":
        return "from-accent/20 to-accent/5";
      case "collectible":
        return "from-purple-500/20 to-purple-500/5";
      case "achievement":
        return "from-success/20 to-success/5";
      default:
        return "from-primary/20 to-primary/5";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-2 border-primary/20 overflow-hidden p-0">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`bg-gradient-to-br ${getRewardColor()} p-8 text-center relative`}
            >
              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-background/10 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Countdown */}
              <div className="absolute top-2 left-2 text-xs text-muted-foreground">
                Auto-close in {countdown}s
              </div>

              {/* Celebration text */}
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground mb-6"
              >
                🎉 Congratulations! 🎉
              </motion.h2>

              {/* Reward icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mb-6"
              >
                <div className="text-8xl inline-block">
                  {getRewardIcon()}
                </div>
              </motion.div>

              {/* Reward details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <h3 className="text-xl font-bold text-foreground">
                  {reward.title}
                  {reward.amount && (
                    <span className="ml-2 text-primary">+{reward.amount}</span>
                  )}
                </h3>
                <p className="text-muted-foreground">{reward.description}</p>
              </motion.div>

              {/* Sparkle effects */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-1/4 left-8 text-2xl"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute bottom-1/4 right-8 text-2xl"
              >
                ⭐
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex gap-2 mt-8"
              >
                {onShare && (
                  <Button
                    variant="outline"
                    onClick={onShare}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                )}
                <Button
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Awesome!
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
