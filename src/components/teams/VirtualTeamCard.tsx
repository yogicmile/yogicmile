import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, Trophy, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface VirtualTeamCardProps {
  team: {
    id: string;
    name: string;
    description?: string;
    max_members: number;
    team_goal_steps: number;
    team_progress_steps: number;
    walk_schedule?: any;
    member_count?: number;
  };
  onJoin?: (teamId: string) => void;
  onView?: (teamId: string) => void;
  isMember?: boolean;
}

export const VirtualTeamCard = ({ team, onJoin, onView, isMember }: VirtualTeamCardProps) => {
  const progressPercent = (team.team_progress_steps / team.team_goal_steps) * 100;
  const spotsLeft = team.max_members - (team.member_count || 0);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className="border-2 hover:border-primary/50 transition-all overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">{team.name}</h3>
                {team.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
                )}
              </div>
              <Trophy className="w-6 h-6 text-warning flex-shrink-0 ml-2" />
            </div>

            <div className="flex gap-2">
              <Badge variant="outline">
                <Users className="w-3 h-3 mr-1" />
                {team.member_count || 0}/{team.max_members}
              </Badge>
              {spotsLeft > 0 && spotsLeft <= 3 && (
                <Badge variant="secondary" className="text-warning">
                  {spotsLeft} spots left!
                </Badge>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Team Progress</span>
                <span className="font-semibold text-foreground">
                  {team.team_progress_steps.toLocaleString()} / {team.team_goal_steps.toLocaleString()} steps
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {progressPercent.toFixed(0)}% complete
              </div>
            </div>

            {/* Next Walk Schedule */}
            {team.walk_schedule && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/5 p-2 rounded">
                <Calendar className="w-4 h-4" />
                <span>Next walk: {team.walk_schedule.day} at {team.walk_schedule.time}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {isMember ? (
                <Button onClick={() => onView?.(team.id)} className="flex-1">
                  View Team
                </Button>
              ) : (
                <>
                  <Button onClick={() => onJoin?.(team.id)} className="flex-1" disabled={spotsLeft === 0}>
                    {spotsLeft === 0 ? "Team Full" : "Join Team"}
                  </Button>
                  <Button onClick={() => onView?.(team.id)} variant="outline">
                    Preview
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
