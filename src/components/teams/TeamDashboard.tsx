import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Users, Trophy, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface TeamDashboardProps {
  teamId: string;
}

export const TeamDashboard = ({ teamId }: TeamDashboardProps) => {
  const { data: team } = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("virtual_teams")
        .select("*")
        .eq("id", teamId)
        .single();
      if (error) throw error;
      return data;
    }
  });

  const { data: members } = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq("team_id", teamId)
        .order("contribution_steps", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  if (!team) {
    return <div className="text-center text-muted-foreground">Loading team...</div>;
  }

  const progressPercent = (team.team_progress_steps / team.team_goal_steps) * 100;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{team.name}</h2>
              {team.description && (
                <p className="text-muted-foreground">{team.description}</p>
              )}
            </div>
            <Trophy className="w-8 h-8 text-warning" />
          </div>

          {/* Team Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Team Goal</span>
              <span className="font-semibold text-foreground">
                {team.team_progress_steps.toLocaleString()} / {team.team_goal_steps.toLocaleString()} steps
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="text-xs text-muted-foreground text-right">
              {progressPercent.toFixed(1)}% complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{members?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-warning/10">
                <Target className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {((team.team_progress_steps / team.team_goal_steps) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Goal Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {members?.length ? Math.floor(team.team_progress_steps / members.length).toLocaleString() : 0}
                </div>
                <div className="text-sm text-muted-foreground">Avg per Member</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Leaderboard */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Team Leaderboard
          </h3>

          <div className="space-y-3">
            {members?.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors"
              >
                <div className="text-lg font-bold text-foreground w-8">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    {(member.profiles as any)?.display_name || "Anonymous"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {member.contribution_steps.toLocaleString()} steps
                  </div>
                </div>
                {member.role === "leader" && (
                  <Badge variant="outline" className="text-xs">Leader</Badge>
                )}
              </motion.div>
            ))}

            {!members?.length && (
              <div className="text-center text-muted-foreground py-8">
                No members yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
