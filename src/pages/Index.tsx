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

          {/* Simple Progress Display */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Today's Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Steps:</span>
                  <span className="font-bold">{yogicData.dailyProgress.currentSteps.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Goal:</span>
                  <span>{yogicData.dailyProgress.dailyGoal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coins Earned:</span>
                  <span className="text-tier-1-paisa font-bold">{yogicData.dailyProgress.coinsEarnedToday}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Coin Rate Display - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Current Phase</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{yogicData.user.tierSymbol}</span>
                <span className="font-bold">{yogicData.user.tierName}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Steps: {yogicData.dailyProgress.currentSteps.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Simple Stats Display */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Your Journey</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-tier-1-paisa">{yogicData.user.streakDays}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-tier-2-rupaya">{(yogicData.user.totalLifetimeSteps / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-muted-foreground">Total Steps</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Cards - Simplified */}
          <div className="px-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigate('/wallet')}
                className="bg-card rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-1">💰</div>
                <div className="font-semibold">Wallet</div>
                <div className="text-xs text-muted-foreground">₹{(yogicData.wallet.mockData.totalBalance / 100).toFixed(2)}</div>
              </button>
              <button 
                onClick={() => navigate('/phase-journey')}
                className="bg-card rounded-lg p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-2xl mb-1">🏃‍♂️</div>
                <div className="font-semibold">Journey</div>
                <div className="text-xs text-muted-foreground">Track Progress</div>
              </button>
            </div>
          </div>

          {/* Enhanced CTA Button - Simplified */}
          <div className="px-4 pb-4">
            <button 
              onClick={handleClaimReward}
              className="w-full bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya text-white py-3 px-4 rounded-lg font-semibold animate-fade-in hover:shadow-lg transition-all"
            >
              Claim Daily Reward ({yogicData.dailyProgress.coinsEarnedToday || 10} coins)
            </button>
          </div>

          {/* Inspiration Quote - Simplified */}
          <div className="px-4 pb-4">
            <div className="bg-card rounded-lg p-4 text-center">
              <p className="italic text-muted-foreground">"Walk with purpose, earn with joy. 🧘‍♀️"</p>
              <p className="text-sm mt-2 font-medium">— Yogic Mile Philosophy</p>
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