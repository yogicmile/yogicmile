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
}

export const ReferralCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<ReferralStats>({
    referralCode: '',
    friendsJoined: 0,
    totalEarned: 0,
    pendingBonuses: 0,
    referredFriends: []
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

      // Get bonus earnings from referrals
      const { data: bonusEarnings } = await supabase
        .from('bonus_logs')
        .select('amount_paisa')
        .eq('user_id', user.id)
        .eq('bonus_type', 'referral');

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
        })) || []
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
    const shareText = `Join me on Yogic Mile and earn real money by walking! Use my code ${stats.referralCode} to get ₹1 bonus. Download: https://yogicmile.app #YogicMile #WalkEarnEvolve`;
    
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

        {stats.pendingBonuses > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>{stats.pendingBonuses}</strong> friend(s) need to complete 1,000 steps to unlock bonuses
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-sm text-blue-800 mb-2">How Referrals Work:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Friend uses your code during signup → You both get bonuses</li>
            <li>• You earn ₹2.00, they get ₹1.00 welcome bonus</li>
            <li>• Bonus activates when they complete 1,000 steps</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};