import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ShareContent {
  type: 'achievement' | 'milestone' | 'challenge' | 'streak' | 'phase_advancement';
  title: string;
  description: string;
  data: {
    steps?: number;
    coins?: number;
    streak?: number;
    phase?: string;
    achievement?: string;
    milestone?: string;
  };
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSupported: boolean;
  maxLength?: number;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    isSupported: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500',
    isSupported: true,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '👥',
    color: 'bg-blue-600',
    isSupported: true,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-400',
    isSupported: true,
    maxLength: 280,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700',
    isSupported: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: 'bg-black',
    isSupported: true,
  },
];

export const useSocialSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<ShareContent | null>(null);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  // Generate share content for different achievement types
  const generateShareContent = useCallback((type: ShareContent['type'], data: ShareContent['data']): ShareContent => {
    const baseHashtags = '#YogicMile #WalkingRewards #HealthyLiving #FitnessJourney';
    
    switch (type) {
      case 'achievement':
        return {
          type,
          title: `🏆 Achievement Unlocked!`,
          description: `I just unlocked the "${data.achievement}" achievement on Yogic Mile! Walking my way to better health and earning rewards. ${baseHashtags}`,
          data,
        };
      
      case 'milestone':
        return {
          type,
          title: `🎯 Milestone Reached!`,
          description: `Amazing! I just hit ${data.steps?.toLocaleString()} steps and earned ₹${((data.coins || 0) / 100).toFixed(2)} in rewards! Every step counts on my wellness journey. ${baseHashtags}`,
          data,
        };
      
      case 'streak':
        return {
          type,
          title: `🔥 ${data.streak}-Day Streak!`,
          description: `On fire! ${data.streak} consecutive days of walking and earning rewards with Yogic Mile. The consistency is paying off! ${baseHashtags}`,
          data,
        };
      
      case 'phase_advancement':
        return {
          type,
          title: `📈 Phase Upgrade!`,
          description: `Level up! I just advanced to the ${data.phase} phase on Yogic Mile! Higher rewards, more motivation, endless possibilities. ${baseHashtags}`,
          data,
        };
      
      case 'challenge':
        return {
          type,
          title: `💪 Challenge Complete!`,
          description: `Challenge conquered! Just completed another fitness challenge on Yogic Mile. Walking towards wellness, one step at a time! ${baseHashtags}`,
          data,
        };
      
      default:
        return {
          type,
          title: '🚀 Yogic Mile Progress',
          description: `Making progress on my wellness journey with Yogic Mile! ${baseHashtags}`,
          data,
        };
    }
  }, []);

  // Open share modal
  const openShareModal = useCallback((type: ShareContent['type'], data: ShareContent['data']) => {
    if (isGuest) {
      toast({
        title: "Sign Up to Share",
        description: "Create an account to share your achievements and inspire others!",
        variant: "destructive",
      });
      return;
    }

    const content = generateShareContent(type, data);
    setCurrentContent(content);
    setShareModalOpen(true);
  }, [isGuest, generateShareContent, toast]);

  // Share to platform
  const shareToplatform = useCallback(async (platform: SocialPlatform, customMessage?: string) => {
    if (!currentContent || !user) return;

    try {
      setIsSharing(true);

      // Use custom message or generated content
      const shareText = customMessage || currentContent.description;
      
      // Platform-specific sharing logic
      let shareUrl = '';
      const encodedText = encodeURIComponent(shareText);
      const appUrl = encodeURIComponent('https://yogicmile.app'); // Replace with actual app URL

      switch (platform.id) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodedText}`;
          break;
        case 'twitter':
          const twitterText = platform.maxLength && shareText.length > platform.maxLength 
            ? shareText.substring(0, platform.maxLength - 3) + '...'
            : shareText;
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${appUrl}&quote=${encodedText}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${appUrl}&summary=${encodedText}`;
          break;
        case 'instagram':
        case 'tiktok':
          // These require native mobile apps or special integrations
          if (navigator.share) {
            await navigator.share({
              title: currentContent.title,
              text: shareText,
              url: 'https://yogicmile.app',
            });
          } else {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(shareText);
            toast({
              title: "Content Copied!",
              description: `Share content copied to clipboard. Open ${platform.name} to paste and share!`,
            });
          }
          break;
      }

      // Open share URL for web-based platforms
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }

      // Track the share in database
      await supabase.from('social_shares').insert({
        user_id: user.id,
        platform: platform.id,
        content_type: currentContent.type,
        content_data: currentContent.data,
      });

      toast({
        title: "🎉 Shared Successfully!",
        description: `Your progress has been shared to ${platform.name}`,
      });

      setShareModalOpen(false);
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  }, [currentContent, user, toast]);

  // Get platform-specific preview
  const getPlatformPreview = useCallback((platform: SocialPlatform, content: ShareContent, customMessage?: string) => {
    const message = customMessage || content.description;
    
    // Apply platform-specific formatting
    switch (platform.id) {
      case 'twitter':
        return platform.maxLength && message.length > platform.maxLength
          ? message.substring(0, platform.maxLength - 3) + '...'
          : message;
      case 'instagram':
        return `${content.title}\n\n${message.split('#')[0].trim()}\n\n${message.split('#').slice(1).map(tag => `#${tag.trim()}`).join(' ')}`;
      default:
        return message;
    }
  }, []);

  // Get sharing statistics
  const getShareStatistics = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('social_shares')
        .select('platform, content_type, engagement_metrics')
        .eq('user_id', user.id);

      if (error) throw error;

      const stats = {
        totalShares: data?.length || 0,
        byPlatform: {} as Record<string, number>,
        byContentType: {} as Record<string, number>,
        totalEngagement: 0,
      };

      data?.forEach(share => {
        stats.byPlatform[share.platform] = (stats.byPlatform[share.platform] || 0) + 1;
        stats.byContentType[share.content_type] = (stats.byContentType[share.content_type] || 0) + 1;
        
        const engagement = share.engagement_metrics as any;
        if (engagement) {
          stats.totalEngagement += (engagement.views || 0) + (engagement.likes || 0) + (engagement.shares || 0);
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching share statistics:', error);
      return null;
    }
  }, [user]);

  return {
    // State
    isSharing,
    shareModalOpen,
    currentContent,
    platforms: SOCIAL_PLATFORMS,
    
    // Actions
    openShareModal,
    shareToplatform,
    setShareModalOpen,
    generateShareContent,
    getPlatformPreview,
    getShareStatistics,
  };
};