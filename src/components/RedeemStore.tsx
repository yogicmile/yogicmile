import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number; // Cost in paisa
  category: 'vouchers' | 'bills' | 'cashout' | 'special';
  brand: string;
  logo?: string;
  stock: number;
  expiryDays?: number;
}

const storeItems: StoreItem[] = [
  // Vouchers & Coupons
  { id: 'amazon_100', name: '₹100 Amazon Voucher', description: 'Shopping voucher for Amazon.in', cost: 10000, category: 'vouchers', brand: 'Amazon', stock: 50 },
  { id: 'flipkart_50', name: '₹50 Flipkart Voucher', description: 'Shopping voucher for Flipkart', cost: 5000, category: 'vouchers', brand: 'Flipkart', stock: 30 },
  { id: 'myntra_75', name: '₹75 Myntra Voucher', description: 'Fashion voucher for Myntra', cost: 7500, category: 'vouchers', brand: 'Myntra', stock: 25 },
  { id: 'zomato_25', name: '₹25 Zomato Voucher', description: 'Food delivery voucher', cost: 2500, category: 'vouchers', brand: 'Zomato', stock: 100 },
  
  // Bill Payments
  { id: 'mobile_50', name: '₹50 Mobile Recharge', description: 'Recharge for any network', cost: 5000, category: 'bills', brand: 'Mobile', stock: 999 },
  { id: 'electricity_100', name: '₹100 Electricity Bill', description: 'Pay your electricity bill', cost: 10000, category: 'bills', brand: 'Electricity', stock: 999 },
  { id: 'dth_30', name: '₹30 DTH Recharge', description: 'Recharge your DTH connection', cost: 3000, category: 'bills', brand: 'DTH', stock: 999 },
  
  // Cashout Options
  { id: 'bank_transfer', name: 'Bank Transfer', description: 'Transfer to your bank account (Min ₹500)', cost: 50000, category: 'cashout', brand: 'Bank', stock: 999 },
  { id: 'upi_transfer', name: 'UPI Transfer', description: 'Transfer via UPI (Min ₹500)', cost: 50000, category: 'cashout', brand: 'UPI', stock: 999 },
  
  // Special Offers
  { id: 'special_combo', name: 'Wellness Combo Deal', description: '₹200 mixed vouchers for ₹150', cost: 15000, category: 'special', brand: 'Special', stock: 10, expiryDays: 7 },
];

interface RedeemStoreProps {
  walletBalance: number;
  onRedemption: (item: StoreItem) => void;
}

export const RedeemStore: React.FC<RedeemStoreProps> = ({ walletBalance, onRedemption }) => {
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  const MINIMUM_BALANCE = 50000; // ₹500 in paisa
  const canRedeem = walletBalance >= MINIMUM_BALANCE && !isGuest;

  const handleRedemption = async (item: StoreItem) => {
    if (!user || isGuest) {
      toast({
        title: "Sign up required",
        description: "Create an account to redeem rewards!",
        variant: "destructive",
      });
      return;
    }

    if (walletBalance < item.cost) {
      toast({
        title: "Insufficient balance",
        description: `You need ₹${((item.cost - walletBalance) / 100).toFixed(2)} more to redeem this item.`,
        variant: "destructive",
      });
      return;
    }

    if (walletBalance < MINIMUM_BALANCE) {
      toast({
        title: "Minimum balance required",
        description: "You need at least ₹500 in your wallet to make any redemption.",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    
    try {
      // Create redemption transaction
      const { error: transactionError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'redemption',
        amount: -item.cost, // Negative amount for deduction
        description: `Redeemed: ${item.name}`,
        item_name: item.name,
        status: 'completed',
        metadata: {
          item_id: item.id,
          brand: item.brand,
          category: item.category
        }
      });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const { data: currentBalance } = await supabase
        .from('wallet_balances')
        .select('total_redeemed')
        .eq('user_id', user.id)
        .single();

      const { error: balanceError } = await supabase.from('wallet_balances')
        .update({ 
          total_balance: walletBalance - item.cost,
          total_redeemed: (currentBalance?.total_redeemed || 0) + item.cost,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      toast({
        title: "✅ Redemption successful!",
        description: `${item.name} has been redeemed. Check your email for details.`,
      });

      onRedemption(item);
      setSelectedItem(null);
    } catch (error) {
      console.error('Redemption error:', error);
      toast({
        title: "Redemption failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const getStepRequirement = (cost: number, phase: number = 1) => {
    const unitsNeeded = cost; // Each unit = 1 paisa in phase 1
    const stepsNeeded = unitsNeeded * 25; // 25 steps per unit
    return stepsNeeded.toLocaleString();
  };

  const filterItemsByCategory = (category: string) => {
    return storeItems.filter(item => item.category === category);
  };

  const formatCurrency = (paisa: number) => {
    return `₹${(paisa / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🛒 Redeem Store</h2>
        <p className="text-muted-foreground">Turn your earned coins into real rewards!</p>
      </div>

      {/* Balance Check */}
      <Card className={`p-4 ${canRedeem ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'}`}>
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">
            Your Balance: {formatCurrency(walletBalance)}
          </div>
          {!canRedeem && !isGuest && (
            <div className="space-y-2">
              <Badge variant="destructive">
                Minimum ₹500 required to redeem
              </Badge>
              <p className="text-sm text-warning-foreground">
                Keep walking to unlock the store! You need {formatCurrency(MINIMUM_BALANCE - walletBalance)} more.
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

      {/* Guest Mode Warning */}
      {isGuest && (
        <Card className="p-4 bg-warning/10 border-warning/20">
          <div className="text-center">
            <p className="text-warning-foreground">
              🔒 Sign up to access the redemption store and save your earnings!
            </p>
          </div>
        </Card>
      )}

      {/* Store Categories */}
      <Tabs defaultValue="vouchers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="cashout">Cashout</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value="vouchers" className="space-y-4">
          <div className="grid gap-4">
            {filterItemsByCategory('vouchers').map((item) => (
              <StoreItemCard 
                key={item.id} 
                item={item} 
                canAfford={walletBalance >= item.cost && canRedeem}
                isGuest={isGuest}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bills" className="space-y-4">
          <div className="grid gap-4">
            {filterItemsByCategory('bills').map((item) => (
              <StoreItemCard 
                key={item.id} 
                item={item} 
                canAfford={walletBalance >= item.cost && canRedeem}
                isGuest={isGuest}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cashout" className="space-y-4">
          <div className="grid gap-4">
            {filterItemsByCategory('cashout').map((item) => (
              <StoreItemCard 
                key={item.id} 
                item={item} 
                canAfford={walletBalance >= item.cost && canRedeem}
                isGuest={isGuest}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <div className="grid gap-4">
            {filterItemsByCategory('special').map((item) => (
              <StoreItemCard 
                key={item.id} 
                item={item} 
                canAfford={walletBalance >= item.cost && canRedeem}
                isGuest={isGuest}
                onSelect={setSelectedItem}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Redemption Confirmation Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Redemption</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                <p className="text-muted-foreground">{selectedItem.description}</p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Item Cost:</span>
                  <span className="font-bold">{formatCurrency(selectedItem.cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Balance:</span>
                  <span>{formatCurrency(walletBalance)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Balance After:</span>
                  <span className="font-bold">
                    {formatCurrency(walletBalance - selectedItem.cost)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedItem(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleRedemption(selectedItem)}
                  disabled={isRedeeming || walletBalance < selectedItem.cost}
                >
                  {isRedeeming ? 'Processing...' : 'Confirm Redemption'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface StoreItemCardProps {
  item: StoreItem;
  canAfford: boolean;
  isGuest: boolean;
  onSelect: (item: StoreItem) => void;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, canAfford, isGuest, onSelect }) => {
  return (
    <Card className={`p-4 ${canAfford ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-60'} transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{item.name}</h4>
            {item.expiryDays && (
              <Badge variant="destructive" className="text-xs">
                {item.expiryDays}d left
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
          <div className="flex items-center gap-2">
            <Badge>{item.brand}</Badge>
            <span className="text-xs text-muted-foreground">
              Stock: {item.stock > 99 ? '99+' : item.stock}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold mb-2">
            ₹{(item.cost / 100).toFixed(2)}
          </div>
          <Button
            size="sm"
            disabled={!canAfford || isGuest}
            onClick={() => onSelect(item)}
            className="min-w-20"
          >
            {isGuest ? '🔒 Locked' : 
             !canAfford ? 'Need More' : 
             'Redeem'}
          </Button>
        </div>
      </div>
    </Card>
  );
};