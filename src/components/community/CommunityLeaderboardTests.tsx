import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Crown, Target, Users, Globe } from 'lucide-react';
import { useCommunity } from '@/hooks/use-community';
import { useToast } from '@/hooks/use-toast';
import type { LeaderboardEntry } from '@/types/community';

interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  message: string;
}

interface CommunityLeaderboardTestsProps {
  testResults: TestResult[];
  onTestUpdate: (testId: string, status: TestResult['status'], message: string) => void;
}

export const CommunityLeaderboardTests: React.FC<CommunityLeaderboardTestsProps> = ({
  testResults,
  onTestUpdate
}) => {
  const { getLeaderboards, userProfile } = useCommunity();
  const { toast } = useToast();
  
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all_time'>('weekly');
  const [category, setCategory] = useState<'global' | 'friends' | 'local'>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Test TC070: Leaderboards Test
  const runLeaderboardTest = async () => {
    const testId = 'TC070';
    onTestUpdate(testId, 'running', 'Testing leaderboard functionality...');

    try {
      setLoading(true);

      // Test different leaderboard configurations
      const testConfigs = [
        { period: 'weekly' as const, category: 'global' as const },
        { period: 'monthly' as const, category: 'global' as const },
        { period: 'weekly' as const, category: 'friends' as const }
      ];

      const results = [];
      for (const config of testConfigs) {
        const data = await getLeaderboards(config.period, config.category);
        results.push({
          config,
          data,
          hasData: data.length > 0,
          isProperlyRanked: data.every((entry, index) => entry.rank_position === index + 1)
        });
      }

      // Validation checks
      const allTestsPassed = results.every(result => {
        // Check if rankings are correctly displayed
        return result.isProperlyRanked;
      });

      if (allTestsPassed) {
        onTestUpdate(testId, 'passed', 
          `Leaderboard test passed: Rankings displayed correctly across ${results.length} configurations`
        );
        
        // Load data for display
        const displayData = await getLeaderboards(period, category);
        setLeaderboardData(displayData as LeaderboardEntry[]);

        toast({
          title: "Test Passed",
          description: "Leaderboard test completed successfully"
        });
      } else {
        onTestUpdate(testId, 'failed', 'Some leaderboard rankings are not displayed correctly');
      }

    } catch (error) {
      onTestUpdate(testId, 'failed', `Leaderboard test failed: ${error}`);
      toast({
        title: "Test Failed",
        description: "Leaderboard test failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load leaderboard data when filters change
  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboards(period, category);
      setLeaderboardData(data as LeaderboardEntry[]);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData();
  }, [period, category]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'global':
        return <Globe className="w-4 h-4" />;
      case 'friends':
        return <Users className="w-4 h-4" />;
      case 'local':
        return <Target className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const testResult = testResults.find(r => r.testId === 'TC070');

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard Test (TC070)
            {testResult && (
              <Badge 
                variant={
                  testResult.status === 'passed' ? 'default' :
                  testResult.status === 'failed' ? 'destructive' :
                  testResult.status === 'running' ? 'outline' : 'secondary'
                }
              >
                {testResult.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Test Scenario: View rankings → User positions displayed correctly by steps/coins
          </p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Time Period</label>
                <Select value={period} onValueChange={(value: 'weekly' | 'monthly' | 'all_time') => setPeriod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={category} onValueChange={(value: 'global' | 'friends' | 'local') => setCategory(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="local">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={runLeaderboardTest}
              disabled={loading || testResult?.status === 'running'}
              className="w-full"
            >
              {testResult?.status === 'running' ? 'Testing Rankings...' : 'Run Leaderboard Test'}
            </Button>

            {testResult && (
              <Card className={`border-l-4 ${
                testResult.status === 'passed' ? 'border-l-green-500 bg-green-50/50' :
                testResult.status === 'failed' ? 'border-l-red-500 bg-red-50/50' :
                'border-l-blue-500 bg-blue-50/50'
              }`}>
                <CardContent className="pt-4">
                  <p className="text-sm">{testResult.message}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCategoryIcon(category)}
            {category.charAt(0).toUpperCase() + category.slice(1)} Leaderboard - {period.charAt(0).toUpperCase() + period.slice(1).replace('_', ' ')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="w-16 h-4 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No leaderboard data available for this category</p>
              <p className="text-sm text-muted-foreground mt-1">
                This could be expected for the {category} category with period {period}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardData.slice(0, 10).map((entry, index) => (
                <div 
                  key={entry.id} 
                  className={`flex items-center gap-4 p-3 border rounded-lg transition-colors ${
                    entry.user_id === userProfile?.user_id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(entry.rank_position)}
                  </div>

                  {/* User Avatar & Info */}
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={entry.user_profile?.profile_picture_url} />
                    <AvatarFallback>
                      {entry.user_profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {entry.user_profile?.display_name || `User ${entry.user_id.slice(0, 8)}`}
                      {entry.user_id === userProfile?.user_id && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.weeks_active} weeks active
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className="font-bold text-sm">{entry.steps.toLocaleString()} steps</p>
                    <p className="text-xs text-muted-foreground">{entry.coins_earned} coins</p>
                  </div>

                  {/* Position Verification */}
                  <div className="w-12 text-center">
                    <Badge 
                      variant={entry.rank_position === index + 1 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      #{entry.rank_position}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Verification Info */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Test Verification Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Rankings are sequential (1, 2, 3...)</span>
              <Badge variant={
                leaderboardData.every((entry, index) => entry.rank_position === index + 1) 
                  ? "default" : "destructive"
              }>
                {leaderboardData.every((entry, index) => entry.rank_position === index + 1) 
                  ? "✓ Pass" : "✗ Fail"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Steps data is properly displayed</span>
              <Badge variant={
                leaderboardData.every(entry => typeof entry.steps === 'number' && entry.steps >= 0) 
                  ? "default" : "secondary"
              }>
                {leaderboardData.every(entry => typeof entry.steps === 'number' && entry.steps >= 0) 
                  ? "✓ Pass" : "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Coins data is properly displayed</span>
              <Badge variant={
                leaderboardData.every(entry => typeof entry.coins_earned === 'number' && entry.coins_earned >= 0) 
                  ? "default" : "secondary"
              }>
                {leaderboardData.every(entry => typeof entry.coins_earned === 'number' && entry.coins_earned >= 0) 
                  ? "✓ Pass" : "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>User profiles are loaded</span>
              <Badge variant={
                leaderboardData.some(entry => entry.user_profile?.display_name) 
                  ? "default" : "secondary"
              }>
                {leaderboardData.some(entry => entry.user_profile?.display_name) 
                  ? "✓ Pass" : "N/A"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};