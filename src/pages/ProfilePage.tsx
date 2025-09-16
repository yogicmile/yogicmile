import React from 'react';
import { User, Settings, Share2, LogOut, Trophy, Calendar, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ReferralCard } from '@/components/ReferralCard';

export const ProfilePage = () => {
  const userStats = {
    totalSteps: 847500,
    totalCoins: 12450,
    currentStreak: 15,
    joinDate: 'January 2024',
    currentPhase: 'Gem Phase 💎'
  };

  const menuItems = [
    {
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings',
      description: 'App preferences & notifications'
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      label: 'Refer Friends',
      description: 'Earn bonus coins for referrals'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Achievements',
      description: 'View your milestones'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: 'Goals',
      description: 'Set daily step targets'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
            <span className="text-2xl">👤</span>
            Profile
          </h1>
        </div>

        {/* Top Ad Banner */}
        <DynamicAdBanner position="top" page="profile" />

        {/* Profile Header */}
        <div className="text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarFallback className="text-2xl bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya text-white">
              YM
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Yogic Walker</h1>
            <p className="text-muted-foreground">Member since {userStats.joinDate}</p>
            <Badge className="mt-2 bg-gradient-to-r from-tier-3-token to-tier-5-diamond text-white">
              {userStats.currentPhase}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-tier-1-paisa">{userStats.totalSteps.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Steps</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-tier-2-rupaya">{userStats.totalCoins.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Coins</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-tier-3-token">{userStats.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">365</p>
              </div>
              <p className="text-sm text-muted-foreground">Days Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <ReferralCard />

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
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
        <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        
        {/* Bottom Ad Banner */}
        <DynamicAdBanner position="bottom" page="profile" />
      </div>
    </div>
  );
};