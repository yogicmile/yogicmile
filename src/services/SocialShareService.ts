import { supabase } from '@/integrations/supabase/client';

export class SocialShareService {
  /**
   * Generate share content for different contexts
   */
  static generateShareContent(type: string, data: any) {
    const baseUrl = window.location.origin;

    switch (type) {
      case 'achievement':
        return {
          title: `🏆 New Achievement Unlocked!`,
          text: `I just earned the "${data.name}" achievement on YogicMile! Join me in walking towards a healthier life.`,
          url: `${baseUrl}/achievements/${data.id}`,
        };

      case 'challenge':
        return {
          title: `🎯 Challenge: ${data.title}`,
          text: `Join my challenge on YogicMile! Let's walk ${data.goal_value} steps together.`,
          url: `${baseUrl}/challenges/${data.id}`,
        };

      case 'milestone':
        return {
          title: `🎉 Milestone Reached!`,
          text: `I've walked ${data.steps.toLocaleString()} steps on YogicMile! Join me on this journey.`,
          url: `${baseUrl}/profile`,
        };

      case 'community':
        return {
          title: `👥 Join ${data.name}`,
          text: `Check out this amazing community on YogicMile: ${data.description}`,
          url: `${baseUrl}/community/${data.id}`,
        };

      case 'team':
        return {
          title: `⚡ Join Team ${data.name}`,
          text: `Join our team on YogicMile and let's reach our goal of ${data.goal_value} steps together!`,
          url: `${baseUrl}/teams/${data.id}`,
        };

      case 'route':
        return {
          title: `🗺️ Check out my route!`,
          text: `I walked ${data.distance}km on YogicMile. View my route and join me!`,
          url: `${baseUrl}/routes/${data.id}`,
        };

      default:
        return {
          title: 'YogicMile - Walk, Earn, Live Healthy',
          text: 'Join me on YogicMile - Turn your steps into rewards!',
          url: baseUrl,
        };
    }
  }

  /**
   * Share via Web Share API
   */
  static async shareNative(type: string, data: any) {
    try {
      if (!navigator.share) {
        return { success: false, error: 'Web Share API not supported' };
      }

      const shareContent = this.generateShareContent(type, data);

      await navigator.share(shareContent);

      // Log share
      await this.logShare(type, 'native', data);

      return { success: true };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { success: false, error: 'Share cancelled' };
      }
      console.error('Failed to share natively:', error);
      return { success: false, error };
    }
  }

  /**
   * Share to WhatsApp
   */
  static async shareToWhatsApp(type: string, data: any) {
    try {
      const shareContent = this.generateShareContent(type, data);
      const message = encodeURIComponent(`${shareContent.text}\n${shareContent.url}`);
      const whatsappUrl = `https://wa.me/?text=${message}`;

      window.open(whatsappUrl, '_blank');

      await this.logShare(type, 'whatsapp', data);

      return { success: true };
    } catch (error) {
      console.error('Failed to share to WhatsApp:', error);
      return { success: false, error };
    }
  }

  /**
   * Share to Facebook
   */
  static async shareToFacebook(type: string, data: any) {
    try {
      const shareContent = this.generateShareContent(type, data);
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}`;

      window.open(facebookUrl, '_blank', 'width=600,height=400');

      await this.logShare(type, 'facebook', data);

      return { success: true };
    } catch (error) {
      console.error('Failed to share to Facebook:', error);
      return { success: false, error };
    }
  }

  /**
   * Share to Twitter
   */
  static async shareToTwitter(type: string, data: any) {
    try {
      const shareContent = this.generateShareContent(type, data);
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.text)}&url=${encodeURIComponent(shareContent.url)}`;

      window.open(twitterUrl, '_blank', 'width=600,height=400');

      await this.logShare(type, 'twitter', data);

      return { success: true };
    } catch (error) {
      console.error('Failed to share to Twitter:', error);
      return { success: false, error };
    }
  }

  /**
   * Copy link to clipboard
   */
  static async copyLink(type: string, data: any) {
    try {
      const shareContent = this.generateShareContent(type, data);

      await navigator.clipboard.writeText(shareContent.url);

      await this.logShare(type, 'copy_link', data);

      return { success: true, url: shareContent.url };
    } catch (error) {
      console.error('Failed to copy link:', error);
      return { success: false, error };
    }
  }

  /**
   * Generate share image (for Instagram, etc.)
   */
  static async generateShareImage(type: string, data: any) {
    try {
      // This would generate a canvas-based image with the achievement/stats
      // For now, return a placeholder implementation
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Background
      ctx.fillStyle = '#4F46E5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('YogicMile', canvas.width / 2, 100);

      ctx.font = '36px Arial';
      ctx.fillText(data.title || 'Achievement', canvas.width / 2, 200);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), 'image/png');
      });

      return { success: true, blob };
    } catch (error) {
      console.error('Failed to generate share image:', error);
      return { success: false, error };
    }
  }

  /**
   * Log share activity
   */
  private static async logShare(shareType: string, platform: string, data: any) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase.from('share_logs').insert({
        user_id: user.user.id,
        share_type: shareType,
        platform,
        content_shared: JSON.stringify(data),
      });

      // Award social engagement points
      await supabase
        .from('wallet_balances')
        .update({
          total_balance: supabase.sql`total_balance + 5`,
          total_earned: supabase.sql`total_earned + 5`,
        })
        .eq('user_id', user.user.id);
    } catch (error) {
      console.error('Failed to log share:', error);
    }
  }

  /**
   * Get share statistics
   */
  static async getShareStats(userId: string) {
    try {
      const { data: stats, error } = await supabase
        .from('share_logs')
        .select('platform, count')
        .eq('user_id', userId);

      if (error) throw error;

      const platformCounts = stats?.reduce((acc, stat) => {
        acc[stat.platform] = (acc[stat.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return { success: true, stats: platformCounts };
    } catch (error) {
      console.error('Failed to get share stats:', error);
      return { success: false, error };
    }
  }
}
