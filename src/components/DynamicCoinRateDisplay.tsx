import React from 'react';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useYogicData } from '@/hooks/use-yogic-data';

export function DynamicCoinRateDisplay() {
  const yogicData = useYogicData();
  const currentPhase = yogicData.phases.currentPhase;
  const dailySteps = yogicData.dailyProgress.currentSteps;
  const coinsEarned = yogicData.dailyProgress.coinsEarnedToday;

  const cappedSteps = Math.min(dailySteps, 12000);
  const units = Math.floor(cappedSteps / 25);
  const isDailyCapExceeded = dailySteps > 12000;

  return (
    <div className="space-y-4">
      {/* Current Rate Display */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-primary/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="text-2xl">💎</div>
              <span>Current Phase</span>
            </h3>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Phase {currentPhase}
            </Badge>
          </div>

          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">₹{(coinsEarned / 100).toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">{coinsEarned} paisa earned today</div>
            <div className="text-xs text-muted-foreground">
              {cappedSteps.toLocaleString()} steps = {units} units × phase rate
            </div>
          </div>

          {isDailyCapExceeded ? (
            <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md border border-amber-200 dark:border-amber-800 mt-4">
              ⚠️ Daily limit reached! Steps beyond 12,000 won't earn coins but are still healthy.
            </div>
          ) : (
            <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md border border-blue-200 dark:border-blue-800 mt-4">
              📝 Daily earning limit: 12,000 steps. Steps beyond this won't earn coins but are still great for health!
            </div>
          )}

          {/* Rate Details */}
          <div className="mt-4 bg-white/20 dark:bg-black/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Rate Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Phase:</span>
                <span className="font-medium">Phase {currentPhase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Cap:</span>
                <span className="font-medium text-primary">12,000 steps</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Daily Potential Calculator */}
      <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-secondary" />
            <h3 className="font-semibold text-secondary">Daily Potential</h3>
          </div>

          <div className="space-y-3">
            {/* Examples */}
            {[8000, 10000, 12000].map((steps) => {
              const units = Math.floor(steps / 25);
              return (
                <div key={steps} className="flex justify-between items-center bg-white/30 dark:bg-black/30 rounded-lg p-2">
                  <span className="text-sm text-muted-foreground">
                    {steps.toLocaleString()} steps
                  </span>
                  <span className="font-medium text-secondary">
                    {units} units
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-3">
            <p className="text-xs text-muted-foreground">
              Every 25 steps = 1 unit. Earnings vary by phase.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}