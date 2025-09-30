import React, { useState, useEffect } from 'react';
import { YogicMileHeader } from '@/components/YogicMileHeader';
import { TodaysSummaryCard } from '@/components/TodaysSummaryCard';
import { InteractiveProgressRing } from '@/components/InteractiveProgressRing';
import { EnhancedNavigationCards } from '@/components/EnhancedNavigationCards';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoading } from '@/components/LoadingStates';
import { useFitnessData } from '@/hooks/use-fitness-data';
import { useNativeStepTracking } from '@/hooks/use-native-step-tracking';

const Index = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const fitnessData = useFitnessData();
  const nativeSteps = useNativeStepTracking();

  useEffect(() => {
    document.title = 'Yogic Mile - Walk. Earn. Evolve.';
    const timer = setTimeout(() => setIsInitialLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClaimReward = async (): Promise<boolean> => {
    try {
      await fitnessData.redeemDailyCoins(10);
      return true;
    } catch {
      return false;
    }
  };

  // Show loading screen during initial load
  if (isInitialLoading) {
    return <PageLoading />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <main className="animate-fade-in pb-20">
          {/* Yogic Mile Branding Header */}
          <YogicMileHeader 
            className="animate-fade-in" 
            size="medium"
          />

          {/* Interactive Progress Ring */}
          <div className="px-4 pb-4">
            <InteractiveProgressRing
              dailySteps={nativeSteps.stepData.dailySteps || fitnessData.dailyProgress.currentSteps}
              lifetimeSteps={nativeSteps.stepData.lifetimeSteps || fitnessData.user.totalLifetimeSteps}
              goalSteps={fitnessData.dailyProgress.dailyGoal}
              currentTier={fitnessData.user.currentTier}
            />
          </div>

          {/* Today's Summary Card */}
          <div className="px-4 pb-4">
            <TodaysSummaryCard
              currentSteps={fitnessData.dailyProgress.currentSteps}
              dailyGoal={fitnessData.dailyProgress.dailyGoal}
              coinsEarned={fitnessData.dailyProgress.coinsEarnedToday}
              distance={fitnessData.dailyProgress.distance}
              activeMinutes={fitnessData.dailyProgress.activeMinutes}
              isGoalReached={fitnessData.dailyProgress.currentSteps >= fitnessData.dailyProgress.dailyGoal}
              hasRedeemedToday={fitnessData.dailyProgress.coinsRedeemedToday > 0}
              onClaimReward={handleClaimReward}
              coinBalance={fitnessData.wallet.mockData.totalBalance}
              className="animate-fade-in"
            />
          </div>

          {/* Enhanced Navigation Cards */}
          <div className="px-4 pb-6">
            <EnhancedNavigationCards />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default Index;