import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Users, MapPin, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunity } from '@/hooks/use-community';
import type { LeaderboardEntry } from '@/types/community';

export const CommunityLeaderboards = () => {
  const [leaderboards, setLeaderboards] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');
  const [activeCategory, setActiveCategory] = useState<'global' | 'friends' | 'local'>('global');
  const { getLeaderboards } = useCommunity();

  useEffect(() => {
    loadLeaderboards();
  }, [activePeriod, activeCategory]);

  const loadLeaderboards = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboards(activePeriod, activeCategory);
      setLeaderboards(data as LeaderboardEntry[]);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            {position}
          </div>
        );
    }
  };

  const getRankStyles = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-300";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white border-amber-400";
      default:
        return "bg-card border-border";
    }
  };

  const categories = [
    { id: 'global', label: 'Global', icon: TrendingUp, description: 'Top walkers worldwide' },
    { id: 'friends', label: 'Friends', icon: Users, description: 'Your friend network' },
    { id: 'local', label: 'Local', icon: MapPin, description: 'Your city/region' }
  ];

  const periods = [
    { id: 'weekly', label: 'This Week', icon: Clock },
    { id: 'monthly', label: 'This Month', icon: Calendar },
    { id: 'all_time', label: 'All Time', icon: Trophy }
  ];

  return (
    <div className="space-y-6">
      {/* Period and Category Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Period Selection */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {periods.map((period) => (
                <Button
                  key={period.id}
                  variant={activePeriod === period.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePeriod(period.id as typeof activePeriod)}
                  className="flex-1"
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category.id as typeof activeCategory)}
                  className="flex-1"
                >
                  <category.icon className="w-4 h-4 mr-1" />
                  {category.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            {categories.find(c => c.id === activeCategory)?.label} Leaderboard
            <Badge variant="outline" className="ml-2">
              {periods.find(p => p.id === activePeriod)?.label}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            {categories.find(c => c.id === activeCategory)?.description}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 rounded-lg animate-pulse">
                  <div className="w-12 h-12 bg-primary/20 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-primary/20 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-primary/20 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-primary/20 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : leaderboards.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leaderboard data yet</h3>
              <p className="text-muted-foreground">
                Start walking and competing to see leaderboard rankings!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboards.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`${getRankStyles(entry.rank_position)} hover:shadow-lg transition-all duration-200`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        {getRankIcon(entry.rank_position)}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={entry.user_profile?.profile_picture_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {entry.user_profile?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {entry.user_profile?.display_name || 'Unknown User'}
                          </p>
                          {entry.user_profile?.location_city && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {entry.user_profile.location_city}
                                {entry.user_profile.location_state && `, ${entry.user_profile.location_state}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-lg">
                          {entry.steps.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          steps
                        </div>
                        {entry.coins_earned > 0 && (
                          <div className="text-xs text-primary font-medium">
                            {entry.coins_earned} coins
                          </div>
                        )}
                      </div>

                      {/* Special Badges */}
                      <div className="flex flex-col gap-1">
                        {entry.weeks_active >= 4 && (
                          <Badge variant="outline" className="text-xs">
                            Consistent
                          </Badge>
                        )}
                        {entry.rank_position <= 10 && activePeriod === 'weekly' && (
                          <Badge variant="outline" className="text-xs">
                            Top 10
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="text-center space-y-2">
        <Button
          onClick={loadLeaderboards}
          disabled={loading}
          variant="outline"
          className="w-full max-w-sm"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {loading ? 'Updating...' : 'Refresh Rankings'}
        </Button>
        {leaderboards.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Leaderboards are populated automatically based on step data
          </p>
        )}
      </div>
    </div>
  );
};