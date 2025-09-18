import React from 'react';
import { TrendingUp, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCoinRateSystem } from '@/hooks/use-coin-rate-system';

export function DynamicCoinRateDisplay() {
  const { 
    currentTierData, 
    dailySteps, 
    calculateBaseEarnings,
    isDailyCapExceeded,
    getUnlimitedStepsMessage 
  } = useCoinRateSystem();

  const todaysEarnings = calculateBaseEarnings(dailySteps);

  return (
    <div className="space-y-4">
      {/* Current Rate Display */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border-primary/20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <div className="text-2xl">{currentTierData.symbol}</div>
              <span>Current Rate</span>
            </h3>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {currentTierData.name}
            </Badge>
          </div>

          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">₹{todaysEarnings.rupeesEarned.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">{todaysEarnings.paisaEarned} paisa earned today</div>
            <div className="text-xs text-muted-foreground">
              {todaysEarnings.cappedSteps.toLocaleString()} steps = {todaysEarnings.units} units × {currentTierData.rate} paisa
            </div>
          </div>

          {!isDailyCapExceeded(dailySteps) && (
            <div className="text-xs text-success-600 bg-success-50 dark:bg-success-950/30 p-2 rounded-md border border-success-200 dark:border-success-800 mt-4">
              {getUnlimitedStepsMessage()}
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
                <span className="text-muted-foreground">Base Rate:</span>
                <span className="font-medium">{currentTierData.rate} paisa/25 steps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Cap:</span>
                <span className="font-medium text-success">UNLIMITED! 🎉</span>
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
              const earnings = calculateBaseEarnings(steps);
              return (
                <div key={steps} className="flex justify-between items-center bg-white/30 dark:bg-black/30 rounded-lg p-2">
                  <span className="text-sm text-muted-foreground">
                    {steps.toLocaleString()} steps
                  </span>
                  <span className="font-medium text-secondary">
                    ₹{earnings.rupeesEarned.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-3">
            <p className="text-xs text-muted-foreground">
              Based on {currentTierData.name} rate: {currentTierData.rate} paisa per 25 steps
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}