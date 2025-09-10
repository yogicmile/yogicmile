import { useState } from 'react';
import { ArrowLeft, Wallet, RefreshCw, Filter, Search, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BalanceCard } from '@/components/BalanceCard';
import { QuickActions } from '@/components/QuickActions';
import { TransactionHistory } from '@/components/TransactionHistory';
import { WalletAnalytics } from '@/components/WalletAnalytics';
import { useYogicMileData } from '@/hooks/use-mock-data';

export const WalletPage = () => {
  const navigate = useNavigate();
  const yogicData = useYogicMileData();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  const walletStats = {
    currentBalance: yogicData.wallet.mockData.totalBalance,
    todaysEarnings: 35,
    weeklyEarnings: yogicData.wallet.mockData.thisWeekEarnings,
    lifetimeEarnings: 2450,
    coinBalance: yogicData.wallet.mockData.totalBalance * 100,
    lastUpdated: '2 minutes ago'
  };

  const handleRefresh = () => {
    // Simulate refresh action
    console.log('Refreshing wallet data...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
      {/* Header */}
      <div className="bg-surface/80 backdrop-blur-md border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="p-1"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Yogic Mile Branding */}
          <div className="text-center mb-2">
            <div className="text-xs text-tier-1-paisa font-medium">Walk. Earn. Evolve.</div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold font-display flex items-center justify-center gap-2">
              <Wallet className="w-6 h-6 text-tier-1-paisa" />
              Your Mindful Wallet
            </h1>
            <p className="text-sm text-muted-foreground">Manage your earned rewards consciously</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Current Balance Section */}
        <BalanceCard 
          balance={walletStats.currentBalance}
          coinBalance={walletStats.coinBalance}
          todaysEarnings={walletStats.todaysEarnings}
          weeklyEarnings={walletStats.weeklyEarnings}
          lifetimeEarnings={walletStats.lifetimeEarnings}
          lastUpdated={walletStats.lastUpdated}
        />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <QuickActions balance={walletStats.currentBalance} />
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Recent Transactions Preview */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Recent Transactions</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setActiveTab('history')}
                >
                  View All
                </Button>
              </div>
              <TransactionHistory 
                transactions={yogicData.wallet.mockData.transactionHistory.slice(0, 3)}
                searchTerm={searchTerm}
                compact={true}
              />
            </div>

            {/* Achievement Highlights */}
            <div className="bg-gradient-to-r from-tier-1-paisa/10 to-tier-2-rupaya/10 rounded-2xl p-4 border border-tier-1-paisa/20">
              <h3 className="font-semibold mb-3">This Week's Highlights</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-tier-1-paisa">₹{walletStats.weeklyEarnings}</div>
                  <div className="text-xs text-muted-foreground">Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tier-3-token">7</div>
                  <div className="text-xs text-muted-foreground">Days Active</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <TransactionHistory 
              transactions={yogicData.wallet.mockData.transactionHistory}
              searchTerm={searchTerm}
              compact={false}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <WalletAnalytics 
              totalEarnings={walletStats.lifetimeEarnings}
              weeklyEarnings={walletStats.weeklyEarnings}
              transactionHistory={yogicData.wallet.mockData.transactionHistory}
            />
          </TabsContent>
        </Tabs>

        {/* Export/Download Section */}
        <div className="bg-secondary/30 rounded-xl p-4 text-center">
          <Button variant="outline" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Transaction History
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Export your complete transaction history as PDF
          </p>
        </div>
      </div>
    </div>
  );
};