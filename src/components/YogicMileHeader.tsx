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
      {/* Background Gradient Effect - CSS only, reduced frequency */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tier-1-paisa/5 to-transparent header-glow opacity-50"></div>
      
      {/* Main Logo */}
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="relative sparkle-container">
            <Sparkles 
              className={cn(
                "text-tier-1-paisa",
                currentSize.icon
              )} 
            />
          </div>
          
          <h1 className={cn(
            "font-bold bg-gradient-to-r from-tier-1-paisa via-tier-2-coin to-tier-1-paisa bg-clip-text text-transparent font-display",
            currentSize.logo
          )}>
            Step Rewards
          </h1>
          
          <div className="text-2xl shoe-bounce">
            👟
          </div>
        </div>
        
        {showTagline && (
          <div className={cn(
            "text-muted-foreground font-medium tracking-wide animate-fade-in",
            currentSize.tagline
          )}>
            Walk. Earn. Achieve.
          </div>
        )}
      </div>

      {/* Decorative Elements - Reduced to 2, optimized */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-2 left-4 w-1 h-1 bg-tier-1-paisa rounded-full header-dot-1"></div>
        <div className="absolute bottom-4 right-4 w-1 h-1 bg-tier-2-coin rounded-full header-dot-2"></div>
      </div>
    </div>
  );
};