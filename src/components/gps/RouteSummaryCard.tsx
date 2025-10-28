import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, TrendingUp, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface RouteSummaryCardProps {
  route: {
    id: string;
    distance_km: number;
    duration_seconds: number;
    average_pace_min_per_km: number;
    elevation_gain_m?: number;
    calories_burned?: number;
    completed_at: string;
    route_thumbnail_url?: string;
  };
  onShare?: (routeId: string) => void;
  onView?: (routeId: string) => void;
}

export const RouteSummaryCard = ({ route, onShare, onView }: RouteSummaryCardProps) => {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  const formatPace = (pace: number) => {
    if (!pace || pace === 0) return "N/A";
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all cursor-pointer" onClick={() => onView?.(route.id)}>
        <CardContent className="p-0">
          {/* Thumbnail/Map Preview */}
          {route.route_thumbnail_url ? (
            <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 relative">
              <img src={route.route_thumbnail_url} alt="Route" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-primary/30" />
            </div>
          )}

          {/* Stats */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{route.distance_km.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">km</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{formatDuration(route.duration_seconds)}</div>
                <div className="text-xs text-muted-foreground">duration</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-foreground">{formatPace(route.average_pace_min_per_km)}</div>
                <div className="text-xs text-muted-foreground">pace</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="flex gap-2 flex-wrap">
              {route.elevation_gain_m && (
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {route.elevation_gain_m}m elevation
                </Badge>
              )}
              {route.calories_burned && (
                <Badge variant="secondary" className="text-xs">
                  🔥 {route.calories_burned} cal
                </Badge>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(route.completed_at), { addSuffix: true })}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(route.id);
                }}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
