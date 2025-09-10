import { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { useNumberAnimation } from '@/hooks/use-animations';

interface BalanceCardProps {
  balance: number;
  coinBalance: number;
  todaysEarnings: number;
  weeklyEarnings: number;
  lifetimeEarnings: number;
  lastUpdated: string;
}

export const BalanceCard = ({
  balance,
  coinBalance,
  todaysEarnings,
  weeklyEarnings,
  lifetimeEarnings,
  lastUpdated
}: BalanceCardProps) => {
  const [coinAnimation, setCoinAnimation] = useState(false);
  const { current: animatedBalance } = useNumberAnimation(balance, 2000);

  // Coin stack animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCoinAnimation(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-tier-1-paisa via-tier-2-rupaya to-tier-1-paisa p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/20"></div>
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full border border-white/10"></div>
        </div>
        
        <div className="relative z-10">
          {/* Animated Coin Stack */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`transition-transform duration-500 ${coinAnimation ? 'scale-110 rotate-12' : 'scale-100'}`}>
                  <div className="relative">
                    <div className="text-3xl">💰</div>
                    {/* Floating coins animation */}
                    <div className="absolute -top-1 -right-1 text-sm animate-bounce" style={{ animationDelay: '0.5s' }}>
                      🪙
                    </div>
                  </div>
                </div>
                <div className="text-white/80 text-sm font-medium">Available Balance</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/60 text-xs">
              <Clock className="w-3 h-3" />
              <span>Updated {lastUpdated}</span>
            </div>
          </div>

          {/* Primary Balance */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold mb-2">
              ₹{animatedBalance.toLocaleString()}
            </div>
            <div className="text-white/80 text-sm">
              ({coinBalance.toLocaleString()} coins available)
            </div>
          </div>

          {/* Balance Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">₹{todaysEarnings}</div>
              <div className="text-white/70 text-xs">Today</div>
            </div>
            <div className="text-center border-l border-r border-white/20">
              <div className="text-xl font-bold">₹{weeklyEarnings}</div>
              <div className="text-white/70 text-xs">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">₹{lifetimeEarnings}</div>
              <div className="text-white/70 text-xs">Lifetime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Below */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-success/10 border border-success/20 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-success font-semibold">+₹{todaysEarnings}</span>
          </div>
          <div className="text-xs text-muted-foreground">Today's Progress</div>
        </div>
        
        <div className="bg-tier-3-token/10 border border-tier-3-token/20 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-tier-3-token font-semibold">Level 3</span>
            <span className="text-lg">🏆</span>
          </div>
          <div className="text-xs text-muted-foreground">Wallet Tier</div>
        </div>
      </div>
    </div>
  );
};