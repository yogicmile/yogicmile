import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Clock, MapPin, Camera, Copy, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface EnhancedChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description?: string;
    goal_type: string;
    target_value: number;
    difficulty_level: string;
    reward_type: string;
    requires_photo_proof: boolean;
    requires_gps_tracking: boolean;
    completion_count: number;
    end_date: string;
    creator_id: string;
  };
  userProgress?: number;
  isCreator?: boolean;
  onJoin?: (id: string) => void;
  onView?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const EnhancedChallengeCard = ({
  challenge,
  userProgress = 0,
  isCreator,
  onJoin,
  onView,
  onDuplicate,
  onEdit,
  onDelete,
}: EnhancedChallengeCardProps) => {
  const difficultyConfig = {
    easy: { stars: "⭐", color: "bg-success/10 text-success border-success/20" },
    medium: { stars: "⭐⭐", color: "bg-warning/10 text-warning border-warning/20" },
    hard: { stars: "⭐⭐⭐", color: "bg-destructive/10 text-destructive border-destructive/20" },
    extreme: { stars: "⭐⭐⭐⭐", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  };

  const rewardIcons = {
    coins: "🪙",
    badges: "🏆",
    collectibles: "💎",
    combo: "🎁",
  };

  const diff = difficultyConfig[challenge.difficulty_level as keyof typeof difficultyConfig] || difficultyConfig.medium;
  const progressPercent = (userProgress / challenge.target_value) * 100;
  const timeRemaining = formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true });

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">{challenge.title}</h3>
                {challenge.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
                )}
              </div>
              <Trophy className="w-6 h-6 text-warning flex-shrink-0 ml-2" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={diff.color}>
                {diff.stars} {challenge.difficulty_level}
              </Badge>
              <Badge variant="secondary">
                {challenge.goal_type}: {challenge.target_value.toLocaleString()}
              </Badge>
              <Badge variant="outline">
                {rewardIcons[challenge.reward_type as keyof typeof rewardIcons]} {challenge.reward_type}
              </Badge>
            </div>
          </div>

          {/* Stats & Features */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{challenge.completion_count} completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{timeRemaining}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="flex gap-2">
              {challenge.requires_photo_proof && (
                <Badge variant="outline" className="text-xs">
                  <Camera className="w-3 h-3 mr-1" />
                  Photo Required
                </Badge>
              )}
              {challenge.requires_gps_tracking && (
                <Badge variant="outline" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" />
                  GPS Tracking
                </Badge>
              )}
            </div>

            {/* Progress (if user joined) */}
            {userProgress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Progress</span>
                  <span className="font-semibold text-foreground">
                    {userProgress.toLocaleString()} / {challenge.target_value.toLocaleString()}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {isCreator ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => onEdit?.(challenge.id)} className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDuplicate?.(challenge.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete?.(challenge.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    onClick={() => userProgress > 0 ? onView?.(challenge.id) : onJoin?.(challenge.id)}
                    className="flex-1"
                    variant={userProgress > 0 ? "outline" : "default"}
                  >
                    {userProgress > 0 ? "View Progress" : "Join Challenge"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDuplicate?.(challenge.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
