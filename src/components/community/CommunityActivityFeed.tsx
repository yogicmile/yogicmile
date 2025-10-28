import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Trophy, Camera, Award, Flame, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface CommunityActivityFeedProps {
  communityId: string;
}

export const CommunityActivityFeed = ({ communityId }: CommunityActivityFeedProps) => {
  const { data: activities } = useQuery({
    queryKey: ["community-activity", communityId],
    queryFn: async () => {
      const { data: activityData, error } = await supabase
        .from("activity_feed")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      // Fetch user profiles separately
      if (!activityData) return [];
      const userIds = [...new Set(activityData.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      return activityData.map(activity => ({
        ...activity,
        profile: profileMap.get(activity.user_id)
      }));
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "challenge_completed":
        return <Trophy className="w-5 h-5 text-warning" />;
      case "photo_uploaded":
        return <Camera className="w-5 h-5 text-primary" />;
      case "achievement_unlocked":
        return <Award className="w-5 h-5 text-success" />;
      case "streak_milestone":
        return <Flame className="w-5 h-5 text-destructive" />;
      default:
        return <Trophy className="w-5 h-5 text-primary" />;
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.activity_type) {
      case "challenge_completed":
        return `completed a challenge`;
      case "photo_uploaded":
        return `shared a photo`;
      case "achievement_unlocked":
        return `unlocked an achievement`;
      case "streak_milestone":
        return `reached a ${activity.activity_data?.days}-day streak!`;
      default:
        return "was active";
    }
  };

  return (
    <div className="space-y-4">
      {activities?.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {activity.profile?.display_name?.charAt(0) || "W"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">
                        {activity.profile?.display_name || "Walker"}
                      </span>
                      <span className="text-muted-foreground"> {getActivityText(activity)}</span>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    {getActivityIcon(activity.activity_type)}
                  </div>

                  {/* Photo if present */}
                  {typeof activity.activity_data === 'object' && activity.activity_data && 'photo_url' in activity.activity_data && activity.activity_data.photo_url && (
                    <img
                      src={String(activity.activity_data.photo_url)}
                      alt="Activity"
                      className="w-full rounded-lg mb-3 max-h-64 object-cover"
                    />
                  )}

                  {/* Caption/Details */}
                  {typeof activity.activity_data === 'object' && activity.activity_data && 'caption' in activity.activity_data && activity.activity_data.caption && (
                    <p className="text-sm text-foreground mb-3">{String(activity.activity_data.caption)}</p>
                  )}

                  {/* Stats if present */}
                  {typeof activity.activity_data === 'object' && activity.activity_data && 'distance' in activity.activity_data && activity.activity_data.distance && (
                    <div className="flex gap-4 mb-3 text-sm text-muted-foreground">
                      <span>📍 {String(activity.activity_data.distance)}km</span>
                      {'duration' in activity.activity_data && activity.activity_data.duration && (
                        <span>⏱️ {String(activity.activity_data.duration)}</span>
                      )}
                      {'steps' in activity.activity_data && activity.activity_data.steps && (
                        <span>👣 {String(activity.activity_data.steps)} steps</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">
                        {typeof activity.activity_data === 'object' && activity.activity_data && 'likes' in activity.activity_data ? String(activity.activity_data.likes) : '0'}
                      </span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs">Cheer</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {!activities?.length && (
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No activity yet. Be the first to start walking!</p>
        </div>
      )}
    </div>
  );
};
