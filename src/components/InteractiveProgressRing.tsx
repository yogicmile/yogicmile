import { useState, useEffect } from 'react';
import { useNumberAnimation, useCelebration, useHapticFeedback } from '@/hooks/use-animations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InteractiveProgressRingProps {
  dailySteps: number;
  lifetimeSteps: number;
  goalSteps: number;
  currentTier: number;
  onGoalReached?: () => void;
}

export const InteractiveProgressRing = ({ 
  dailySteps, 
  lifetimeSteps, 
  goalSteps,
  currentTier,
  onGoalReached
}: InteractiveProgressRingProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [hasReachedGoal, setHasReachedGoal] = useState(false);
  
  const { current: animatedSteps } = useNumberAnimation(dailySteps);
  const { current: animatedLifetime } = useNumberAnimation(lifetimeSteps);
  const { isVisible: showCelebration, celebrate } = useCelebration();
  const { triggerHaptic } = useHapticFeedback();
  
  const percentage = Math.min((dailySteps / goalSteps) * 100, 100);
  const circumference = 2 * Math.PI * 85;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Celebration effect when goal is reached
  useEffect(() => {
    if (dailySteps >= goalSteps && !hasReachedGoal) {
      setHasReachedGoal(true);
      celebrate();
      triggerHaptic('heavy');
      onGoalReached?.();
    }
  }, [dailySteps, goalSteps, hasReachedGoal, celebrate, triggerHaptic, onGoalReached]);

  const getTierColors = (tier: number) => {
    const tierColors = {
      1: { primary: 'var(--tier-1-paisa)', glow: 'tier-1-glow' },
      2: { primary: 'var(--tier-2-coin)', glow: 'tier-2-glow' },
      3: { primary: 'var(--tier-3-token)', glow: 'tier-3-glow' },
      4: { primary: 'var(--tier-4-gem)', glow: 'tier-4-glow' },
      5: { primary: 'var(--tier-5-diamond)', glow: 'tier-5-glow' },
      6: { primary: 'var(--tier-6-crown)', glow: 'tier-6-glow' },
      7: { primary: 'var(--tier-7-emperor)', glow: 'tier-7-glow' },
      8: { primary: 'var(--tier-8-legend)', glow: 'tier-8-glow' },
      9: { primary: 'var(--tier-9-immortal)', glow: 'tier-9-glow' },
    };
    return tierColors[tier as keyof typeof tierColors] || tierColors[1];
  };

  const tierColor = getTierColors(currentTier);
  const isLowProgress = percentage < 30;

  const handleRingClick = () => {
    setShowDetails(true);
    triggerHaptic('light');
  };

  return (
    <>
      <div className="flex flex-col items-center py-6">
        {/* Progress Ring */}
        <div 
          className="relative w-52 h-52 mb-4 cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95"
          onClick={handleRingClick}
          role="button"
          tabIndex={0}
          aria-label={`Daily progress: ${percentage.toFixed(0)}%. Tap for details.`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleRingClick();
            }
          }}
        >
          <svg 
            className={`w-full h-full transform -rotate-90 transition-all duration-500 ${tierColor.glow} ${
              isLowProgress ? 'animate-pulse-slow' : ''
            } ${showCelebration ? 'progress-ring-glow animate-bounce-subtle' : ''}`} 
            viewBox="0 0 200 200"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="transparent"
              className="opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              stroke={`url(#progressGradient-${currentTier})`}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="progress-ring-stroke transition-all duration-2000 ease-out"
            />
            <defs>
              <linearGradient id={`progressGradient-${currentTier}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={`hsl(${tierColor.primary})`} />
                <stop offset="100%" stopColor={`hsl(${tierColor.primary} / 0.7)`} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground mb-1 font-medium">Steps Today</p>
            <p className="text-3xl font-bold text-foreground mb-2 font-display transition-all duration-300 group-hover:scale-110">
              {animatedSteps.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Daily Goal: {goalSteps.toLocaleString()}</p>
            <div className={`w-10 h-0.5 bg-tier-${currentTier}-paisa rounded-full my-3 transition-all duration-500`}></div>
            <p className="text-xs text-muted-foreground font-medium">Lifetime Steps</p>
            <p className={`text-lg font-semibold text-tier-${currentTier}-paisa font-display`}>
              {animatedLifetime.toLocaleString()}
            </p>
          </div>

          {/* Celebration Effect */}
          {showCelebration && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-6xl animate-bounce">🎉</div>
              </div>
              <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</div>
              </div>
              <div className="absolute top-1/4 right-1/4 transform translate-x-1/2 -translate-y-1/2">
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Percentage */}
        <div className="text-center">
          <p className={`text-3xl font-bold text-tier-${currentTier}-paisa font-display transition-all duration-500`}>
            {percentage.toFixed(0)}%
          </p>
          <p className="text-sm text-muted-foreground font-medium">daily goal progress</p>
        </div>

        {/* Motivational Pulse for Low Progress */}
        {isLowProgress && (
          <div className="mt-4 text-center animate-fade-in">
            <p className="text-sm text-warning font-medium">✨ Keep going! Every step counts ✨</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Progress Breakdown</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-tier-1-paisa-light rounded-lg">
              <span className="font-medium">Daily Steps</span>
              <span className="font-bold text-tier-1-paisa">{dailySteps.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
              <span className="font-medium">Daily Goal</span>
              <span className="font-bold">{goalSteps.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-tier-2-coin-light rounded-lg">
              <span className="font-medium">Remaining</span>
              <span className="font-bold text-tier-2-coin">
                {Math.max(0, goalSteps - dailySteps).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-tier-3-token-light rounded-lg">
              <span className="font-medium">Lifetime Steps</span>
              <span className="font-bold text-tier-3-token">{lifetimeSteps.toLocaleString()}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};