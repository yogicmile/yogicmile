interface ProgressRingProps {
  dailySteps: number;
  lifetimeSteps: number;
  goalSteps: number;
}

export const ProgressRing = ({ 
  dailySteps, 
  lifetimeSteps, 
  goalSteps 
}: ProgressRingProps) => {
  const percentage = Math.min((dailySteps / goalSteps) * 100, 100);
  const circumference = 2 * Math.PI * 85; // radius of 85
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center py-6">
      {/* Progress Ring */}
      <div className="relative w-52 h-52 mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
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
            stroke="url(#progressGradient)"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="progress-ring transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--tier-purple))" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-muted-foreground mb-1">Today's Steps</p>
          <p className="text-3xl font-bold text-foreground mb-2">{dailySteps.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Goal: {goalSteps.toLocaleString()}</p>
          <div className="w-8 h-0.5 bg-border my-2"></div>
          <p className="text-xs text-muted-foreground">Lifetime Steps</p>
          <p className="text-lg font-semibold text-primary">{lifetimeSteps.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">{percentage.toFixed(0)}%</p>
        <p className="text-sm text-muted-foreground">of daily goal completed</p>
      </div>
    </div>
  );
};