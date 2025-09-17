import { useEffect, useState } from 'react';

interface MotivationStreaksSectionProps {
  currentStreak: number;
  nextStreakMilestone: number;
  streakReward: number;
  className?: string;
}

export const MotivationStreaksSection = ({
  currentStreak,
  nextStreakMilestone,
  streakReward,
  className = ""
}: MotivationStreaksSectionProps) => {
  const [flameAnimation, setFlameAnimation] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Rotating yogic wisdom quotes
  const yogicQuotes = [
    "Every step is a step towards inner peace",
    "Walk mindfully, earn consciously", 
    "Your journey of a thousand miles begins with one step",
    "Balance in body, wealth in steps",
    "In every walk with nature, one receives far more than they seek",
    "The path to wellness is walked one step at a time"
  ];

  // Daily walking tips
  const dailyTips = [
    "Try walking meditation: Focus on each step with awareness",
    "Morning walks boost your energy and mood for the entire day", 
    "Take breaks every hour for a 2-minute mindful walk",
    "Walking in nature reduces stress and improves creativity",
    "Set walking reminders to build a sustainable habit",
    "Walk with gratitude - notice three beautiful things around you"
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Flame animation interval
    const flameTimer = setInterval(() => {
      setFlameAnimation(prev => !prev);
    }, 1500);

    // Quote rotation interval
    const quoteTimer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % yogicQuotes.length);
    }, 8000);

    return () => {
      clearInterval(flameTimer);
      clearInterval(quoteTimer);
    };
  }, [yogicQuotes.length]);

  const progressToNextMilestone = ((currentStreak % nextStreakMilestone) / nextStreakMilestone) * 100;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Streak Counter Display */}
      <div 
        className={`bg-gradient-to-br from-warm-coral/10 to-golden-accent/20 backdrop-blur-md rounded-3xl p-6 border border-warm-coral/20 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="text-center">
          {/* Fire Emoji with Animation */}
          <div className="relative mb-4">
            <div 
              className={`text-6xl transition-all duration-300 filter ${
                flameAnimation ? 'scale-110 drop-shadow-lg' : 'scale-100'
              }`}
              style={{
                filter: flameAnimation 
                  ? 'drop-shadow(0 0 20px rgba(255, 112, 67, 0.6))' 
                  : 'drop-shadow(0 4px 8px rgba(255, 112, 67, 0.3))'
              }}
            >
              🔥
            </div>
            
            {/* Flame Particle Effects */}
            {flameAnimation && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-warm-coral rounded-full animate-ping opacity-60"
                    style={{
                      left: `${50 + (i - 1) * 20}%`,
                      top: `${30 + i * 10}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Streak Number */}
          <div className="mb-4">
            <div className="text-4xl font-bold text-warm-coral mb-2">
              {currentStreak}
            </div>
            <div className="text-lg font-semibold text-muted-foreground">
              Day Streak
            </div>
          </div>

          {/* Streak Milestone Info */}
          <div className="bg-white/50 rounded-2xl p-4 border border-golden-accent/30">
            <p className="text-sm font-semibold text-golden-accent mb-2">
              🏆 {nextStreakMilestone} days = Bonus {streakReward} coins!
            </p>
            
            {/* Progress to Next Milestone */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Progress to milestone</span>
                <span className="text-xs font-bold text-warm-coral">
                  {currentStreak % nextStreakMilestone}/{nextStreakMilestone}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-warm-coral to-golden-accent rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressToNextMilestone}%` }}
                />
              </div>
            </div>
          </div>

          {/* Encouraging Message */}
          <div className="mt-4 p-3 bg-gradient-to-r from-serene-blue/10 to-soft-lavender/10 rounded-xl border border-serene-blue/20">
            <p className="text-sm font-medium text-serene-blue">
              🔗 Don't break the chain!
            </p>
          </div>
        </div>
      </div>

      {/* Daily Motivation Card */}
      <div className="bg-gradient-to-br from-soft-lavender/10 to-serene-blue/10 backdrop-blur-md rounded-3xl p-6 border border-soft-lavender/20">
        {/* Lotus Pattern Background */}
        <div className="absolute inset-0 opacity-5 overflow-hidden rounded-3xl">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z' fill='%23B39DDB'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-center mb-4">
            <div className="text-2xl mr-2">💪</div>
            <h3 className="text-lg font-bold text-soft-lavender">Daily Inspiration</h3>
          </div>

          {/* Rotating Quote */}
          <div 
            className="text-center mb-6 transition-all duration-500"
            key={currentQuoteIndex} // Force re-render for animation
          >
            <blockquote className="text-base font-medium text-foreground italic mb-2 leading-relaxed">
              "{yogicQuotes[currentQuoteIndex]}"
            </blockquote>
            <div className="flex justify-center">
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-golden-accent to-transparent" />
            </div>
          </div>

          {/* Daily Tip */}
          <div className="bg-white/40 rounded-2xl p-4 border border-sage-green/20">
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">💡</span>
              <span className="text-sm font-semibold text-sage-green">Today's Walking Tip</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {dailyTips[currentQuoteIndex % dailyTips.length]}
            </p>
          </div>

          {/* Mindfulness Reminder */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground italic opacity-70">
              Walk with awareness • Breathe with intention • Step with purpose
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};