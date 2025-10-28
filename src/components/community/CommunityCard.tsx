import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Trophy, Flame, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description?: string;
    avatar_url?: string;
    banner_url?: string;
    member_count: number;
    total_distance_km: number;
    total_challenges_completed: number;
    streak_record_days: number;
    privacy_setting: string;
    theme_settings?: any;
  };
  isMember?: boolean;
  onJoin?: (id: string) => void;
  onView?: (id: string) => void;
}

export const CommunityCard = ({ community, isMember, onJoin, onView }: CommunityCardProps) => {
  const primaryColor = community.theme_settings?.primaryColor || "hsl(var(--primary))";

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
        {/* Banner */}
        <div 
          className="h-32 bg-gradient-to-br relative"
          style={{ 
            background: community.banner_url 
              ? `url(${community.banner_url})` 
              : `linear-gradient(135deg, ${primaryColor}, hsl(var(--secondary)))` 
          }}
        >
          {community.privacy_setting !== "public" && (
            <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
              <Lock className="w-3 h-3 mr-1" />
              {community.privacy_setting === "invite_only" ? "Invite Only" : "Private"}
            </Badge>
          )}
        </div>

        <CardContent className="pt-0 pb-4 -mt-12 relative z-10">
          {/* Avatar */}
          <div className="flex justify-center mb-3">
            <div 
              className="w-24 h-24 rounded-full border-4 border-background shadow-lg flex items-center justify-center text-3xl font-bold bg-primary text-primary-foreground"
              style={{ 
                backgroundImage: community.avatar_url ? `url(${community.avatar_url})` : undefined,
                backgroundSize: "cover"
              }}
            >
              {!community.avatar_url && community.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Name & Description */}
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-foreground mb-1">{community.name}</h3>
            {community.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>
            )}
          </div>

          {/* Stats with Progress Rings */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-1">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="hsl(var(--muted))"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke={primaryColor}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(community.total_distance_km / 1000) * 125.6} 125.6`}
                  />
                </svg>
                <MapPin className="w-5 h-5 absolute" style={{ color: primaryColor }} />
              </div>
              <div className="text-xs font-semibold text-foreground">{community.total_distance_km.toFixed(0)}km</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-1">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="hsl(var(--muted))"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="hsl(var(--warning))"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(community.total_challenges_completed / 50) * 125.6} 125.6`}
                  />
                </svg>
                <Trophy className="w-5 h-5 absolute text-warning" />
              </div>
              <div className="text-xs font-semibold text-foreground">{community.total_challenges_completed}</div>
              <div className="text-xs text-muted-foreground">Challenges</div>
            </div>

            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-1">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="hsl(var(--muted))"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="hsl(var(--destructive))"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(community.streak_record_days / 100) * 125.6} 125.6`}
                  />
                </svg>
                <Flame className="w-5 h-5 absolute text-destructive" />
              </div>
              <div className="text-xs font-semibold text-foreground">{community.streak_record_days}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>

          {/* Members Badge */}
          <div className="flex items-center justify-center gap-1 mb-4 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{community.member_count}</span> members
          </div>

          {/* Action Button */}
          <Button 
            onClick={() => isMember ? onView?.(community.id) : onJoin?.(community.id)}
            className="w-full"
            variant={isMember ? "outline" : "default"}
          >
            {isMember ? "View Community" : "Join Community"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
