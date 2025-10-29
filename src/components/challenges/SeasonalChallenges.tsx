import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trophy, Users, Target } from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';
import { SEASONAL_THEMES } from '@/types/gamification';
import { formatDistanceToNow } from 'date-fns';
import { ChallengeDetailModal } from './ChallengeDetailModal';

export function SeasonalChallenges() {
  const {
    seasonalChallenges,
    userChallengeParticipation,
    joinSeasonalChallenge,
    loading
  } = useGamification();

  const [timeRemaining, setTimeRemaining] = useState<Record<string, string>>({});
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // Update countdown timers
  useEffect(() => {
    const updateTimers = () => {
      const newTimeRemaining: Record<string, string> = {};
      
      seasonalChallenges.forEach(challenge => {
        const endTime = new Date(challenge.end_date).getTime();
        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            newTimeRemaining[challenge.id] = `${days}d ${hours}h`;
          } else if (hours > 0) {
            newTimeRemaining[challenge.id] = `${hours}h ${minutes}m`;
          } else {
            newTimeRemaining[challenge.id] = `${minutes}m`;
          }
        } else {
          newTimeRemaining[challenge.id] = 'Ended';
        }
      });

      setTimeRemaining(newTimeRemaining);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [seasonalChallenges]);

  const getThemeForChallenge = (theme: string) => {
    return SEASONAL_THEMES[theme as keyof typeof SEASONAL_THEMES] || SEASONAL_THEMES.monsoon;
  };

  const getUserParticipation = (challengeId: string) => {
    return userChallengeParticipation.find(p => p.challenge_id === challengeId);
  };

  const calculateProgress = (participation: any, goalTarget: number) => {
    if (!participation) return 0;
    return Math.min((participation.progress / goalTarget) * 100, 100);
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (seasonalChallenges.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
          <p className="text-muted-foreground">
            Check back soon for new seasonal challenges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Seasonal Challenges</h2>
        <p className="text-muted-foreground">
          Join themed walking challenges and earn exclusive rewards
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {seasonalChallenges.map(challenge => {
          const theme = getThemeForChallenge(challenge.theme);
          const participation = getUserParticipation(challenge.id);
          const progress = calculateProgress(participation, challenge.goal_target);
          const isParticipating = !!participation;
          const isCompleted = participation?.completed || false;
          
          return (
            <Card
              key={challenge.id}
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
                isParticipating 
                  ? 'border-primary/50 shadow-lg shadow-primary/10' 
                  : 'hover:border-primary/30'
              }`}
              onClick={() => setSelectedChallengeId(challenge.id)}
            >
              {/* Background Theme */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${theme.background} opacity-5`}
              />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{theme.icon}</span>
                      <CardTitle className="text-lg">{challenge.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {challenge.description}
                    </CardDescription>
                  </div>
                  
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-success text-success-foreground">
                      <Trophy className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>

                {/* Time Remaining */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{timeRemaining[challenge.id] || 'Loading...'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participant_count} joined</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Goal Target */}
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">
                    Goal: {challenge.goal_target.toLocaleString()} steps
                  </span>
                </div>

                {/* Progress (if participating) */}
                {isParticipating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {participation.progress.toLocaleString()} / {challenge.goal_target.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                )}

                {/* Rewards */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warning" />
                    Rewards
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {challenge.reward_description}
                  </p>
                </div>

                {/* Action Button */}
                {!isParticipating ? (
                  <Button 
                    onClick={() => joinSeasonalChallenge(challenge.id)}
                    className="w-full"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
                      color: 'white'
                    }}
                  >
                    Join Challenge
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {isCompleted ? 'Challenge Completed!' : 'Challenge Active'}
                  </Button>
                )}

                {/* Challenge Dates */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(challenge.start_date), { addSuffix: false })} ago - {formatDistanceToNow(new Date(challenge.end_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallengeId && (
        <ChallengeDetailModal
          open={!!selectedChallengeId}
          onOpenChange={(open) => !open && setSelectedChallengeId(null)}
          challengeId={selectedChallengeId}
        />
      )}
    </div>
  );
}