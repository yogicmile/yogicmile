import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface YogicMileHeaderProps {
  className?: string;
  showTagline?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export const YogicMileHeader = ({ 
  className = "",
  showTagline = true,
  size = 'medium',
  onClick
}: YogicMileHeaderProps) => {
  const [glowAnimation, setGlowAnimation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowAnimation(true);
      setTimeout(() => setGlowAnimation(false), 1000);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: {
      container: 'py-2',
      logo: 'text-lg',
      tagline: 'text-xs',
      icon: 'w-4 h-4'
    },
    medium: {
      container: 'py-4',
      logo: 'text-xl',
      tagline: 'text-sm',
      icon: 'w-5 h-5'
    },
    large: {
      container: 'py-6',
      logo: 'text-2xl',
      tagline: 'text-base',
      icon: 'w-6 h-6'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div 
      className={cn(
        "text-center relative overflow-hidden",
        currentSize.container,
        onClick && "cursor-pointer hover:scale-105 transition-transform duration-200",
        className
      )}
      onClick={onClick}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tier-1-paisa/5 to-transparent animate-pulse opacity-50"></div>
      
      {/* Main Logo */}
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="relative">
            <Sparkles 
              className={cn(
                "text-tier-1-paisa transition-all duration-500",
                currentSize.icon,
                glowAnimation && "animate-pulse text-tier-2-rupaya"
              )} 
            />
            {glowAnimation && (
              <div className="absolute inset-0 animate-ping">
                <Sparkles className={cn("text-tier-1-paisa/50", currentSize.icon)} />
              </div>
            )}
          </div>
          
          <h1 className={cn(
            "font-bold bg-gradient-to-r from-tier-1-paisa via-tier-2-rupaya to-tier-1-paisa bg-clip-text text-transparent font-display",
            currentSize.logo
          )}>
            Yogic Mile
          </h1>
          
          <div className="relative">
            <div className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>
              🧘‍♀️
            </div>
          </div>
        </div>
        
        {showTagline && (
          <div className={cn(
            "text-muted-foreground font-medium tracking-wide animate-fade-in",
            currentSize.tagline
          )}>
            Walk. Earn. Evolve.
          </div>
        )}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-2 left-4 w-1 h-1 bg-tier-1-paisa rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-4 right-6 w-2 h-2 bg-tier-2-rupaya rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-2 left-6 w-1.5 h-1.5 bg-tier-3-token rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-4 right-4 w-1 h-1 bg-sage-green rounded-full animate-pulse opacity-70" style={{ animationDelay: '1.5s' }}></div>
      </div>
    </div>
  );
};