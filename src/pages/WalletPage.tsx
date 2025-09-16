import { useState } from 'react';
import { ArrowLeft, Wallet, RefreshCw, Filter, Search, Download, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TransactionHistory } from '@/components/TransactionHistory';
import { WalletAnalytics } from '@/components/WalletAnalytics';
import { useYogicData } from '@/hooks/use-yogic-data';
import { CountdownTimer } from '@/components/CountdownTimer';
import { AdBanner } from '@/components/AdBanner';
import { DailyRedeemModal } from '@/components/DailyRedeemModal';

export const WalletPage = () => {
  const navigate = useNavigate();
  const yogicData = useYogicData();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDailyRedeem, setShowDailyRedeem] = useState(false);

  // Mock transaction data with proper structure
  const mockTransactions = [
    { id: 'TXN001', type: 'earning' as const, amount: 285, date: new Date().toISOString(), description: 'Daily Steps: 7,125 steps', icon: '👣', status: 'completed' as const },
    { id: 'TXN002', type: 'redemption' as const, amount: -10000, date: new Date(Date.now() - 86400000).toISOString(), description: 'Amazon ₹100 Voucher', icon: '🛒', status: 'completed' as const },
    { id: 'TXN003', type: 'referral' as const, amount: 500, date: new Date(Date.now() - 172800000).toISOString(), description: 'Referral Bonus: Friend joined', icon: '👥', status: 'completed' as const },
    { id: 'TXN004', type: 'spin' as const, amount: 50, date: new Date(Date.now() - 259200000).toISOString(), description: 'Spin Wheel Bonus', icon: '🎡', status: 'completed' as const },
    { id: 'TXN005', type: 'earning' as const, amount: 320, date: new Date(Date.now() - 345600000).toISOString(), description: 'Daily Steps: 8,000 steps', icon: '👣', status: 'completed' as const },
  ];

  const walletBalance = 52341; // 52,341 paisa = ₹523.41
  const todaysPendingCoins = 285; // 285 paisa = ₹2.85
  const todaysPendingRupees = (todaysPendingCoins / 100).toFixed(2);
  const balanceInRupees = (walletBalance / 100).toFixed(2);

  const handleRefresh = () => {
    yogicData.refreshData();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
              Wallet
            </h1>
          </div>
        </div>
      </div>

      {/* Ad Slots */}
      <div className="px-4 py-2 space-y-2">
        <AdBanner type="banner" />
        <AdBanner type="native" />
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-tier-1-paisa via-tier-2-rupaya to-tier-1-paisa p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20"></div>
            <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full border border-white/10"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-1">
                {walletBalance.toLocaleString()} paisa = ₹{balanceInRupees}
              </div>
              <div className="text-white/80 text-sm">Available Balance</div>
            </div>
            
            {todaysPendingCoins > 0 && (
              <div className="bg-white/10 rounded-2xl p-4 text-center mb-4">
                <div className="text-lg font-bold text-yellow-200">
                  {todaysPendingCoins} paisa (₹{todaysPendingRupees}) - Ready to redeem
                </div>
                <div className="text-white/70 text-sm">Today's Pending Coins</div>
              </div>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Redeem Today's Coins CTA */}
        {todaysPendingCoins > 0 && (
          <Button 
            onClick={() => setShowDailyRedeem(true)}
            className="w-full py-3 text-lg font-bold bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya hover:from-tier-2-rupaya hover:to-tier-1-paisa"
          >
            Redeem Today's Coins - ₹{todaysPendingRupees}
          </Button>
        )}

        {/* Transaction History with Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 text-xs">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <TransactionHistory transactions={mockTransactions} />
          </TabsContent>
          
          <TabsContent value="earnings" className="space-y-4">
            <TransactionHistory transactions={mockTransactions.filter(t => t.type === 'earning')} />
          </TabsContent>
          
          <TabsContent value="redemptions" className="space-y-4">
            <TransactionHistory transactions={mockTransactions.filter(t => t.type === 'redemption')} />
          </TabsContent>
          
          <TabsContent value="referrals" className="space-y-4">
            <TransactionHistory transactions={mockTransactions.filter(t => t.type === 'referral')} />
          </TabsContent>
          
          <TabsContent value="week" className="space-y-4">
            <TransactionHistory transactions={mockTransactions.filter(t => {
              const transactionDate = new Date(t.date);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return transactionDate >= weekAgo;
            })} />
          </TabsContent>
          
          <TabsContent value="month" className="space-y-4">
            <TransactionHistory transactions={mockTransactions.filter(t => {
              const transactionDate = new Date(t.date);
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return transactionDate >= monthAgo;
            })} />
          </TabsContent>
        </Tabs>

        {/* Export CSV Section */}
        <div className="bg-secondary/30 rounded-xl p-4 text-center">
          <Button variant="outline" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Download your complete transaction history as CSV
          </p>
        </div>
      </div>

      {/* Daily Redeem Modal */}
      <DailyRedeemModal 
        open={showDailyRedeem}
        onOpenChange={setShowDailyRedeem}
        todaysEarnings={todaysPendingCoins}
        onConfirm={() => {
          // Handle daily redeem logic
          setShowDailyRedeem(false);
        }}
      />
    </div>
  );
};