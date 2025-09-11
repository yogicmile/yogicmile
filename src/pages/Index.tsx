import React, { useState, useEffect } from 'react';
import { YogicMileHeader } from '@/components/YogicMileHeader';
import { EnhancedPhaseProgress } from '@/components/EnhancedPhaseProgress';
import { DynamicCoinRateDisplay } from '@/components/DynamicCoinRateDisplay';
import { MilestoneCelebrations } from '@/components/MilestoneCelebrations';
import { MotivationStreaksSection } from '@/components/MotivationStreaksSection';
import { TodaysSummaryCard } from '@/components/TodaysSummaryCard';
import { YogicMileInspiration } from '@/components/YogicMileInspiration';
import { InteractiveProgressRing } from '@/components/InteractiveProgressRing';
import { StatsCards } from '@/components/StatsCards';
import { EnhancedNavigationCards } from '@/components/EnhancedNavigationCards';
import { CountdownTimer } from '@/components/CountdownTimer';
import { EnhancedCTAButton } from '@/components/EnhancedCTAButton';
import { AdBanner } from '@/components/AdBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PageLoading, SkeletonProgressRing } from '@/components/LoadingStates';
import { NoTransactionsEmptyState } from '@/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useYogicMileData } from '@/hooks/use-mock-data';
import { useCoinRateSystem } from '@/hooks/use-coin-rate-system';

const Index = () => {
  const navigate = useNavigate();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const yogicData = useYogicMileData();
  const coinRateSystem = useCoinRateSystem();

  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClaimReward = async (): Promise<boolean> => {
    try {
      await yogicData.redeemDailyCoins(10);
      return true;
    } catch {
      return false;
    }
  };

  const handleGoalReached = () => {
    // Announce to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.textContent = 'Congratulations! Daily goal achieved!';
    announcement.className = 'sr-only';
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  // Show loading screen during initial load
  if (isInitialLoading) {
    return <PageLoading />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        {/* Offline Indicator */}
        <OfflineIndicator />

        <main className="animate-fade-in">
          {/* Yogic Mile Branding Header */}
          <YogicMileHeader 
            className="animate-fade-in" 
            size="medium"
          />

          {/* Top Ad Slot - Wellness themed */}
          <AdBanner type="header" />

          {/* Enhanced Phase Progress Section */}
          <div className="px-4 py-4">
            <EnhancedPhaseProgress
              currentTier={yogicData.user.currentTier}
              tierName={yogicData.user.tierName}
              tierSymbol={yogicData.user.tierSymbol}
              currentSteps={yogicData.tierProgress.currentTierSteps}
              tierTarget={yogicData.tierProgress.tierTarget}
              daysRemaining={yogicData.tierProgress.daysRemaining}
              className="animate-scale-in"
            />
          </div>

          {/* Interactive Progress Ring - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-6 animate-scale-in">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Today's Progress</h3>
                <div className="relative w-32 h-32 mx-auto">
                  <div className="w-full h-full rounded-full border-8 border-muted relative overflow-hidden">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-tier-1-paisa border-r-transparent border-b-transparent transform rotate-45"
                      style={{
                        transform: `rotate(${(yogicData.dailyProgress.currentSteps / yogicData.dailyProgress.dailyGoal) * 360}deg)`
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold">{yogicData.dailyProgress.currentSteps.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">steps</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{yogicData.dailyProgress.calories}</div>
                    <div className="text-muted-foreground">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{yogicData.dailyProgress.distance.toFixed(1)}km</div>
                    <div className="text-muted-foreground">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{yogicData.dailyProgress.activeMinutes}</div>
                    <div className="text-muted-foreground">Minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Coin Rate Display - Simplified */}
          <div className="mx-4 mb-4">
            <div className="bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya rounded-lg p-4 text-white">
              <h3 className="font-semibold mb-2">Current Phase: {yogicData.user.tierSymbol} {yogicData.user.tierName}</h3>
              <div className="text-sm opacity-90">
                Steps: {yogicData.dailyProgress.currentSteps.toLocaleString()} | 
                Coins Today: {yogicData.dailyProgress.coinsEarnedToday}
              </div>
            </div>
          </div>

          {/* Today's Summary Card - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Steps:</span>
                    <span className="font-semibold">{yogicData.dailyProgress.currentSteps.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coins:</span>
                    <span className="font-semibold text-tier-1-paisa">{yogicData.dailyProgress.coinsEarnedToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Streak:</span>
                    <span className="font-semibold">{yogicData.user.streakDays} days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calories:</span>
                    <span className="font-semibold">{yogicData.dailyProgress.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-semibold">{yogicData.dailyProgress.distance.toFixed(1)}km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active:</span>
                    <span className="font-semibold">{yogicData.dailyProgress.activeMinutes}m</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/calculation-review')}
                className="w-full mt-3 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                View Calculation Details
              </button>
            </div>
          </div>

          {/* Stats Cards - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-tier-2-rupaya">{(yogicData.user.totalLifetimeSteps / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-muted-foreground">Total Steps</div>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-tier-3-token">{yogicData.user.currentTier}</div>
                  <div className="text-sm text-muted-foreground">Current Tier</div>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-tier-1-paisa">{yogicData.user.dailyGoal.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Daily Goal</div>
                </div>
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-tier-4-crystal">{Math.round((yogicData.dailyProgress.currentSteps / yogicData.user.dailyGoal) * 100)}%</div>
                  <div className="text-sm text-muted-foreground">Goal Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Celebrations - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4 animate-fade-in">
              <h3 className="text-lg font-semibold mb-3">🏆 Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-tier-1-paisa/10 rounded-lg">
                  <div className="text-2xl">🎯</div>
                  <div>
                    <div className="font-semibold">Daily Walker</div>
                    <div className="text-sm text-muted-foreground">{yogicData.dailyProgress.currentSteps.toLocaleString()} steps today</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-tier-2-rupaya/10 rounded-lg">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <div className="font-semibold">Streak Master</div>
                    <div className="text-sm text-muted-foreground">{yogicData.user.streakDays} days in a row</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-tier-3-token/10 rounded-lg">
                  <div className="text-2xl">{yogicData.user.tierSymbol}</div>
                  <div>
                    <div className="font-semibold">Current Phase</div>
                    <div className="text-sm text-muted-foreground">{yogicData.user.tierName}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motivation Section - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-r from-tier-3-token to-tier-4-crystal rounded-lg p-4 text-white animate-fade-in">
              <h3 className="font-semibold mb-2">🧘‍♀️ Stay Motivated</h3>
              <div className="space-y-2 text-sm">
                <div>Current Streak: <span className="font-bold">{yogicData.user.streakDays} days</span></div>
                <div>Phase: <span className="font-bold">{yogicData.user.tierSymbol} {yogicData.user.tierName}</span></div>
                <div>Days Remaining: <span className="font-bold">{yogicData.tierProgress.daysRemaining} days</span></div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Cards - Simplified */}
          <div className="px-4 pb-6">
            <div className="grid grid-cols-2 gap-4 animate-fade-in">
              <button 
                onClick={() => navigate('/wallet')}
                className="bg-card rounded-lg p-4 text-center hover:shadow-lg transition-all relative"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold">Wallet</div>
                <div className="text-sm text-tier-1-paisa font-medium">₹{(yogicData.wallet.mockData.totalBalance / 100).toFixed(2)}</div>
                {yogicData.wallet.mockData.pendingRedemptions > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {yogicData.wallet.mockData.pendingRedemptions}
                  </div>
                )}
              </button>
              <button 
                onClick={() => navigate('/coins-history')}
                className="bg-card rounded-lg p-4 text-center hover:shadow-lg transition-all"
              >
                <div className="text-2xl mb-2">📈</div>
                <div className="font-semibold">History</div>
                <div className="text-sm text-muted-foreground">View Progress</div>
              </button>
              <button 
                onClick={() => navigate('/phase-journey')}
                className="bg-card rounded-lg p-4 text-center hover:shadow-lg transition-all relative"
              >
                <div className="text-2xl mb-2">🚀</div>
                <div className="font-semibold">Journey</div>
                <div className="text-sm text-muted-foreground">Phase Progress</div>
                {yogicData.tierProgress.daysRemaining <= 7 && (
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-orange-500 rounded-full"></div>
                )}
              </button>
              <button 
                onClick={() => navigate('/calculation-review')}
                className="bg-card rounded-lg p-4 text-center hover:shadow-lg transition-all"
              >
                <div className="text-2xl mb-2">🧮</div>
                <div className="font-semibold">Calculator</div>
                <div className="text-sm text-muted-foreground">Review Logic</div>
              </button>
            </div>
          </div>

          {/* Enhanced CTA Button - Simplified */}
          <div className="px-4 pb-4">
            <button 
              onClick={handleClaimReward}
              className="w-full bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya text-white py-4 px-6 rounded-lg font-semibold text-lg animate-fade-in hover:shadow-lg transition-all transform hover:scale-105"
            >
              🎁 Claim Daily Reward ({yogicData.dailyProgress.coinsEarnedToday || 10} coins)
            </button>
          </div>

          {/* Yogic Mile Inspiration - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-gradient-to-r from-sage-green to-soft-lavender rounded-lg p-4 text-white text-center animate-fade-in">
              <p className="italic mb-2">"Walk with purpose, earn with joy. 🧘‍♀️"</p>
              <p className="text-sm opacity-90">— Yogic Mile Philosophy</p>
            </div>
          </div>

          {/* Countdown Timer - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4 text-center animate-fade-in">
              <h3 className="font-semibold mb-2">⏰ Next Tier Bonus</h3>
              <p className="text-sm text-muted-foreground mb-2">Enhanced rewards unlock soon!</p>
              <div className="text-2xl font-bold text-tier-1-paisa">23:45:12</div>
              <p className="text-xs text-muted-foreground">Hours : Minutes : Seconds</p>
            </div>
          </div>

          {/* Bottom Ad Slot */}
          <div className="px-4 pb-6">
            <AdBanner type="footer" />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Index;