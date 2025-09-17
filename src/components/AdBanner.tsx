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
          title: "Yoga & Wellness",
          subtitle: "Start your mindful journey",
          brand: "MindfulLife",
          cta: "Join Now",
          bgColor: "from-olive-light to-golden-light"
        },
        inline: {
          title: "Organic Health Foods",
          subtitle: "Fuel your daily walks",
          brand: "GreenEats",
          cta: "Shop Now",
          bgColor: "from-white to-olive-light"
        },
        footer: {
          title: "Meditation Apps",
          subtitle: "Inner peace & focus",
          brand: "ZenPath",
          cta: "Download",
          bgColor: "from-golden-light to-white"
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
        "rounded-2xl border animate-pulse",
        type === 'header' ? 'h-16' : type === 'inline' ? 'h-24' : 'h-20',
        className
      )} style={{ 
        borderColor: 'hsl(76 47% 36% / 0.2)', 
        backgroundColor: 'hsl(0 0% 98%)'
      }}>
        <div className="flex items-center space-x-4 p-4">
          <div className="rounded-full h-10 w-10" style={{ backgroundColor: 'hsl(76 47% 85%)' }}></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'hsl(76 47% 85%)' }}></div>
            <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'hsl(76 47% 90%)' }}></div>
          </div>
          <div className="h-8 rounded w-16" style={{ backgroundColor: 'hsl(76 47% 85%)' }}></div>
        </div>
      </div>
    );
  }

  if (!adContent) return null;

  return (
    <div className={cn(
      "relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-md bg-white",
      className
    )} style={{ borderColor: 'hsl(76 47% 36% / 0.2)' }}>
      {/* Ad Label */}
      <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded-md text-white" style={{ backgroundColor: 'hsl(76 47% 36% / 0.8)' }}>
        Ad
      </div>
      
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close ad"
      >
        <X className="w-3 h-3" style={{ color: 'hsl(76 47% 36%)' }} />
      </button>

      {/* Ad Content */}
      <div 
        className="p-4 pt-8 cursor-pointer"
        onClick={handleAdClick}
      >
        <div className="flex items-center space-x-4">
          {/* Brand Logo Placeholder */}
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border" style={{ borderColor: 'hsl(76 47% 36% / 0.2)' }}>
            <span className="text-lg font-bold" style={{ color: 'hsl(76 47% 36%)' }}>
              {adContent.brand.charAt(0)}
            </span>
          </div>
          
          {/* Ad Text */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" style={{ color: 'hsl(76 47% 16%)' }}>
              {adContent.title}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {adContent.subtitle}
            </p>
            <p className="text-xs font-medium" style={{ color: 'hsl(76 47% 36%)' }}>
              by {adContent.brand}
            </p>
          </div>
          
          {/* CTA Button - Golden Yellow */}
          <Button 
            size="sm"
            className="flex-shrink-0 hover:opacity-90 text-white"
            style={{ backgroundColor: 'hsl(51 100% 50%)' }}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            {adContent.cta}
          </Button>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, transparent, hsl(76 47% 36% / 0.3), transparent)' }}></div>
    </div>
  );
};