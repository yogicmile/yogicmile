import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Coins, 
  TrendingUp, 
  Calendar, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  XCircle,
  Filter,
  BarChart3,
  Footprints
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CoinsHistoryChart from '@/components/CoinsHistoryChart';
import DailyHistoryCard from '@/components/DailyHistoryCard';
import StatsSummaryCard from '@/components/StatsSummaryCard';

interface CoinHistoryEntry {
  id: string;
  date: Date;
  steps: number;
  coinsEarned: number;
  rupeeValue: number;
  status: 'redeemed' | 'expired' | 'pending';
  redeemedAt?: Date;
  tier: string;
  bonusCoins?: number;
}

const filterTabs = [
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all', label: 'All Time' }
];

const mockHistoryData: CoinHistoryEntry[] = [
  {
    id: '1',
    date: new Date(),
    steps: 8542,
    coinsEarned: 85,
    rupeeValue: 0.85,
    status: 'pending',
    tier: 'Golden Path',
    bonusCoins: 10
  },
  {
    id: '2',
    date: new Date(Date.now() - 86400000),
    steps: 12340,
    coinsEarned: 123,
    rupeeValue: 1.23,
    status: 'redeemed',
    redeemedAt: new Date(Date.now() - 43200000),
    tier: 'Golden Path'
  },
  {
    id: '3',
    date: new Date(Date.now() - 172800000),
    steps: 6780,
    coinsEarned: 68,
    rupeeValue: 0.68,
    status: 'expired',
    tier: 'Silver Steps'
  },
  {
    id: '4',
    date: new Date(Date.now() - 259200000),
    steps: 9456,
    coinsEarned: 95,
    rupeeValue: 0.95,
    status: 'redeemed',
    redeemedAt: new Date(Date.now() - 216000000),
    tier: 'Golden Path'
  },
  {
    id: '5',
    date: new Date(Date.now() - 345600000),
    steps: 7234,
    coinsEarned: 72,
    rupeeValue: 0.72,
    status: 'redeemed',
    redeemedAt: new Date(Date.now() - 302400000),
    tier: 'Silver Steps'
  }
];

const CoinsHistory = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const currentBalance = {
    coins: 450,
    rupees: 4.50
  };

  const getFilteredData = () => {
    let filtered = mockHistoryData;
    
    if (activeFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => entry.date >= weekAgo);
    } else if (activeFilter === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(entry => entry.date >= monthAgo);
    }

    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.coinsEarned.toString().includes(searchQuery) ||
        entry.steps.toString().includes(searchQuery)
      );
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.date.getTime() - a.date.getTime();
      if (sortBy === 'highest') return b.coinsEarned - a.coinsEarned;
      if (sortBy === 'steps') return b.steps - a.steps;
      return 0;
    });
  };

  const filteredData = getFilteredData();
  const totalCoins = filteredData.reduce((sum, entry) => sum + entry.coinsEarned, 0);
  const totalSteps = filteredData.reduce((sum, entry) => sum + entry.steps, 0);
  const redemptionRate = Math.round(
    (filteredData.filter(entry => entry.status === 'redeemed').length / filteredData.length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-green-50/50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">🕉️ Yogic Mile</div>
              <div className="text-xs text-muted-foreground">Walk. Earn. Evolve.</div>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-2xl">💪</div>
              <h1 className="text-2xl font-bold text-foreground">Your Earning Journey</h1>
            </div>
            <p className="text-sm text-muted-foreground">Track your rewards over time</p>
          </div>

          {/* Current Balance */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Current Balance</div>
                <div className="text-2xl font-bold text-primary">
                  ₹{currentBalance.rupees.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  ({currentBalance.coins} coins)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Filter Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex bg-muted rounded-lg p-1 relative">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all relative z-10 ${
                    activeFilter === tab.id
                      ? 'text-primary-foreground bg-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Showing {filteredData.length} days of walking
            </div>
          </CardContent>
        </Card>

        {/* Search and Sort */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by amount or steps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'newest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('newest')}
              >
                Newest First
              </Button>
              <Button
                variant={sortBy === 'highest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('highest')}
              >
                Highest Coins
              </Button>
              <Button
                variant={sortBy === 'steps' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('steps')}
              >
                Most Steps
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend Chart */}
        <CoinsHistoryChart data={filteredData} />

        {/* Statistics Summary */}
        <StatsSummaryCard
          totalCoins={totalCoins}
          totalSteps={totalSteps}
          redemptionRate={redemptionRate}
          period={activeFilter}
        />

        {/* Daily History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Daily History</h2>
          </div>
          
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">🚶‍♀️</div>
                <h3 className="text-lg font-semibold mb-2">Start Your Mindful Journey</h3>
                <p className="text-muted-foreground">
                  Begin walking to see your first coins appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((entry) => (
              <DailyHistoryCard key={entry.id} entry={entry} />
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredData.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <Button variant="outline" className="w-full">
                Load More History
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoinsHistory;