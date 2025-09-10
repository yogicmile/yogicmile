import React, { useEffect, useState } from 'react';

interface LevelUpAnimationProps {
  type: 'tier-advancement' | 'goal-achieved' | 'streak-milestone' | 'first-tier';
  isVisible: boolean;
  onComplete: () => void;
  newTier?: number;
  newTierName?: string;
  newRate?: number;
  streakDays?: number;
  className?: string;
}

export const LevelUpAnimations: React.FC<LevelUpAnimationProps> = ({
  type,
  isVisible,
  onComplete,
  newTier = 2,
  newTierName = "Coin Phase",
  newRate = 2,
  streakDays = 7,
  className = ""
}) => {
  const [animationStage, setAnimationStage] = useState<'entering' | 'displaying' | 'exiting'>('entering');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate particles for animation
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1000
      }));
      setParticles(newParticles);

      // Animation sequence
      setAnimationStage('entering');
      
      const displayTimer = setTimeout(() => {
        setAnimationStage('displaying');
      }, 1000);

      const exitTimer = setTimeout(() => {
        setAnimationStage('exiting');
      }, 4000);

      const completeTimer = setTimeout(() => {
        onComplete();
      }, 5000);

      return () => {
        clearTimeout(displayTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getAnimationContent = () => {
    switch (type) {
      case 'tier-advancement':
        return (
          <div className="text-center space-y-6">
            {/* Tier Symbol Transformation */}
            <div className="relative">
              <div 
                className={`text-8xl transition-all duration-2000 ${
                  animationStage === 'entering' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
                }`}
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))',
                  animation: animationStage === 'displaying' ? 'breathe 2s ease-in-out infinite' : ''
                }}
              >
                🪙
              </div>
              
              {/* Glow Ring */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-2000 ${
                  animationStage === 'entering' ? 'scale-0 opacity-0' : 'scale-150 opacity-30'
                }`}
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%)',
                  animation: animationStage === 'displaying' ? 'pulse 2s ease-in-out infinite' : ''
                }}
              />
            </div>

            {/* Congratulations Message */}
            <div 
              className={`transition-all duration-1000 delay-500 ${
                animationStage === 'entering' ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
              }`}
            >
              <h2 className="text-3xl font-bold text-golden-accent mb-2">
                🎉 Congratulations!
              </h2>
              <p className="text-xl font-semibold text-foreground mb-4">
                Welcome to {newTierName}!
              </p>
              <div className="bg-golden-accent/20 rounded-2xl p-4 border border-golden-accent/30">
                <p className="text-lg font-medium text-golden-accent">
                  New Rate: {newRate} paisa per 100 steps
                </p>
              </div>
            </div>

            {/* Meditation Bell Ripple */}
            <div className="relative">
              <div 
                className={`w-16 h-16 mx-auto bg-golden-accent/20 rounded-full transition-all duration-2000 delay-1000 ${
                  animationStage === 'entering' ? 'scale-0' : 'scale-100'
                }`}
              >
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🔔
                </div>
              </div>
              
              {/* Ripple Rings */}
              {[1, 2, 3].map((ring) => (
                <div
                  key={ring}
                  className={`absolute inset-0 rounded-full border-2 border-golden-accent/40 transition-all duration-2000 ${
                    animationStage === 'displaying' ? `scale-${ring + 1}00 opacity-0` : 'scale-100 opacity-100'
                  }`}
                  style={{
                    animationDelay: `${ring * 0.3}s`,
                    animation: animationStage === 'displaying' ? `ripple 2s ease-out infinite ${ring * 0.3}s` : ''
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'goal-achieved':
        return (
          <div className="text-center space-y-4">
            <div 
              className={`text-6xl transition-all duration-1000 ${
                animationStage === 'entering' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
              }`}
            >
              ✅
            </div>
            <h2 className="text-2xl font-bold text-sage-green">
              Daily Goal Achieved!
            </h2>
            <div className="bg-sage-green/20 rounded-xl p-4">
              <p className="text-sage-green font-medium">
                Peaceful progress on your mindful journey 🧘‍♀️
              </p>
            </div>
          </div>
        );

      case 'streak-milestone':
        return (
          <div className="text-center space-y-4">
            <div 
              className={`text-6xl transition-all duration-1000 ${
                animationStage === 'entering' ? 'scale-0' : 'scale-100'
              }`}
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 112, 67, 0.8))',
                animation: animationStage === 'displaying' ? 'flame 1s ease-in-out infinite alternate' : ''
              }}
            >
              🔥
            </div>
            <h2 className="text-2xl font-bold text-warm-coral">
              {streakDays} Day Streak!
            </h2>
            <div className="bg-warm-coral/20 rounded-xl p-4">
              <p className="text-warm-coral font-medium">
                Keep the flame burning! 🔗
              </p>
            </div>
          </div>
        );

      case 'first-tier':
        return (
          <div className="text-center space-y-6">
            {/* Lotus Bloom Animation */}
            <div className="relative">
              <div 
                className={`text-8xl transition-all duration-3000 ${
                  animationStage === 'entering' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                }`}
                style={{
                  animation: animationStage === 'displaying' ? 'bloom 3s ease-in-out infinite' : ''
                }}
              >
                🪷
              </div>
              
              {/* Petals falling */}
              <div className="absolute inset-0 pointer-events-none">
                {particles.slice(0, 8).map((particle) => (
                  <div
                    key={particle.id}
                    className="absolute w-2 h-2 text-xs opacity-70 animate-bounce"
                    style={{
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                      animationDelay: `${particle.delay}ms`,
                      animationDuration: '2s'
                    }}
                  >
                    🌸
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-soft-lavender mb-2">
                First Tier Complete!
              </h2>
              <p className="text-lg text-foreground">
                The lotus blooms as you begin your journey 🌸
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-500 ${
        animationStage === 'exiting' ? 'opacity-0' : 'opacity-100'
      } ${className}`}
    >
      {/* Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-1 h-1 bg-golden-accent rounded-full animate-ping ${
              animationStage === 'entering' ? 'opacity-0' : 'opacity-60'
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Main Animation Content */}
      <div 
        className={`bg-surface/95 backdrop-blur-md rounded-3xl p-8 max-w-sm mx-4 border border-golden-accent/30 transition-all duration-1000 ${
          animationStage === 'entering' 
            ? 'scale-80 opacity-0 translate-y-8' 
            : animationStage === 'exiting'
            ? 'scale-110 opacity-0 -translate-y-4'
            : 'scale-100 opacity-100 translate-y-0'
        }`}
      >
        {getAnimationContent()}
      </div>
    </div>
  );
};