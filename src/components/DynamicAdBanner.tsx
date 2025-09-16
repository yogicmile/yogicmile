import { useState, useEffect, useRef } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface AdData {
  id: string;
  image_url: string;
  link_url: string;
  text: string;
  regions: string[];
  advertiser: string;
}

interface DynamicAdBannerProps {
  position: 'top' | 'bottom';
  page: 'home' | 'wallet' | 'rewards' | 'profile';
  className?: string;
  excludeAdIds?: string[];
}

export const DynamicAdBanner = ({ 
  position, 
  page, 
  className = "",
  excludeAdIds = [] 
}: DynamicAdBannerProps) => {
  const [ad, setAd] = useState<AdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [hasLogged, setHasLogged] = useState(false);
  const { user } = useAuth();
  const adRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate session ID for tracking
  const sessionId = useRef(crypto.randomUUID());

  useEffect(() => {
    fetchAd();
  }, [excludeAdIds]);

  useEffect(() => {
    // Set up intersection observer for impression tracking
    if (ad && user && !hasLogged) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasLogged) {
              logAdImpression();
              setHasLogged(true);
            }
          });
        },
        { threshold: 0.5 }
      );

      if (adRef.current) {
        observerRef.current.observe(adRef.current);
      }
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ad, user, hasLogged]);

  const fetchAd = async () => {
    try {
      setIsLoading(true);

      // Get user's location preference (mock for now - in real app would come from profile)
      const userLocation = {
        city: 'Hyderabad',
        district: 'Hyderabad',
        state: 'Telangana', 
        country: 'India'
      };

      // Build location filter array
      const locationFilters = [
        userLocation.city,
        userLocation.district,
        userLocation.state,
        userLocation.country
      ].filter(Boolean);

      // Fetch ads that match user's location
      let query = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active');

      // Exclude already shown ads
      if (excludeAdIds.length > 0) {
        query = query.not('id', 'in', `(${excludeAdIds.join(',')})`);
      }

      const { data: ads, error } = await query;

      if (error) {
        console.error('Error fetching ads:', error);
        setIsLoading(false);
        return;
      }

      if (!ads || ads.length === 0) {
        setIsLoading(false);
        return;
      }

      // Filter ads by location priority
      const filteredAds = ads.filter(ad => {
        const adRegions = ad.regions || [];
        return locationFilters.some(location => 
          adRegions.includes(location)
        );
      });

      // Sort by location specificity (city first, then district, state, country)
      const sortedAds = filteredAds.sort((a, b) => {
        const getLocationScore = (adRegions: string[]) => {
          if (adRegions.includes(userLocation.city)) return 4;
          if (adRegions.includes(userLocation.district)) return 3;
          if (adRegions.includes(userLocation.state)) return 2;
          if (adRegions.includes(userLocation.country)) return 1;
          return 0;
        };

        return getLocationScore(b.regions) - getLocationScore(a.regions);
      });

      // Select random ad from top matches
      const selectedAd = sortedAds.length > 0 ? 
        sortedAds[Math.floor(Math.random() * Math.min(3, sortedAds.length))] :
        ads[Math.floor(Math.random() * ads.length)];

      setAd(selectedAd);
    } catch (error) {
      console.error('Error in fetchAd:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logAdImpression = async () => {
    if (!ad || !user) return;

    try {
      await supabase
        .from('ad_logs')
        .insert({
          ad_id: ad.id,
          user_id: user.id,
          type: 'impression',
          page: page,
          session_id: sessionId.current,
          location: {
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India'
          }
        });
    } catch (error) {
      console.error('Error logging ad impression:', error);
    }
  };

  const logAdClick = async () => {
    if (!ad || !user) return;

    try {
      await supabase
        .from('ad_logs')
        .insert({
          ad_id: ad.id,
          user_id: user.id,
          type: 'click',
          page: page,
          session_id: sessionId.current,
          location: {
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India'
          }
        });
    } catch (error) {
      console.error('Error logging ad click:', error);
    }
  };

  const handleAdClick = () => {
    if (!ad) return;
    
    logAdClick();
    window.open(ad.link_url, '_blank', 'noopener,noreferrer');
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn(
        "w-full h-[50px] rounded-lg border border-border/50 animate-pulse bg-secondary/20 mb-4",
        className
      )}>
        <div className="flex items-center h-full px-4 space-x-3">
          <div className="w-8 h-8 bg-secondary/50 rounded"></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-secondary/50 rounded w-3/4"></div>
            <div className="h-2 bg-secondary/30 rounded w-1/2"></div>
          </div>
          <div className="w-16 h-6 bg-secondary/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div 
      ref={adRef}
      className={cn(
        "relative w-full h-[50px] rounded-lg border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer mb-4 bg-gradient-to-r from-primary/5 to-secondary/5",
        className
      )}
      onClick={handleAdClick}
    >
      {/* Sponsored Label */}
      <div className="absolute top-1 left-2 text-[10px] bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded-sm">
        Sponsored
      </div>
      
      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-1 right-2 p-1 rounded-full hover:bg-secondary/50 transition-colors z-10"
        aria-label="Close ad"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>

      {/* Ad Content */}
      <div className="flex items-center h-full px-4 pt-3">
        {/* Ad Image */}
        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded overflow-hidden mr-3">
          <img 
            src={ad.image_url} 
            alt={`${ad.advertiser} ad`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        
        {/* Ad Text */}
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-xs font-medium text-foreground truncate">
            {ad.text}
          </p>
          <p className="text-[10px] text-muted-foreground">
            by {ad.advertiser}
          </p>
        </div>
        
        {/* CTA Icon */}
        <div className="flex-shrink-0">
          <ExternalLink className="w-3 h-3 text-primary" />
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
    </div>
  );
};