import React, { useState, useEffect } from 'react';
import { YogicMileHeader } from '@/components/YogicMileHeader';
import { TodaysSummaryCard } from '@/components/TodaysSummaryCard';
import { InteractiveProgressRing } from '@/components/InteractiveProgressRing';
import { EnhancedNavigationCards } from '@/components/EnhancedNavigationCards';
import { BackgroundTrackingStatus } from '@/components/BackgroundTrackingStatus';
import { StepTrackingValidator } from '@/components/StepTrackingValidator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HomePageSkeleton } from '@/components/performance/SkeletonLoaders';
import { useYogicData } from '@/hooks/use-yogic-data';
import { useNativeStepTracking } from '@/hooks/use-native-step-tracking';
import { PostLoginPermissionModal } from '@/components/PostLoginPermissionModal';

const Index = () => {
  const yogicData = useYogicData();
  const nativeSteps = useNativeStepTracking();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<any>(null);

  useEffect(() => {
    document.title = 'Yogic Mile - Walk. Earn. Evolve.';
  }, []);

  useEffect(() => {
    // Check if we need to show permission modal after login
    const shouldShow = sessionStorage.getItem('show_permission_modal');
    const storedStatus = sessionStorage.getItem('permission_status');
    
    if (shouldShow === 'true' && storedStatus) {
      try {
        const status = JSON.parse(storedStatus);
        setPermissionStatus(status);
        setShowPermissionModal(true);
        
        // Clear flags so modal doesn't show again
        sessionStorage.removeItem('show_permission_modal');
        sessionStorage.removeItem('permission_status');
        
        console.log('📋 Showing post-login permission modal');
      } catch (error) {
        console.error('❌ Error parsing permission status:', error);
      }
    }
  }, []);

  const handleClaimReward = async (): Promise<boolean> => {
    try {
      const success = await yogicData.redeemDailyCoins();
      return success;
    } catch {
      return false;
    }
  };

  // Show skeleton while data loads (better UX than blank screen)
  if (yogicData.isLoading) {
    return <HomePageSkeleton />;
  }

  // Use native steps if available, otherwise use database steps
  const currentSteps = nativeSteps.stepData.dailySteps || yogicData.dailyProgress.currentSteps;
  const lifetimeSteps = nativeSteps.stepData.lifetimeSteps || yogicData.user.totalLifetimeSteps;

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
              dailySteps={currentSteps}
              lifetimeSteps={lifetimeSteps}
              goalSteps={yogicData.dailyProgress.dailyGoal}
              currentTier={yogicData.phases.currentPhase}
            />
          </div>

          {/* Background Tracking Status (Android only) */}
          <div className="px-4 pb-4">
            <BackgroundTrackingStatus />
          </div>

          {/* Step Tracking Validation Dashboard */}
          <div className="px-4 pb-4">
            <StepTrackingValidator />
          </div>

          {/* Today's Summary Card */}
          <div className="px-4 pb-4">
            <TodaysSummaryCard
              currentSteps={currentSteps}
              dailyGoal={yogicData.dailyProgress.dailyGoal}
              coinsEarned={yogicData.dailyProgress.coinsEarnedToday}
              distance={yogicData.dailyProgress.distance}
              activeMinutes={yogicData.dailyProgress.activeMinutes}
              isGoalReached={currentSteps >= yogicData.dailyProgress.dailyGoal}
              hasRedeemedToday={yogicData.dailyProgress.isRedeemed}
              onClaimReward={handleClaimReward}
              coinBalance={yogicData.wallet.totalBalance}
              className="animate-fade-in"
            />
          </div>

          {/* Enhanced Navigation Cards */}
          <div className="px-4 pb-6">
            <EnhancedNavigationCards />
          </div>
        </main>

        {/* Post-Login Permission Modal */}
        {showPermissionModal && permissionStatus && (
          <PostLoginPermissionModal
            open={showPermissionModal}
            onClose={() => setShowPermissionModal(false)}
            permissionStatus={permissionStatus}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;