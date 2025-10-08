import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, RefreshCw, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionHistory } from '@/components/TransactionHistory';
import { CountdownTimer } from '@/components/CountdownTimer';
import { DailyRedeemModal } from '@/components/DailyRedeemModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'earning' | 'redemption' | 'referral' | 'spin';
  amount: number;
  date: string;
  description: string;
  icon: string;
  status: 'completed' | 'pending' | 'failed' | 'expired';
}

export const WalletPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [showDailyRedeem, setShowDailyRedeem] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [todaysPendingCoins, setTodaysPendingCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Wallet | Yogic Mile';
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch wallet balance
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setWalletBalance(wallet?.total_balance || 0);
      
      // Calculate today's pending coins from daily_steps
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySteps } = await supabase
        .from('daily_steps')
        .select('paisa_earned, is_redeemed')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // Only show pending coins if not already redeemed
      setTodaysPendingCoins(
        todaySteps && !todaySteps.is_redeemed ? todaySteps.paisa_earned : 0
      );

      // Fetch transactions
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const formattedTransactions: Transaction[] = (txns || []).map(txn => ({
        id: txn.id,
        type: txn.type as 'earning' | 'redemption' | 'referral' | 'spin',
        amount: txn.amount,
        date: txn.created_at,
        description: txn.description || '',
        icon: getTransactionIcon(txn.type),
        status: (txn.status || 'completed') as 'completed' | 'pending' | 'failed' | 'expired'
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({ title: "Error loading wallet data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return '👣';
      case 'redemption': return '🛒';
      case 'referral': return '👥';
      case 'spin_wheel': return '🎡';
      default: return '💰';
    }
  };

  const todaysPendingRupees = (todaysPendingCoins / 100).toFixed(2);
  const balanceInRupees = (walletBalance / 100).toFixed(2);

  const handleRefresh = () => {
    loadWalletData();
  };

  const handleDailyRedeem = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      // Mark today's earnings as redeemed in daily_steps
      const { error: stepError } = await supabase
        .from('daily_steps')
        .update({ 
          is_redeemed: true, 
          redeemed_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('date', today)
        .eq('is_redeemed', false);

      if (stepError) throw stepError;

      // Add transaction record
      const { error: txnError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'earning',
        amount: todaysPendingCoins,
        description: `Daily earnings redeemed - ${new Date().toLocaleDateString()}`,
        status: 'completed'
      });

      if (txnError) throw txnError;

      // Update wallet balance
      const newBalance = walletBalance + todaysPendingCoins;
      const newTotalEarned = (await supabase
        .from('wallet_balances')
        .select('total_earned')
        .eq('user_id', user.id)
        .single()).data?.total_earned || 0;

      const { error: walletError } = await supabase
        .from('wallet_balances')
        .update({
          total_balance: newBalance,
          total_earned: newTotalEarned + todaysPendingCoins,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      toast({ 
        title: "Coins redeemed successfully!",
        description: `₹${(todaysPendingCoins / 100).toFixed(2)} added to wallet`
      });
      
      setShowDailyRedeem(false);
      loadWalletData();
    } catch (error) {
      console.error('Error redeeming coins:', error);
      toast({ 
        title: "Error redeeming coins", 
        description: "Please try again later",
        variant: "destructive" 
      });
    }
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


      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tier-1-paisa mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading wallet...</p>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-tier-1-paisa via-tier-2-rupaya to-tier-1-paisa p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20"></div>
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full border border-white/10"></div>
              </div>
              
              <div className="relative z-10">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-1">
                    ₹{balanceInRupees}
                  </div>
                  <div className="text-white/80 text-sm">Available Balance</div>
                  <div className="text-white/60 text-xs mt-1">
                    {walletBalance.toLocaleString()} paisa
                  </div>
                </div>
                
                {todaysPendingCoins > 0 && (
                  <div className="bg-white/10 rounded-2xl p-4 text-center">
                    <div className="text-lg font-bold text-yellow-200">
                      ₹{todaysPendingRupees}
                    </div>
                    <div className="text-white/70 text-sm">Today's Earnings - Ready to Redeem</div>
                    <div className="text-white/50 text-xs mt-1">
                      {todaysPendingCoins} paisa
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {!loading && (
          <>
            {/* Countdown Timer */}
            <CountdownTimer />

            {/* Redeem Today's Coins CTA */}
            {todaysPendingCoins > 0 && (
              <Button 
                onClick={() => setShowDailyRedeem(true)}
                className="w-full py-3 text-lg font-bold bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya hover:from-tier-2-rupaya hover:to-tier-1-paisa"
              >
                Redeem Today's Earnings - ₹{todaysPendingRupees}
              </Button>
            )}
          </>
        )}

        {!loading && (
          <>
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
                <TransactionHistory transactions={transactions} />
              </TabsContent>
              
              <TabsContent value="earnings" className="space-y-4">
                <TransactionHistory transactions={transactions.filter(t => t.type === 'earning')} />
              </TabsContent>
              
              <TabsContent value="redemptions" className="space-y-4">
                <TransactionHistory transactions={transactions.filter(t => t.type === 'redemption')} />
              </TabsContent>
              
              <TabsContent value="referrals" className="space-y-4">
                <TransactionHistory transactions={transactions.filter(t => t.type === 'referral')} />
              </TabsContent>
              
              <TabsContent value="week" className="space-y-4">
                <TransactionHistory transactions={transactions.filter(t => {
                  const transactionDate = new Date(t.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return transactionDate >= weekAgo;
                })} />
              </TabsContent>
              
              <TabsContent value="month" className="space-y-4">
                <TransactionHistory transactions={transactions.filter(t => {
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
                Export Transaction History
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Download your complete transaction history as CSV
              </p>
            </div>
          </>
        )}

      </div>

      {/* Daily Redeem Modal */}
      <DailyRedeemModal 
        open={showDailyRedeem}
        onOpenChange={setShowDailyRedeem}
        todaysEarnings={todaysPendingCoins}
        onConfirm={handleDailyRedeem}
      />
    </div>
  );
};