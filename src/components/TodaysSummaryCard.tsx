import { useEffect, useState } from 'react';
import { EnhancedCTAButton } from '@/components/EnhancedCTAButton';
import { CountdownTimer } from '@/components/CountdownTimer';

interface TodaysSummaryCardProps {
  currentSteps: number;
  dailyGoal: number;
  coinsEarned: number;
  distance: number;
  activeMinutes: number;
  isGoalReached: boolean;
  hasRedeemedToday: boolean;
  className?: string;
  onClaimReward?: () => Promise<boolean>;
  coinBalance?: number;
}

export const TodaysSummaryCard = ({
  currentSteps,
  dailyGoal,
  coinsEarned,
  distance,
  activeMinutes,
  isGoalReached,
  hasRedeemedToday,
  className = "",
  onClaimReward,
  coinBalance = 0
}: TodaysSummaryCardProps) => {
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [stepCountAnimation, setStepCountAnimation] = useState(0);

  const stepProgress = Math.min((currentSteps / dailyGoal) * 100, 100);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Animate step count on mount
    const stepTimer = setInterval(() => {
      setStepCountAnimation(prev => {
        if (prev >= currentSteps) {
          clearInterval(stepTimer);
          return currentSteps;
        }
        return Math.min(prev + Math.ceil(currentSteps / 50), currentSteps);
      });
    }, 50);

    // Coin animation interval
    const coinTimer = setInterval(() => {
      setCoinAnimation(prev => !prev);
    }, 2500);

    return () => {
      clearInterval(stepTimer);
      clearInterval(coinTimer);
    };
  }, [currentSteps]);

  return (
    <div 
      className={`bg-surface/90 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-golden-accent/20 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-6">
        <div className="text-3xl mr-3">🧘‍♀️</div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground">Today's Achievement</h3>
          <p className="text-sm text-muted-foreground">Your mindful progress</p>
        </div>
      </div>

      {/* Main Steps Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {/* Steps Counter with Animation */}
          <div className="text-4xl font-bold text-serene-blue mb-2">
            {stepCountAnimation.toLocaleString()}
          </div>
          <div className="text-lg text-muted-foreground">
            of {dailyGoal.toLocaleString()} steps
          </div>
          
          {/* Goal Achievement Badge */}
          {isGoalReached && (
            <div className="absolute -top-2 -right-8 bg-sage-green text-white text-xs px-2 py-1 rounded-full animate-bounce">
              ✓ Goal!
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4 relative">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-serene-blue to-deep-teal rounded-full transition-all duration-2000 ease-out"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span className="font-medium">{Math.round(stepProgress)}%</span>
            <span>{dailyGoal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Four Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Steps Achievement */}
        <div className="bg-gradient-to-br from-serene-blue/10 to-deep-teal/10 rounded-2xl p-4 text-center border border-serene-blue/20">
          <div className="text-2xl mb-2">👣</div>
          <div className="text-lg font-bold text-serene-blue">{currentSteps.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">steps today</div>
        </div>

        {/* Coins Earned */}
        <div className="bg-gradient-to-br from-golden-accent/10 to-golden-accent/20 rounded-2xl p-4 text-center border border-golden-accent/20">
          <div className={`text-2xl mb-2 transition-transform duration-300 ${coinAnimation ? 'scale-110 rotate-12' : 'scale-100'}`}>
            🪙
          </div>
          <div className="text-lg font-bold text-golden-accent">{coinsEarned}</div>
          <div className="text-xs text-muted-foreground">coins earned</div>
        </div>

        {/* Distance */}
        <div className="bg-gradient-to-br from-sage-green/10 to-sage-green/20 rounded-2xl p-4 text-center border border-sage-green/20">
          <div className="text-2xl mb-2">📍</div>
          <div className="text-lg font-bold text-sage-green">{distance.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">km walked</div>
        </div>

        {/* Active Minutes */}
        <div className="bg-gradient-to-br from-soft-lavender/10 to-soft-lavender/20 rounded-2xl p-4 text-center border border-soft-lavender/20">
          <div className="text-2xl mb-2">⏱️</div>
          <div className="text-lg font-bold text-soft-lavender">{activeMinutes}</div>
          <div className="text-xs text-muted-foreground">active mins</div>
        </div>
      </div>

      {/* Status Banner & Redemption Section */}
      <div className={`rounded-2xl p-4 text-center border ${
        hasRedeemedToday
          ? 'bg-gradient-to-r from-sage-green/10 to-deep-teal/10 border-sage-green/20'
          : isGoalReached
          ? 'bg-gradient-to-r from-golden-accent/10 to-warm-coral/10 border-golden-accent/20'
          : 'bg-gradient-to-r from-serene-blue/10 to-soft-lavender/10 border-serene-blue/20'
      }`}>
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="text-xl">
            {hasRedeemedToday ? '✅' : isGoalReached ? '🎉' : '🎯'}
          </div>
          <div className="text-sm font-medium">
            {hasRedeemedToday 
              ? 'Coins redeemed today' 
              : isGoalReached 
              ? 'Ready to redeem coins!' 
              : 'Keep walking towards your goal'
            }
          </div>
        </div>
        
        {/* Countdown Timer for redemption urgency */}
        {coinsEarned > 0 && !hasRedeemedToday && (
          <div className="mb-4">
            <CountdownTimer />
          </div>
        )}
        
        {/* Redemption Button */}
        {coinsEarned > 0 && !hasRedeemedToday && onClaimReward && (
          <EnhancedCTAButton
            onClaim={onClaimReward}
            coinBalance={coinBalance}
            todaysCoins={coinsEarned}
            todaysSteps={currentSteps}
            rewardAmount={coinsEarned}
            disabled={false}
          />
        )}
      </div>

      {/* Mindfulness Reminder */}
      <div className="mt-4 text-center">
        <p className="text-xs text-muted-foreground italic opacity-70">
          "Walk with awareness, step with gratitude" 🙏
        </p>
      </div>

      {/* Celebration Particles for Goal Achievement */}
      {isGoalReached && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-golden-accent rounded-full animate-ping opacity-60"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};