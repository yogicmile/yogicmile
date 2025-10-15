import { useState, useEffect } from 'react';
import { Copy, Share2, Users, Gift, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ReferralStats {
  referralCode: string;
  friendsJoined: number;
  totalEarned: number;
  pendingBonuses: number;
  referredFriends: Array<{
    mobile: string;
    status: string;
    joinedAt: string;
    bonusEarned: boolean;
  }>;
  giftedSteps: {
    totalStepsGifted: number;
    phaseBoost: number;
    todayActive: number;
  };
}

export const ReferralCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats>({
    referralCode: '',
    friendsJoined: 0,
    totalEarned: 0,
    pendingBonuses: 0,
    referredFriends: [],
    giftedSteps: {
      totalStepsGifted: 0,
      phaseBoost: 0,
      todayActive: 0
    }
  });
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralStats();
    }
  }, [user]);

  const fetchReferralStats = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      // Get user's referral code
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('referral_code, mobile_number')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        toast({
          title: "Error loading referral data",
          variant: "destructive"
        });
        return;
      }

      if (!userProfile) {
        toast({
          title: "Profile not found",
          description: "Please complete your profile setup",
          variant: "destructive"
        });
        return;
      }

      // Get referral relationships where this user is the referrer
      const { data: referrals } = await supabase
        .from('referrals_new')
        .select('*')
        .eq('referrer_mobile', userProfile.mobile_number);

      // Get bonus earnings from referrals (cash bonuses)
      const { data: bonusEarnings } = await supabase
        .from('bonus_logs')
        .select('amount_paisa')
        .eq('user_id', user.id)
        .in('bonus_type', ['referral', 'referral_signup_cash']);

      // Get gifted steps statistics
      const { data: giftedStepsData } = await supabase
        .from('step_bonuses_log')
        .select('steps_awarded, awarded_date')
        .eq('recipient_user_id', user.id)
        .in('bonus_type', ['referral_signup', 'referral_daily_gift', 'community_motivation']);

      const totalStepsGifted = giftedStepsData?.reduce((sum, log) => sum + log.steps_awarded, 0) || 0;
      
      // Count active referees today (gifted steps today)
      const today = new Date().toISOString().split('T')[0];
      const todayActive = giftedStepsData?.filter(log => 
        log.awarded_date === today
      ).length || 0;

      // Calculate phase boost (simple estimate: every 10k steps = ~5% boost)
      const phaseBoost = Math.min(Math.round((totalStepsGifted / 10000) * 5), 100);

      const totalEarned = bonusEarnings?.reduce((sum, bonus) => sum + bonus.amount_paisa, 0) || 0;
      const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;

      setStats({
        referralCode: userProfile.referral_code || '',
        friendsJoined: completedReferrals,
        totalEarned,
        pendingBonuses: pendingReferrals,
        referredFriends: referrals?.map(r => ({
          mobile: r.referee_mobile,
          status: r.status,
          joinedAt: r.created_at,
          bonusEarned: r.status === 'completed'
        })) || [],
        giftedSteps: {
          totalStepsGifted,
          phaseBoost: Math.min(phaseBoost, 100),
          todayActive
        }
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!stats.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareReferralCode = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`;
    const shareText = `Join me on Yogic Mile and earn real money by walking! 

🚶‍♂️ Health is Wealth - Complete 10,000 steps to unlock bonuses!

Use my code ${stats.referralCode} or click this link to sign up:
${referralLink}

Download: https://yogicmile.app #YogicMile #HealthIsWealth`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join Yogic Mile',
          text: shareText,
          url: 'https://yogicmile.app'
        });

        // Log the share event
        await supabase.from('share_logs').insert({
          user_id: user?.id,
          share_type: 'referral',
          share_context: 'referral_code_share',
          content_shared: shareText,
          platform: 'native_share'
        });
      } else {
        // Fallback to copying
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Share text copied",
          description: "Share text copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "Share failed",
        description: "Unable to share at this time",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            My Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-16 bg-secondary/20 rounded-lg animate-pulse" />
          <div className="h-8 bg-secondary/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          My Referral Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Referral Code Display */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {stats.referralCode}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Share this code with friends
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyReferralCode}
              className="flex-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={shareReferralCode}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Invite Friends
            </Button>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.friendsJoined}
            </div>
            <p className="text-xs text-muted-foreground">Friends Joined</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              ₹{(stats.totalEarned / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
        </div>

        {/* Gifted Steps Dashboard */}
        {stats.giftedSteps.totalStepsGifted > 0 && (
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Bonus Steps from Referrals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.giftedSteps.totalStepsGifted.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Gifted</div>
                </div>
                <div className="bg-white/70 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    +{stats.giftedSteps.phaseBoost}%
                  </div>
                  <div className="text-xs text-muted-foreground">Phase Boost</div>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Active Today</span>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                    <Users className="w-3 h-3 mr-1" />
                    {stats.giftedSteps.todayActive} friends
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  💡 Your friends walking accelerates your phase progression!
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {stats.pendingBonuses > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>{stats.pendingBonuses}</strong> friend(s) need to complete <strong>10,000 steps</strong> to unlock bonuses
            </p>
          </div>
        )}

        {/* Referred Friends List */}
        {stats.referredFriends.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Referred Friends:</h4>
            {stats.referredFriends.map((friend, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary/20 rounded-lg p-3">
                <div>
                  <div className="font-medium text-sm">
                    {friend.mobile.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1*****$3')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(friend.joinedAt).toLocaleDateString()}
                  </div>
                </div>
                <Badge 
                  variant={friend.status === 'completed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {friend.status === 'completed' ? '✓ Bonus Earned' : 'Pending Steps'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* How it Works */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💚🚶‍♂️</span>
            <h4 className="font-medium text-sm text-green-800">10% Step Gift System</h4>
          </div>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• <strong>Signup:</strong> You get ₹1.00 cash + 5,000 bonus steps</li>
            <li>• <strong>Daily Gift (30 days):</strong> 10% of friend's steps added to your phase progress</li>
            <li>• <strong>Motivations:</strong> 500 bonus steps when community motivates your friends</li>
            <li>• 💪 Bonus steps accelerate your phase advancement = higher earnings!</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};