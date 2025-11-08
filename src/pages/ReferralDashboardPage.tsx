import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Users, Gift } from 'lucide-react';

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  active_referrals: number;
  total_earned: number;
}

interface ReferredUser {
  id: string;
  name: string;
  joined_date: string;
  status: 'active' | 'inactive';
  earnings_contributed: number;
}

export const ReferralDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<ReferredUser[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Set default referral code
      const defaultReferralCode = 'YOGIC' + user.id.slice(0, 6).toUpperCase();
      
      // For now, just show default values since referrals_new table may not exist
      // This will be updated when the table is properly configured
      setStats({
        referral_code: defaultReferralCode,
        total_referrals: 0,
        active_referrals: 0,
        total_earned: 0,
      });
      
      setReferrals([]);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Set default values on any error
      setStats({
        referral_code: 'YOGIC' + user.id.slice(0, 6).toUpperCase(),
        total_referrals: 0,
        active_referrals: 0,
        total_earned: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareCode = () => {
    const text = `Join YogicMile and earn money by walking! Use my referral code: ${stats?.referral_code} to get a bonus!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join YogicMile',
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Referral message copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-green-600" />
            Referral Program
          </h1>
          <p className="text-gray-600">Invite friends and earn rewards</p>
        </div>

        <Card className="mb-6 bg-white shadow-lg border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={stats?.referral_code || ''}
                readOnly
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg font-mono font-bold text-lg bg-gray-50"
              />
              <Button 
                onClick={handleCopyCode}
                className={`${copied ? 'bg-green-600' : 'bg-blue-600'}`}
              >
                <Copy className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button 
                onClick={handleShareCode}
                variant="outline"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Share this code with friends. When they join using your code, you both get bonuses!
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.total_referrals || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Friends joined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.active_referrals || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Still active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{((stats?.total_earned || 0) / 100).toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">From referrals</p>
            </CardContent>
          </Card>
        </div>

        {referrals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div 
                    key={referral.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-sm text-gray-500">Joined {referral.joined_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{(referral.earnings_contributed / 100).toFixed(2)}</p>
                      <p className={`text-xs px-2 py-1 rounded ${referral.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {referral.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {referrals.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No referrals yet. Share your code to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReferralDashboardPage;
