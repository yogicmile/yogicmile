import React, { useState } from 'react';
import { Users, Trophy, UserPlus, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommunityProfiles } from '@/components/community/CommunityProfiles';
import { CommunityLeaderboards } from '@/components/community/CommunityLeaderboards';
import { CommunityFriends } from '@/components/community/CommunityFriends';
import { CommunityForums } from '@/components/community/CommunityForums';
import { CommunityStats } from '@/components/community/CommunityStats';
import { useCommunity } from '@/hooks/use-community';

export const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const { getCommunityStats } = useCommunity();

  const tabs = [
    {
      id: 'profiles',
      label: 'Profiles',
      icon: Users,
      component: CommunityProfiles
    },
    {
      id: 'leaderboards',
      label: 'Leaderboards',
      icon: Trophy,
      component: CommunityLeaderboards
    },
    {
      id: 'friends',
      label: 'Friends',
      icon: UserPlus,
      component: CommunityFriends
    },
    {
      id: 'forums',
      label: 'Forums',
      icon: MessageSquare,
      component: CommunityForums
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Yogic Mile Community
          </h1>
          <p className="text-muted-foreground">
            Connect, compete, and inspire each other on your wellness journey
          </p>
        </div>

        {/* Community Stats */}
        <CommunityStats />

        {/* Main Tabs */}
        <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  <div className="animate-fade-in">
                    <tab.component />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};