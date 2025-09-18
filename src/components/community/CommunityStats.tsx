import React, { useState, useEffect } from 'react';
import { Users, Trophy, MessageSquare, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useCommunity } from '@/hooks/use-community';
import type { CommunityStats as CommunityStatsType } from '@/types/community';

export const CommunityStats = () => {
  const [stats, setStats] = useState<CommunityStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { getCommunityStats } = useCommunity();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const communityStats = await getCommunityStats();
        setStats(communityStats);
      } catch (error) {
        console.error('Error loading community stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [getCommunityStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="bg-card/60 backdrop-blur-sm border-primary/20">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-primary/20 rounded-lg mb-2"></div>
                <div className="h-6 bg-primary/20 rounded mb-1"></div>
                <div className="h-4 bg-primary/20 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Members',
      value: stats?.total_users || 0,
      color: 'text-blue-600'
    },
    {
      icon: Trophy,
      label: 'Active Challenges',
      value: stats?.active_challenges || 0,
      color: 'text-orange-600'
    },
    {
      icon: MessageSquare,
      label: 'Forum Posts',
      value: stats?.total_posts || 0,
      color: 'text-purple-600'
    },
    {
      icon: UserPlus,
      label: 'Friendships',
      value: stats?.total_friendships || 0,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card 
          key={index} 
          className="bg-card/60 backdrop-blur-sm border-primary/20 hover:bg-card/80 transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};