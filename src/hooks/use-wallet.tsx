import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { guestDataManager } from '@/services/GuestDataManager';

export interface WalletData {
  totalBalance: number; // in paisa
  totalEarned: number;
  totalRedeemed: number;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  type: 'earning' | 'redemption' | 'referral' | 'spin_wheel' | 'challenge_reward' | 'bonus';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'expired';
  created_at: string;
}

export const useWallet = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [walletData, setWalletData] = useState<WalletData>({
    totalBalance: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wallet data
  const loadWalletData = useCallback(async () => {
    if (isGuest || !user) {
      // For guests, load from localStorage
      const guestWallet = guestDataManager.getWallet();
      setWalletData({
        totalBalance: guestWallet.balance,
        totalEarned: guestWallet.totalEarned,
        totalRedeemed: 0,
        lastUpdated: guestWallet.lastUpdated,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (walletError) {
        console.error('Error fetching wallet:', walletError);
        throw walletError;
      }

      // If wallet doesn't exist, create one
      if (!wallet) {
        const { data: newWallet, error: createError } = await supabase
          .from('wallet_balances')
          .insert({
            user_id: user.id,
            total_balance: 0,
            total_earned: 0,
            total_redeemed: 0,
          })
          .select()
          .maybeSingle();

        if (createError) {
          console.error('Error creating wallet:', createError);
          throw createError;
        }
        
        setWalletData({
          totalBalance: 0,
          totalEarned: 0,
          totalRedeemed: 0,
          lastUpdated: newWallet?.last_updated || new Date().toISOString(),
        });
      } else {
        setWalletData({
          totalBalance: wallet.total_balance || 0,
          totalEarned: wallet.total_earned || 0,
          totalRedeemed: wallet.total_redeemed || 0,
          lastUpdated: wallet.last_updated,
        });
      }

      // Fetch transactions
      const { data: txns, error: txnError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (txnError) throw txnError;

      setTransactions((txns || []) as WalletTransaction[]);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, isGuest, toast]);

  // Get today's pending coins
  const getTodaysPendingCoins = useCallback(async () => {
    if (isGuest || !user) return 0;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_steps')
        .select('paisa_earned, is_redeemed')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error getting pending coins:', error);
        return 0;
      }

      return data && !data.is_redeemed ? data.paisa_earned : 0;
    } catch (error) {
      console.error('Error getting pending coins:', error);
      return 0;
    }
  }, [user, isGuest]);

  // Redeem daily coins
  const redeemDailyCoins = useCallback(async (pendingCoins: number) => {
    if (isGuest || !user || pendingCoins <= 0) return false;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Mark as redeemed
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

      // Add transaction
      const { error: txnError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'earning',
        amount: pendingCoins,
        description: `Daily earnings - ${new Date().toLocaleDateString()}`,
        status: 'completed'
      });

      if (txnError) throw txnError;

      // Update wallet
      const newBalance = walletData.totalBalance + pendingCoins;
      const { error: walletError } = await supabase
        .from('wallet_balances')
        .update({
          total_balance: newBalance,
          total_earned: walletData.totalEarned + pendingCoins,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Update local state
      setWalletData(prev => ({
        ...prev,
        totalBalance: newBalance,
        totalEarned: prev.totalEarned + pendingCoins,
      }));

      toast({
        title: "Coins Redeemed!",
        description: `₹${(pendingCoins / 100).toFixed(2)} added to wallet`,
      });

      await loadWalletData();
      return true;
    } catch (error) {
      console.error('Error redeeming coins:', error);
      toast({
        title: "Redemption Failed",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
    }
  }, [user, isGuest, walletData, toast, loadWalletData]);

  // Redeem item (voucher/coupon)
  const redeemItem = useCallback(async (item: { id: string; cost: number; name: string }) => {
    if (isGuest || !user) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to redeem items",
        variant: "destructive",
      });
      return false;
    }

    if (walletData.totalBalance < item.cost) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₹${((item.cost - walletData.totalBalance) / 100).toFixed(2)} more`,
        variant: "destructive",
      });
      return false;
    }

    try {
      // Add redemption transaction
      const { error: txnError } = await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'redemption',
        amount: -item.cost,
        description: `Redeemed ${item.name}`,
        status: 'completed'
      });

      if (txnError) throw txnError;

      // Update wallet
      const newBalance = walletData.totalBalance - item.cost;
      const { error: walletError } = await supabase
        .from('wallet_balances')
        .update({
          total_balance: newBalance,
          total_redeemed: walletData.totalRedeemed + item.cost,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Update local state
      setWalletData(prev => ({
        ...prev,
        totalBalance: newBalance,
        totalRedeemed: prev.totalRedeemed + item.cost,
      }));

      toast({
        title: "Redemption Successful!",
        description: `${item.name} has been redeemed`,
      });

      await loadWalletData();
      return true;
    } catch (error) {
      console.error('Error redeeming item:', error);
      toast({
        title: "Redemption Failed",
        description: "Please try again",
        variant: "destructive",
      });
      return false;
    }
  }, [user, isGuest, walletData, toast, loadWalletData]);

  // Initialize on mount
  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (isGuest || !user) return;

    // Subscribe to wallet changes
    const walletChannel = supabase
      .channel('wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_balances',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadWalletData();
        }
      )
      .subscribe();

    // Subscribe to transaction changes
    const txnChannel = supabase
      .channel('transaction-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadWalletData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(txnChannel);
    };
  }, [user, isGuest, loadWalletData]);

  return {
    walletData,
    transactions,
    loading,
    loadWalletData,
    getTodaysPendingCoins,
    redeemDailyCoins,
    redeemItem,
  };
};
