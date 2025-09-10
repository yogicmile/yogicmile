import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Clock, Target, Gift, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DynamicCoinRateDisplayProps {
  currentRate: {
    baseRate: number;
    effectiveRate: number;
    totalMultiplier: number;
    activeBonuses: string[];
  };
  currentTier: {
    tier: number;
    symbol: string;
    name: string;
    rate: number;
  };
  nextTier?: {
    tier: number;
    symbol: string;
    name: string;
    rate: number;
  };
  dailyPotential: {
    steps: number;
    coins: number;
    rupees: number;
  };
  tierProgress: number;
  className?: string;
}

export const DynamicCoinRateDisplay: React.FC<DynamicCoinRateDisplayProps> = ({
  currentRate,
  currentTier,
  nextTier,
  dailyPotential,
  tierProgress,
  className = ""
}) => {
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [rateHistory, setRateHistory] = useState<number[]>([1, 1, 2]); // Mock history
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorSteps, setCalculatorSteps] = useState(5000);

  useEffect(() => {
    const animationTimer = setInterval(() => {
      setCoinAnimation(prev => !prev);
    }, 2000);

    return () => clearInterval(animationTimer);
  }, []);

  const calculateCustomEarnings = (steps: number) => {
    return Math.floor((steps / 100) * currentRate.effectiveRate);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Rate Display */}
      <Card className="bg-gradient-to-br from-golden-accent/20 via-golden-accent/10 to-warm-coral/20 border-golden-accent/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="text-8xl transform rotate-12">{currentTier.symbol}</div>
        </div>
        
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-golden-accent flex items-center gap-2">
              <div className={`transition-transform duration-300 ${coinAnimation ? 'scale-110 rotate-12' : 'scale-100'}`}>
                🪙
              </div>
              <span>Current Rate</span>
            </h3>
            <Badge variant="secondary" className="bg-golden-accent/20 text-golden-accent">
              {currentTier.name}
            </Badge>
          </div>

          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-golden-accent mb-2 flex items-center justify-center gap-2">
              {currentRate.effectiveRate.toFixed(1)}
              <span className="text-lg">paisa</span>
            </div>
            <p className="text-sm text-muted-foreground">per 100 steps</p>
            
            {currentRate.totalMultiplier > 1 && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-warm-coral/20 text-warm-coral border-warm-coral/30">
                  {currentRate.totalMultiplier.toFixed(1)}x Active Bonus
                </Badge>
              </div>
            )}
          </div>

          {/* Active Bonuses */}
          {currentRate.activeBonuses.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-golden-accent">Active Bonuses:</h4>
              {currentRate.activeBonuses.map((bonus, index) => (
                <div key={index} className="flex items-center gap-2 text-xs bg-white/30 rounded-lg p-2">
                  <Zap className="w-3 h-3 text-warm-coral" />
                  <span className="text-muted-foreground">{bonus}</span>
                </div>
              ))}
            </div>
          )}

          {/* Rate History */}
          <div className="mt-4 bg-white/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-sage-green" />
              <span className="text-sm font-medium text-sage-green">Rate History</span>
            </div>
            <div className="flex items-center gap-2">
              {rateHistory.map((rate, index) => (
                <React.Fragment key={index}>
                  <span className={`text-xs px-2 py-1 rounded ${
                    index === rateHistory.length - 1 
                      ? 'bg-golden-accent text-white font-bold' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {rate}
                  </span>
                  {index < rateHistory.length - 1 && (
                    <span className="text-xs text-muted-foreground">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Started at {rateHistory[0]}, now earning {currentRate.baseRate} paisa!
            </p>
          </div>
        </div>
      </Card>

      {/* Next Tier Preview & Daily Potential */}
      <div className="grid gap-4">
        {nextTier && (
          <Card className="bg-gradient-to-br from-serene-blue/10 to-deep-teal/10 border-serene-blue/20">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{nextTier.symbol}</div>
                <div>
                  <h3 className="font-semibold text-serene-blue">{nextTier.name}</h3>
                  <p className="text-xs text-muted-foreground">Next Tier</p>
                </div>
                <div className="ml-auto">
                  <div className="text-lg font-bold text-serene-blue">
                    {nextTier.rate} paisa
                  </div>
                  <p className="text-xs text-muted-foreground">per 100 steps</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progress to unlock</span>
                  <span className="font-medium text-serene-blue">{tierProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-serene-blue to-deep-teal rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                <p className="text-xs text-serene-blue font-medium">
                  ⬆️ Keep walking to unlock {Math.round(((nextTier.rate / currentTier.rate) - 1) * 100)}% more coins!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Daily Potential */}
        <Card className="bg-gradient-to-br from-soft-lavender/10 to-warm-coral/10 border-soft-lavender/20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-soft-lavender flex items-center gap-2">
                <Target className="w-4 h-4" />
                Daily Potential
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-xs"
              >
                Calculator
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-soft-lavender">
                  {dailyPotential.steps.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">target steps</div>
              </div>
              <div className="bg-white/30 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-warm-coral">
                  ₹{dailyPotential.rupees.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">potential earnings</div>
              </div>
            </div>

            {showCalculator && (
              <div className="bg-white/40 rounded-lg p-3 border border-soft-lavender/30">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={calculatorSteps}
                    onChange={(e) => setCalculatorSteps(Number(e.target.value))}
                    className="flex-1 px-2 py-1 text-sm border rounded"
                    placeholder="Enter steps"
                  />
                  <span className="text-xs text-muted-foreground">steps</span>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-soft-lavender">
                    = {calculateCustomEarnings(calculatorSteps)} coins (₹{(calculateCustomEarnings(calculatorSteps) / 100).toFixed(2)})
                  </span>
                </div>
              </div>
            )}

            <div className="text-center mt-3">
              <p className="text-xs text-muted-foreground">
                Walk {dailyPotential.steps.toLocaleString()} steps to earn ₹{dailyPotential.rupees.toFixed(2)} today! 🚶‍♂️
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekend Bonus Indicator */}
      {new Date().getDay() === 0 || new Date().getDay() === 6 ? (
        <Card className="bg-gradient-to-r from-warm-coral/20 to-golden-accent/20 border-warm-coral/30">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-warm-coral" />
              <span className="font-semibold text-warm-coral">Weekend Bonus Active!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              🎉 Earn 1.5x coins on all steps this weekend
            </p>
          </div>
        </Card>
      ) : null}
    </div>
  );
};