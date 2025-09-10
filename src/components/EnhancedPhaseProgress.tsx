import { useEffect, useState } from 'react';

interface PhaseProgressProps {
  currentTier: number;
  tierName: string;
  tierSymbol: string;
  currentSteps: number;
  tierTarget: number;
  daysRemaining: number;
  className?: string;
}

export const EnhancedPhaseProgress = ({
  currentTier,
  tierName,
  tierSymbol,
  currentSteps,
  tierTarget,
  daysRemaining,
  className = ""
}: PhaseProgressProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const progressPercentage = Math.min((currentSteps / tierTarget) * 100, 100);
  const remainingSteps = Math.max(tierTarget - currentSteps, 0);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // Calculate milestone positions
  const milestones = [25, 50, 75];

  return (
    <div className={`bg-surface/90 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-golden-accent/20 ${className}`}>
      {/* Current Phase Display */}
      <div className={`text-center mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Tier Symbol with Breathing Effect */}
        <div className="relative inline-block mb-3">
          <div 
            className="text-6xl animate-pulse filter drop-shadow-lg"
            style={{ 
              animation: 'breathe 3s ease-in-out infinite',
              filter: 'drop-shadow(0 4px 12px rgba(255, 213, 79, 0.4))'
            }}
          >
            {tierSymbol}
          </div>
          
          {/* Yogic Glow Ring */}
          <div 
            className="absolute inset-0 rounded-full opacity-20 animate-ping"
            style={{
              background: 'radial-gradient(circle, rgba(255, 213, 79, 0.4) 0%, transparent 70%)',
              animationDuration: '3s'
            }}
          />
        </div>

        {/* Phase Name */}
        <h2 
          className="text-2xl font-bold mb-1"
          style={{ 
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          {tierName}
        </h2>
        <p className="text-sm text-muted-foreground">Phase {currentTier} of 9</p>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="mb-6">
        <div className="relative">
          {/* Progress Bar Background */}
          <div 
            className="w-full h-3 rounded-full overflow-hidden"
            style={{
              background: '#F5F5F5',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {/* Progress Fill */}
            <div 
              className="h-full rounded-full transition-all duration-2000 ease-out"
              style={{
                width: `${animatedProgress}%`,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 2px 8px rgba(255, 213, 79, 0.4)',
                transition: 'width 2s ease-out'
              }}
            />
          </div>

          {/* Milestone Markers */}
          {milestones.map((milestone, index) => (
            <div
              key={milestone}
              className={`absolute top-0 w-1 h-3 rounded-full transition-colors duration-500 ${
                progressPercentage >= milestone ? 'bg-golden-accent' : 'bg-gray-300'
              }`}
              style={{ left: `${milestone}%`, transform: 'translateX(-50%)' }}
            >
              {/* Milestone Tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                {milestone}%
              </div>
            </div>
          ))}
        </div>

        {/* Progress Percentage */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-muted-foreground">0</span>
          <span 
            className="text-sm font-bold px-3 py-1 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
              color: '#FFA500'
            }}
          >
            {Math.round(progressPercentage)}%
          </span>
          <span className="text-sm text-muted-foreground">{tierTarget.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Information Panel */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Goal */}
        <div className="bg-gradient-to-br from-serene-blue/10 to-deep-teal/10 rounded-xl p-4 text-center border border-serene-blue/20">
          <p className="text-xs text-muted-foreground mb-1">Current Goal</p>
          <p className="text-lg font-bold text-serene-blue">{tierTarget.toLocaleString()}</p>
          <p className="text-xs opacity-70">steps</p>
        </div>

        {/* Completed */}
        <div className="bg-gradient-to-br from-sage-green/10 to-sage-green/20 rounded-xl p-4 text-center border border-sage-green/20">
          <p className="text-xs text-muted-foreground mb-1">Completed ✓</p>
          <p className="text-lg font-bold text-sage-green">{currentSteps.toLocaleString()}</p>
          <p className="text-xs opacity-70">steps</p>
        </div>

        {/* Remaining */}
        <div className="bg-gradient-to-br from-golden-accent/10 to-golden-accent/20 rounded-xl p-4 text-center border border-golden-accent/20">
          <p className="text-xs text-muted-foreground mb-1">Remaining</p>
          <p className="text-lg font-bold text-golden-accent">{remainingSteps.toLocaleString()}</p>
          <p className="text-xs opacity-70">steps to go!</p>
        </div>

        {/* Time Left */}
        <div className={`bg-gradient-to-br rounded-xl p-4 text-center border ${
          daysRemaining <= 7 
            ? 'from-warm-coral/10 to-warm-coral/20 border-warm-coral/20' 
            : 'from-soft-lavender/10 to-soft-lavender/20 border-soft-lavender/20'
        }`}>
          <p className="text-xs text-muted-foreground mb-1">Time Left</p>
          <p className={`text-lg font-bold ${daysRemaining <= 7 ? 'text-warm-coral' : 'text-soft-lavender'}`}>
            {daysRemaining}
          </p>
          <p className="text-xs opacity-70">days</p>
        </div>
      </div>

      {/* Mindful Progress Message */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground italic">
          "Every step is a step towards inner peace" 🕊️
        </p>
      </div>
    </div>
  );
};