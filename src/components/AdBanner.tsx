import { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdBannerProps {
  type: 'header' | 'inline' | 'footer';
  className?: string;
}

export const AdBanner = ({ type, className = "" }: AdBannerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [adContent, setAdContent] = useState<{
    title: string;
    subtitle: string;
    brand: string;
    cta: string;
    bgColor: string;
  } | null>(null);

  // Simulate ad loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mock ad content based on type
      const mockAds = {
        header: {
          title: "Mindful Meditation",
          subtitle: "7-day free trial",
          brand: "Calm",
          cta: "Try Now",
          bgColor: "from-blue-50 to-purple-50"
        },
        inline: {
          title: "Premium Yoga Mat",
          subtitle: "30% off for walkers",
          brand: "YogaFlow",
          cta: "Shop Now",
          bgColor: "from-green-50 to-blue-50"
        },
        footer: {
          title: "Healthy Snacks",
          subtitle: "Fuel your journey",
          brand: "NutriWalk",
          cta: "Order",
          bgColor: "from-orange-50 to-yellow-50"
        }
      };
      setAdContent(mockAds[type]);
    }, 1000);

    return () => clearTimeout(timer);
  }, [type]);

  if (!isVisible) return null;

  const handleAdClick = () => {
    console.log(`Ad clicked: ${adContent?.brand}`);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn(
        "rounded-2xl border border-border/50 p-4 animate-pulse",
        type === 'header' ? 'h-16' : type === 'inline' ? 'h-24' : 'h-20',
        className
      )}>
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-secondary/50 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-secondary/50 rounded w-3/4"></div>
            <div className="h-3 bg-secondary/30 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-secondary/50 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (!adContent) return null;

  return (
    <div className={cn(
      "relative rounded-2xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-md",
      `bg-gradient-to-r ${adContent.bgColor}`,
      className
    )}>
      {/* Ad Label */}
      <div className="absolute top-2 left-2 text-xs bg-secondary/80 text-muted-foreground px-2 py-1 rounded-md">
        Ad
      </div>
      
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-secondary/50 transition-colors"
        aria-label="Close ad"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>

      {/* Ad Content */}
      <div 
        className="p-4 pt-8 cursor-pointer"
        onClick={handleAdClick}
      >
        <div className="flex items-center space-x-4">
          {/* Brand Logo Placeholder */}
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-lg font-bold text-tier-1-paisa">
              {adContent.brand.charAt(0)}
            </span>
          </div>
          
          {/* Ad Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {adContent.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {adContent.subtitle}
            </p>
            <p className="text-xs text-tier-1-paisa font-medium">
              by {adContent.brand}
            </p>
          </div>
          
          {/* CTA Button */}
          <Button 
            size="sm"
            className="flex-shrink-0 bg-tier-1-paisa hover:bg-tier-1-paisa/90 text-tier-1-paisa-foreground"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            {adContent.cta}
          </Button>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-tier-1-paisa/30 to-transparent"></div>
    </div>
  );
};