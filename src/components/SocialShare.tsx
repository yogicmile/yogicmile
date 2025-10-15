import { Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  shareType: 'achievement' | 'referral' | 'milestone' | 'phase_upgrade' | 'voucher_redemption' | 'daily_summary' | 'streak';
  shareContext: string;
  customMessage?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const SocialShare = ({ 
  shareType, 
  shareContext, 
  customMessage,
  variant = 'default',
  size = 'default',
  className = ""
}: SocialShareProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const generateShareMessage = (type: string, context: string, custom?: string): string => {
    if (custom) return custom;

    const messages = {
      achievement: `Just unlocked ${context} on Yogic Mile! Walking pays: https://yogicmile.app #YogicMile #WalkEarnEvolve`,
      referral: `Join me on Yogic Mile and earn real money by walking! 

🚶‍♂️ Health is Wealth - Complete 10,000 steps to unlock bonuses!

Use my code ${context} to get ₹1 bonus. Download: https://yogicmile.app #YogicMile #HealthIsWealth`,
      milestone: `Just reached ${context} on Yogic Mile! Walking is now my favorite way to earn: https://yogicmile.app #YogicMile`,
      phase_upgrade: `Upgraded to ${context} on Yogic Mile! Walking pays more now 💰 Join me: https://yogicmile.app #YogicMile`,
      voucher_redemption: `Just redeemed ${context} on Yogic Mile with coins I earned walking! 🚶‍♂️💰 https://yogicmile.app #YogicMile`,
      daily_summary: `Walked ${context} steps today and earned real money on Yogic Mile! 👣💰 https://yogicmile.app #WalkEarnEvolve`,
      streak: `🔥 ${context} walking streak on Yogic Mile earned me ₹5 bonus! Walking pays: https://yogicmile.app #YogicMile #Streak`
    };

    return messages[type as keyof typeof messages] || `Check out Yogic Mile - earn money by walking! https://yogicmile.app #YogicMile`;
  };

  const handleShare = async () => {
    const shareMessage = generateShareMessage(shareType, shareContext, customMessage);
    
    try {
      // Try native share first
      if (navigator.share) {
        await navigator.share({
          title: 'Yogic Mile - Walk. Earn. Evolve.',
          text: shareMessage,
          url: 'https://yogicmile.app'
        });

        // Log successful native share
        if (user) {
          await supabase.from('share_logs').insert({
            user_id: user.id,
            share_type: shareType,
            share_context: shareContext,
            content_shared: shareMessage,
            platform: 'native_share'
          });
        }

        toast({
          title: "Shared successfully!",
          description: "Thanks for spreading the word about Yogic Mile!",
        });

      } else {
        // Fallback to clipboard copy
        await navigator.clipboard.writeText(shareMessage);
        
        // Log clipboard share
        if (user) {
          await supabase.from('share_logs').insert({
            user_id: user.id,
            share_type: shareType,
            share_context: shareContext,
            content_shared: shareMessage,
            platform: 'clipboard'
          });
        }

        toast({
          title: "Copied to clipboard!",
          description: "Share message copied. Paste it anywhere to share!",
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      
      // Try clipboard as final fallback
      try {
        await navigator.clipboard.writeText(shareMessage);
        toast({
          title: "Copied to clipboard",
          description: "Share message copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share at this time",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
};

// Convenience components for specific share types
export const ShareAchievement = ({ achievementName, ...props }: { achievementName: string } & Omit<SocialShareProps, 'shareType' | 'shareContext'>) => (
  <SocialShare shareType="achievement" shareContext={achievementName} {...props} />
);

export const ShareMilestone = ({ milestone, ...props }: { milestone: string } & Omit<SocialShareProps, 'shareType' | 'shareContext'>) => (
  <SocialShare shareType="milestone" shareContext={milestone} {...props} />
);

export const ShareDailySummary = ({ steps, earnings, ...props }: { steps: number; earnings: number } & Omit<SocialShareProps, 'shareType' | 'shareContext'>) => (
  <SocialShare 
    shareType="daily_summary" 
    shareContext={`${steps.toLocaleString()}`}
    customMessage={`Walked ${steps.toLocaleString()} steps today and earned ₹${(earnings/100).toFixed(2)} on Yogic Mile! 👣💰 https://yogicmile.app #WalkEarnEvolve`}
    {...props} 
  />
);

export const ShareStreak = ({ streakDays, ...props }: { streakDays: number } & Omit<SocialShareProps, 'shareType' | 'shareContext'>) => (
  <SocialShare shareType="streak" shareContext={`${streakDays}-day`} {...props} />
);

export const ShareReferral = ({ referralCode, ...props }: { referralCode: string } & Omit<SocialShareProps, 'shareType' | 'shareContext'>) => (
  <SocialShare shareType="referral" shareContext={referralCode} {...props} />
);