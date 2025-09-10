import { useEffect, useState } from 'react';

interface YogicMileHeaderProps {
  className?: string;
}

export const YogicMileHeader = ({ className = "" }: YogicMileHeaderProps) => {
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);

  useEffect(() => {
    // Trigger logo animation on mount
    const timer = setTimeout(() => setIsLogoAnimating(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header 
      className={`relative w-full bg-gradient-to-br from-[#E3F2FD] to-[#E8F5E8] pb-6 pt-8 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #E3F2FD 0%, #E8F5E8 100%)',
        boxShadow: '0 4px 20px rgba(79, 195, 247, 0.1)'
      }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 left-8 w-16 h-16 rounded-full bg-golden-accent/10 animate-pulse" />
        <div className="absolute top-12 right-12 w-12 h-12 rounded-full bg-sage-green/10 animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-8 left-16 w-8 h-8 rounded-full bg-deep-teal/10 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Header Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Yogic Mile Logo */}
        <div 
          className={`transition-all duration-1000 ease-out ${
            isLogoAnimating ? 'scale-100 opacity-100 rotate-0' : 'scale-90 opacity-0 rotate-12'
          }`}
        >
          <div className="relative mb-3">
            {/* Logo Circle with Breathing Animation */}
            <div 
              className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white font-bold text-xl animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3), 0 0 0 2px rgba(255, 215, 0, 0.1)',
                animation: 'breathe 3s ease-in-out infinite'
              }}
            >
              {/* YM Initials or Lotus Symbol */}
              <span className="text-lg font-extrabold tracking-tight">YM</span>
            </div>
            
            {/* Subtle Glow Effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-30 animate-ping"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                animationDuration: '3s'
              }}
            />
          </div>

          {/* App Name */}
          <h1 className="text-2xl font-bold mb-2" style={{ 
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Yogic Mile
          </h1>

          {/* Tagline */}
          <p 
            className="text-base font-medium tracking-wide"
            style={{ 
              color: '#2E7D32',
              textShadow: '0 1px 3px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px'
            }}
          >
            Walk. Earn. Evolve.
          </p>
        </div>

        {/* Mindfulness Ornament */}
        <div className="mt-4 flex items-center space-x-2 opacity-70">
          <div className="w-1 h-1 rounded-full bg-golden-accent animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="w-1 h-1 rounded-full bg-deep-teal animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </header>
  );
};

// Custom breathing animation for logo
const breathingAnimation = `
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
`;

// Inject animation into head if not already present
if (typeof document !== 'undefined' && !document.querySelector('#yogic-animations')) {
  const style = document.createElement('style');
  style.id = 'yogic-animations';
  style.textContent = breathingAnimation;
  document.head.appendChild(style);
}