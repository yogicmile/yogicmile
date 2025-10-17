import React, { useState, useEffect } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LocalDeals } from '@/components/LocalDeals';
import { SpinWheel } from '@/components/SpinWheel';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const RewardsPage = () => {
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [dailySteps, setDailySteps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'Rewards | Yogic Mile';
    loadRewardsData();
  }, [user]);

  const loadRewardsData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch wallet balance
      const { data: walletData } = await supabase
        .from('wallet_balances')
        .select('total_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletData) {
        setWalletBalance(walletData.total_balance || 0);
      }

      // Fetch today's steps
      const today = new Date().toISOString().split('T')[0];
      const { data: stepsData } = await supabase
        .from('daily_steps')
        .select('steps')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (stepsData) {
        setDailySteps(stepsData.steps || 0);
      }
    } catch (error) {
      console.error('Error loading rewards data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to load rewards data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const balanceInRupees = (walletBalance / 100).toFixed(2);
  const MINIMUM_BALANCE = 50000; // ₹500 in paisa
  const canRedeem = walletBalance >= MINIMUM_BALANCE;

  // Comprehensive rewards data
  const rewards = {
    vouchers: [
      { id: 'amazon_100', name: 'Amazon ₹100 Voucher', cost: 10000, brand: 'Amazon', logo: '🛒', availability: 'In Stock' },
      { id: 'flipkart_50', name: 'Flipkart ₹50 Voucher', cost: 5000, brand: 'Flipkart', logo: '🛍️', availability: 'In Stock' },
      { id: 'zomato_25', name: 'Zomato ₹25 Voucher', cost: 2500, brand: 'Zomato', logo: '🍔', availability: 'In Stock' },
      { id: 'myntra_75', name: 'Myntra ₹75 Voucher', cost: 7500, brand: 'Myntra', logo: '👕', availability: 'In Stock' },
    ],
    bills: [
      { id: 'mobile_50', name: 'Mobile Recharge ₹50', cost: 5000, brand: 'All Networks', logo: '📱', availability: 'Available' },
      { id: 'electricity_100', name: 'Electricity Bill ₹100', cost: 10000, brand: 'All Providers', logo: '⚡', availability: 'Available' },
      { id: 'dth_30', name: 'DTH Recharge ₹30', cost: 3000, brand: 'All DTH', logo: '📺', availability: 'Available' },
    ],
    cashout: [
      { id: 'bank_transfer', name: 'Bank Transfer', cost: 50000, brand: 'Direct to Bank', logo: '🏦', availability: 'Available', minAmount: '₹500' },
      { id: 'upi_transfer', name: 'UPI Transfer', cost: 50000, brand: 'UPI Payment', logo: '📲', availability: 'Available', minAmount: '₹500' },
    ],
    special: [
      { id: 'combo_deal', name: 'Wellness Combo', cost: 15000, brand: 'Special Offer', logo: '🎁', availability: '10 Left', originalPrice: '₹200', discountPrice: '₹150' },
    ]
  };

  const canSpin = dailySteps >= 10000; // Requirement: 10,000+ steps

  const handleRedemption = (reward: any) => {
    if (!canRedeem) {
      toast({
        title: "Minimum ₹500 required to redeem",
        description: "Keep walking to unlock rewards!",
        variant: "destructive",
      });
      return;
    }

    if (walletBalance < reward.cost) {
      const needed = ((reward.cost - walletBalance) / 100).toFixed(2);
      toast({
        title: `Need ₹${needed} more`,
        description: "Keep walking to earn more coins!",
        variant: "destructive",
      });
      return;
    }

    setSelectedReward(reward);
  };

  const confirmRedemption = () => {
    if (!selectedReward) return;
    
    // Mock redemption success
    const transactionId = `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    toast({
      title: "✅ Redemption Successful!",
      description: `You redeemed ${selectedReward.name}. Check email for details. Transaction ID: ${transactionId}`,
    });
    
    setSelectedReward(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-4 py-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-tier-1-paisa" />
            <h1 className="text-2xl font-bold text-foreground">Rewards</h1>
          </div>
        </div>


        {/* Balance Display */}
        <Card className={`p-4 ${canRedeem ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}`}>
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              You can spend: ₹{balanceInRupees}
            </div>
            {!canRedeem && (
              <div className="space-y-2">
                <Badge variant="destructive">
                  Minimum ₹500 required to redeem
                </Badge>
                <p className="text-sm text-warning-foreground">
                  Keep walking to unlock rewards! You need ₹{((MINIMUM_BALANCE - walletBalance) / 100).toFixed(2)} more.
                </p>
              </div>
            )}
            {canRedeem && (
              <Badge className="bg-success text-success-foreground">
                ✅ Ready to redeem!
              </Badge>
            )}
          </div>
        </Card>

        {/* Spin Wheel Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎡</span>
            <h2 className="text-lg font-semibold">Spin & Win</h2>
          </div>
          <SpinWheel 
            dailySteps={dailySteps}
            canSpin={canSpin}
            onSpinComplete={(reward) => {
              toast({
                title: "Spin complete!",
                description: `You won: ${reward.description}`,
              });
              loadRewardsData(); // Reload balance after spin
            }}
          />
        </div>

        {/* Local Deals & Coupons Section */}
        <LocalDeals />

        {/* Category Tabs */}
        <Tabs defaultValue="vouchers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
            <TabsTrigger value="bills">Bill Payments</TabsTrigger>
            <TabsTrigger value="cashout">Cashout</TabsTrigger>
            <TabsTrigger value="special">Special Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="vouchers" className="space-y-4">
            {rewards.vouchers.map((reward) => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                canAfford={walletBalance >= reward.cost && canRedeem}
                onRedeem={() => handleRedemption(reward)}
              />
            ))}
          </TabsContent>

          <TabsContent value="bills" className="space-y-4">
            {rewards.bills.map((reward) => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                canAfford={walletBalance >= reward.cost && canRedeem}
                onRedeem={() => handleRedemption(reward)}
              />
            ))}
          </TabsContent>

          <TabsContent value="cashout" className="space-y-4">
            {rewards.cashout.map((reward) => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                canAfford={walletBalance >= reward.cost && canRedeem}
                onRedeem={() => handleRedemption(reward)}
              />
            ))}
          </TabsContent>

          <TabsContent value="special" className="space-y-4">
            {rewards.special.map((reward) => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                canAfford={walletBalance >= reward.cost && canRedeem}
                onRedeem={() => handleRedemption(reward)}
                isSpecial={true}
              />
            ))}
          </TabsContent>
        </Tabs>
        
      </div>

      {/* Redemption Confirmation Modal */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">{selectedReward.logo}</div>
                <h3 className="text-xl font-bold">{selectedReward.name}</h3>
                <p className="text-muted-foreground">{selectedReward.brand}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Item Cost:</span>
                  <span className="font-bold">₹{(selectedReward.cost / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span>₹{balanceInRupees}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>New Balance:</span>
                  <span className="font-bold">
                    ₹{((walletBalance - selectedReward.cost) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedReward(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={confirmRedemption}
                >
                  Confirm Redeem
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Reward Card Component
interface RewardCardProps {
  reward: any;
  canAfford: boolean;
  onRedeem: () => void;
  isSpecial?: boolean;
}

const RewardCard = ({ reward, canAfford, onRedeem, isSpecial = false }: RewardCardProps) => {
  const getButtonState = () => {
    if (canAfford) return { variant: 'default' as const, text: 'Redeem Now', color: 'bg-success text-success-foreground' };
    if (!canAfford && reward.cost > 50000) return { variant: 'secondary' as const, text: 'Minimum ₹500 required to redeem', color: 'bg-destructive/10 text-destructive' };
    return { variant: 'secondary' as const, text: `Need ₹${((reward.cost - 52341) / 100).toFixed(2)} more`, color: 'bg-warning/10 text-warning' };
  };

  const buttonState = getButtonState();

  return (
    <Card className={`${canAfford ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-60'} transition-all ${isSpecial ? 'border-2 border-tier-1-paisa/50 bg-gradient-to-r from-tier-1-paisa/5 to-tier-2-rupaya/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{reward.logo}</div>
            <div>
              <h4 className="font-semibold">{reward.name}</h4>
              <p className="text-sm text-muted-foreground">{reward.brand}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">
                  {reward.cost.toLocaleString()} paisa + ₹{(reward.cost / 100).toFixed(2)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {reward.availability}
                </Badge>
              </div>
              {isSpecial && reward.originalPrice && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs line-through text-muted-foreground">{reward.originalPrice}</span>
                  <span className="text-xs font-bold text-success">{reward.discountPrice}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <Button
              size="sm"
              variant={buttonState.variant}
              disabled={!canAfford}
              onClick={onRedeem}
              className={`min-w-24 ${buttonState.color}`}
            >
              {canAfford ? 'Redeem Now' : 
               reward.cost <= 52341 ? buttonState.text :
               buttonState.text}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};