import React, { useState, useEffect } from 'react';
import { Settings, Share2, LogOut, Trophy, Calendar, Target, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReferralCard } from '@/components/ReferralCard';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LegalPolicyModal } from '@/components/LegalPolicyModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, signOut, isLoading: authLoading } = useAuth();
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');
  const [userStats, setUserStats] = useState({
    totalSteps: 0,
    totalCoins: 0,
    totalEarned: 0,
    currentStreak: 0,
    joinDate: '',
    currentPhase: 'Paisa Phase 🪙',
    displayName: 'Yogic Walker'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Profile | Yogic Mile';
    if (user) {
      setLoading(true);
      loadUserData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Use user from AuthContext instead of separate auth check
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError) {
        console.error('Error fetching wallet:', walletError);
      }

      // Fetch total steps from daily_steps table
      const { data: steps, error: stepsError } = await supabase
        .from('daily_steps')
        .select('steps')
        .eq('user_id', user.id);

      if (stepsError) {
        console.error('Error fetching steps:', stepsError);
      }

      const totalSteps = steps?.reduce((sum, log) => sum + log.steps, 0) || 0;

      // Fetch user phase
      const { data: userPhase, error: phaseError } = await supabase
        .from('user_phases')
        .select('current_phase, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (phaseError) {
        console.error('Error fetching phase:', phaseError);
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Calculate streak from daily_steps table
      const { data: recentLogs, error: logsError } = await supabase
        .from('daily_steps')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (logsError) {
        console.error('Error fetching recent logs:', logsError);
      }

      let currentStreak = 0;
      if (recentLogs && recentLogs.length > 0) {
        const today = new Date();
        let checkDate = new Date(today);
        
        for (let i = 0; i < recentLogs.length; i++) {
          const logDate = new Date(recentLogs[i].date);
          if (logDate.toDateString() === checkDate.toDateString()) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      setUserStats({
        totalSteps: totalSteps,
        totalCoins: wallet?.total_balance || 0,
        totalEarned: wallet?.total_earned || 0,
        currentStreak: currentStreak,
        joinDate: userPhase?.created_at ? new Date(userPhase.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
        currentPhase: String(userPhase?.current_phase || 'Paisa Phase 🪙'),
        displayName: String(profile?.full_name || 'Yogic Walker')
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({ 
        title: "Error loading profile", 
        description: "Some data may not be available",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast({ title: "Error signing out", variant: "destructive" });
    }
  };

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalModalTab(tab);
    setShowLegalModal(true);
  };

  const menuItems = [
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      description: 'App preferences & notifications',
      action: () => navigate('/settings')
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: 'Refer Friends',
      description: 'Earn bonus coins for referrals',
      action: () => navigate('/referral')
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Achievements',
      description: 'View your milestones',
      action: () => navigate('/achievements')
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Goals',
      description: 'Set daily step targets',
      action: () => navigate('/goals')
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: 'Legal & Privacy',
      description: 'Privacy Policy & Terms of Service',
      action: () => openLegalModal('privacy')
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'Help & Support',
      description: 'Get help and find answers',
      action: () => navigate('/help')
    }
  ];

  // Auth/loading states
  if (authLoading || loading) {
    return (
      <div className="mobile-container bg-background p-4 pb-24 safe-bottom flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mobile-container bg-background p-6 pb-24 safe-bottom flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">Authentication required</h1>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Button className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background p-4 pb-24 safe-bottom">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <span className="text-2xl">👤</span>
            Profile
          </h1>
        </div>


        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarFallback className="text-2xl bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya text-white">
              {userStats.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{userStats.displayName}</h1>
            <p className="text-muted-foreground">Member since {userStats.joinDate}</p>
            <Badge className="mt-2 bg-gradient-to-r from-tier-3-token to-tier-5-diamond text-white">
              {userStats.currentPhase}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="stat-card">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl font-bold text-tier-1-paisa">{userStats.totalSteps.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Steps</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl font-bold text-tier-2-rupaya">{userStats.totalCoins.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Coins</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-3 sm:p-4 text-center">
              <p className="text-2xl font-bold text-tier-3-token">{userStats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="stat-card">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">{userStats.totalEarned.toLocaleString()}</p>
              </div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <ReferralCard />

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="nav-card"
              onClick={item.action}
            >
              <CardContent className="p-4 min-h-[60px] flex items-center">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        
      </div>

      <LegalPolicyModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
};