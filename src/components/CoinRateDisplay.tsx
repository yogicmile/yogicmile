import { useEffect, useState } from 'react';

interface CoinRateDisplayProps {
  currentTier: number;
  currentRate: number;
  nextTier: number;
  nextRate: number;
  remainingSteps: number;
  progressToNext: number;
  className?: string;
}

export const CoinRateDisplay = ({
  currentTier,
  currentRate,
  nextTier,
  nextRate,
  remainingSteps,
  progressToNext,
  className = ""
}: CoinRateDisplayProps) => {
  const [coinAnimation, setCoinAnimation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Rate progression timeline for all 9 tiers
  const rateProgression = [1, 2, 3, 5, 7, 10, 15, 20, 30];

  useEffect(() => {
    setIsVisible(true);
    const animationTimer = setInterval(() => {
      setCoinAnimation(prev => !prev);
    }, 2000);

    return () => clearInterval(animationTimer);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Rate Card */}
      <div 
        className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)'
        }}
      >
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/20" />
          <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full border-2 border-white/20" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Current Rate</h3>
            <div className={`transition-transform duration-300 ${coinAnimation ? 'scale-110 rotate-12' : 'scale-100'}`}>
              🪙
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {currentRate} paisa
            </div>
            <div className="text-white/90 text-base">
              per 100 steps
            </div>
            
            {/* Visual Coin Animation */}
            <div className="flex justify-center mt-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full bg-white/60 mx-1 transition-all duration-500 ${
                    coinAnimation ? 'animate-bounce' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Rate Preview */}
      <div className="bg-surface/80 backdrop-blur-md rounded-3xl p-6 border border-sage-green/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-sage-green">Next Rate</h3>
          <div className="text-2xl">⬆️</div>
        </div>

        <div className="space-y-4">
          {/* Next Rate Display */}
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-sage-green/10 to-deep-teal/10 border border-sage-green/20">
            <div className="text-2xl font-bold text-sage-green mb-1">
              {nextRate} paisa
            </div>
            <div className="text-muted-foreground text-sm">
              per 100 steps in Phase {nextTier}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-golden-accent/10 rounded-xl p-4 border border-golden-accent/20">
            <p className="text-sm text-muted-foreground mb-2">Requirements:</p>
            <p className="font-semibold text-golden-accent">
              Need {remainingSteps.toLocaleString()} more steps
            </p>
          </div>

          {/* Progress to Upgrade */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Progress to upgrade</span>
              <span className="text-sm font-bold text-deep-teal">{Math.round(progressToNext)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sage-green to-deep-teal rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center p-3 rounded-xl bg-gradient-to-r from-serene-blue/10 to-soft-lavender/10 border border-serene-blue/20">
            <p className="text-sm font-medium text-serene-blue">
              🚀 Keep walking to unlock!
            </p>
          </div>
        </div>
      </div>

      {/* Rate Progression Timeline */}
      <div className="bg-surface/80 backdrop-blur-md rounded-3xl p-6 border border-soft-lavender/20">
        <h3 className="text-lg font-bold text-soft-lavender mb-4 text-center">
          Rate Progression Journey
        </h3>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-golden-accent via-sage-green to-deep-teal transform -translate-y-1/2" />
          
          {/* Rate Points */}
          <div className="flex justify-between items-center relative z-10">
            {rateProgression.map((rate, index) => {
              const tierNumber = index + 1;
              const isCompleted = tierNumber < currentTier;
              const isCurrent = tierNumber === currentTier;
              const isNext = tierNumber === nextTier;
              
              return (
                <div key={tierNumber} className="flex flex-col items-center">
                  {/* Rate Circle */}
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-sage-green text-white border-sage-green shadow-lg' 
                        : isCurrent
                        ? 'bg-golden-accent text-white border-golden-accent shadow-lg animate-pulse'
                        : isNext
                        ? 'bg-serene-blue/20 text-serene-blue border-serene-blue'
                        : 'bg-gray-100 text-gray-400 border-gray-300'
                    }`}
                  >
                    {rate}
                  </div>
                  
                  {/* Tier Label */}
                  <span className={`text-xs mt-1 font-medium ${
                    isCurrent ? 'text-golden-accent' : 'text-muted-foreground'
                  }`}>
                    T{tierNumber}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-4 italic">
          "Progress is success in motion" 🚀
        </p>
      </div>
    </div>
  );
};