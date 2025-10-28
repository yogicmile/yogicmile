import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Milestone {
  id: string;
  name: string;
  description: string;
  target: number;
  reward: string;
  icon: string;
  is_unlocked: boolean;
}

interface MilestoneProgressProps {
  milestones: Milestone[];
  currentProgress: number;
  metric: string; // e.g., "steps", "km", "challenges"
}

export const MilestoneProgress = ({ milestones, currentProgress, metric }: MilestoneProgressProps) => {
  return (
    <Card className="border-2 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-bold text-foreground">Milestone Journey</h3>
        </div>

        <div className="space-y-8">
          {milestones.map((milestone, index) => {
            const progressToMilestone = Math.min((currentProgress / milestone.target) * 100, 100);
            const isActive = currentProgress < milestone.target && 
                           (index === 0 || milestones[index - 1].is_unlocked);
            const nextMilestone = !milestone.is_unlocked && isActive;

            return (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index > 0 && (
                  <div className={`absolute left-6 -top-8 w-0.5 h-8 ${
                    milestones[index - 1].is_unlocked ? 'bg-success' : 'bg-border'
                  }`} />
                )}

                <div className={`flex gap-4 p-4 rounded-lg border-2 transition-all ${
                  nextMilestone 
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                    : milestone.is_unlocked
                    ? 'border-success/30 bg-success/5'
                    : 'border-border bg-card'
                }`}>
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    milestone.is_unlocked 
                      ? 'bg-success/20' 
                      : nextMilestone
                      ? 'bg-primary/20'
                      : 'bg-muted'
                  }`}>
                    {milestone.is_unlocked ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </motion.div>
                    ) : nextMilestone ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {milestone.icon}
                      </motion.div>
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-bold text-foreground">{milestone.name}</h4>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                      <Badge variant={milestone.is_unlocked ? "default" : "secondary"} className="flex-shrink-0">
                        {milestone.target.toLocaleString()} {metric}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    {nextMilestone && (
                      <div className="space-y-1">
                        <Progress value={progressToMilestone} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{currentProgress.toLocaleString()} {metric}</span>
                          <span>{(milestone.target - currentProgress).toLocaleString()} to go</span>
                        </div>
                      </div>
                    )}

                    {/* Reward */}
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Reward: </span>
                      <span className={milestone.is_unlocked ? 'text-success font-semibold' : 'text-foreground'}>
                        {milestone.reward}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Overall Progress */}
        <div className="mt-6 p-4 rounded-lg bg-accent/5 border">
          <div className="text-sm text-muted-foreground mb-2">Overall Progress</div>
          <div className="text-2xl font-bold text-foreground">
            {currentProgress.toLocaleString()} <span className="text-base text-muted-foreground">{metric}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {milestones.filter(m => m.is_unlocked).length} of {milestones.length} milestones unlocked
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
