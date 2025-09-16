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
import { DynamicAdBanner } from '@/components/DynamicAdBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PageLoading, SkeletonProgressRing } from '@/components/LoadingStates';
import { NoTransactionsEmptyState } from '@/components/EmptyState';
import { NativeStepDisplay } from '@/components/NativeStepDisplay';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useYogicMileData } from '@/hooks/use-mock-data';
import { useCoinRateSystem } from '@/hooks/use-coin-rate-system';
import { useNativeStepTracking } from '@/hooks/use-native-step-tracking';

const Index = () => {
  const navigate = useNavigate();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const yogicData = useYogicMileData();
  const coinRateSystem = useCoinRateSystem();
  const nativeSteps = useNativeStepTracking();

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
          <div className="px-4">
            <DynamicAdBanner position="top" page="home" />
          </div>

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

          {/* Native Step Tracking Display */}
          <div className="px-4 pb-4">
            <NativeStepDisplay className="animate-fade-in" />
          </div>

          {/* Interactive Progress Ring */}
          <div className="px-4 pb-4">
            <InteractiveProgressRing
              dailySteps={nativeSteps.stepData.dailySteps || yogicData.dailyProgress.currentSteps}
              lifetimeSteps={nativeSteps.stepData.lifetimeSteps || yogicData.user.totalLifetimeSteps}
              goalSteps={yogicData.dailyProgress.dailyGoal}
              currentTier={yogicData.user.currentTier}
              onGoalReached={handleGoalReached}
            />
          </div>

          {/* Dynamic Coin Rate Display */}
          <div className="px-4 pb-4">
            <DynamicCoinRateDisplay />
          </div>

          {/* Today's Summary Card */}
          <div className="px-4 pb-4">
            <TodaysSummaryCard
              currentSteps={yogicData.dailyProgress.currentSteps}
              dailyGoal={yogicData.dailyProgress.dailyGoal}
              coinsEarned={yogicData.dailyProgress.coinsEarnedToday}
              distance={yogicData.dailyProgress.distance}
              activeMinutes={yogicData.dailyProgress.activeMinutes}
              isGoalReached={yogicData.dailyProgress.currentSteps >= yogicData.dailyProgress.dailyGoal}
              hasRedeemedToday={yogicData.dailyProgress.coinsRedeemedToday > 0}
              onClaimReward={handleClaimReward}
              coinBalance={yogicData.wallet.mockData.totalBalance}
              className="animate-fade-in"
            />
          </div>

          {/* Stats Cards */}
          <div className="px-4 pb-4">
            <StatsCards
              coinsEarnedToday={yogicData.dailyProgress.coinsEarnedToday}
              coinsRedeemedToday={yogicData.dailyProgress.coinsRedeemedToday}
            />
          </div>

          {/* Milestone Celebrations */}
          <div className="px-4 pb-4">
            <MilestoneCelebrations
              event={coinRateSystem.celebrationEvent}
              onDismiss={coinRateSystem.dismissCelebration}
            />
          </div>

          {/* Motivation and Streaks Section */}
          <div className="px-4 pb-4">
            <MotivationStreaksSection
              currentStreak={yogicData.user.streakDays}
              nextStreakMilestone={7}
              streakReward={50}
              className="animate-fade-in"
            />
          </div>

          {/* Enhanced Navigation Cards */}
          <div className="px-4 pb-6">
            <EnhancedNavigationCards />
          </div>


          {/* Yogic Mile Inspiration */}
          <div className="px-4 pb-4">
            <YogicMileInspiration
              currentTier={yogicData.user.currentTier}
              currentStreak={yogicData.user.streakDays}
              className="animate-fade-in"
            />
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
            <DynamicAdBanner position="bottom" page="home" />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Index;