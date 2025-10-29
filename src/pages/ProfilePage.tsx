import React, { useState, useEffect, useRef } from 'react';
import { Settings, Share2, LogOut, Trophy, Calendar, Target, Shield, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReferralCard } from '@/components/ReferralCard';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LegalPolicyModal } from '@/components/LegalPolicyModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProfilePageSkeleton } from '@/components/ui/wallet-skeleton';
import { PhotoUploadService } from '@/services/PhotoUploadService';


export const ProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');
  const [userStats, setUserStats] = useState({
    totalSteps: 0,
    totalCoins: 0,
    totalEarned: 0,
    currentStreak: 0,
    joinDate: '',
    currentPhase: 'Paisa Phase 🪙',
    displayName: 'Yogic Walker',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Profile | Yogic Mile';
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    setLoading(true);
    loadUserData();
  }, [authLoading, user]);


  const loadUserData = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (walletError) {
        console.error('Error fetching wallet:', walletError);
      }

      // Fetch total steps from daily_steps table
      const { data: steps, error: stepsError } = await supabase
        .from('daily_steps')
        .select('steps')
        .eq('user_id', user!.id);

      if (stepsError) {
        console.error('Error fetching steps:', stepsError);
      }

      const totalSteps = steps?.reduce((sum, log) => sum + log.steps, 0) || 0;

      // Fetch user phase
      const { data: userPhase, error: phaseError } = await supabase
        .from('user_phases')
        .select('current_phase, created_at')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (phaseError) {
        console.error('Error fetching phase:', phaseError);
      }

      // Fetch profile with avatar
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('display_name, profile_picture_url')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Calculate streak from daily_steps table
      const { data: recentLogs, error: logsError } = await supabase
        .from('daily_steps')
        .select('date')
        .eq('user_id', user!.id)
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
        displayName: String(profile?.display_name || 'Yogic Walker'),
        avatarUrl: String(profile?.profile_picture_url || '')
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

  const handleShareApp = async () => {
    const referralCode = user?.user_metadata?.mobile_number || user?.phone || 'YOGICMILE';
    const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareText = `Join me on Yogic Mile! Walk daily and earn rewards. Use my referral code: ${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Yogic Mile', text: shareText, url: shareUrl });
        toast({ title: "Shared successfully!", description: "Thanks for spreading the word!" });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({ title: "Link copied!", description: "Share link copied to clipboard" });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Compress image before upload
      const compressed = await PhotoUploadService.compressImage(file, 512, 0.8);
      
      // Upload to profile-photos bucket
      const result = await PhotoUploadService.uploadProfilePhoto(compressed);
      
      if (result.success && result.url) {
        setUserStats(prev => ({ ...prev, avatarUrl: result.url! }));
        toast({ title: "Success!", description: "Profile photo updated" });
      } else {
        throw new Error(result.error as string);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ 
        title: "Upload failed", 
        description: "Could not update profile photo",
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
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
      label: 'Share App',
      description: 'Invite friends and earn rewards',
      action: handleShareApp
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
    return <ProfilePageSkeleton />;
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
          <div className="relative w-24 h-24 mx-auto group">
            <Avatar className="w-24 h-24">
              {userStats.avatarUrl && <AvatarImage src={userStats.avatarUrl} alt={userStats.displayName} />}
              <AvatarFallback className="text-2xl bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya text-white">
                {userStats.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
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