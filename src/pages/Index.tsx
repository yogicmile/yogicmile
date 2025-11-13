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
  const [isSyncingSteps, setIsSyncingSteps] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const checkPlatform = async () => {
      const { Capacitor } = await import('@capacitor/core');
      setIsAndroid(Capacitor.getPlatform() === 'android');
    };
    checkPlatform();
  }, []);

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

  // Re-check permissions when app resumes from background
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const setupAppResumeListener = async () => {
      const { Capacitor } = await import('@capacitor/core');
      
      if (!Capacitor.isNativePlatform()) return;
      
      const { App } = await import('@capacitor/app');
      const { permissionManager } = await import('@/services/PermissionManager');
      
      // Periodic check every 30 seconds while app is active
      const checkInterval = setInterval(async () => {
        const status = await permissionManager.checkAllPermissions(true);
        console.log('🔄 Periodic permission check:', status);
        
        // Detect if permissions changed
        if (permissionStatus && !status.allGranted && permissionStatus.allGranted) {
          console.warn('⚠️ Permissions were revoked!');
          setPermissionStatus(status);
          setShowPermissionModal(true);
        }
      }, 30000);
      
      // Re-check when app resumes
      const listener = await App.addListener('appStateChange', async (state) => {
        if (state.isActive) {
          console.log('📱 Dashboard: App resumed - re-checking permissions');
          const status = await permissionManager.checkAllPermissions(true);
          console.log('📋 Dashboard: Current permission status:', status);
          setPermissionStatus(status);
        }
      });
      
      return { listener, checkInterval };
    };
    
    const cleanup = setupAppResumeListener();
    
    return () => {
      cleanup.then(({ listener, checkInterval }) => {
        listener.remove();
        clearInterval(checkInterval);
      });
    };
  }, [permissionStatus]);

  const handleClaimReward = async (): Promise<boolean> => {
    try {
      const success = await yogicData.redeemDailyCoins();
      return success;
    } catch {
      return false;
    }
  };

  const handleManualSync = async () => {
    try {
      const { Capacitor } = await import('@capacitor/core');
      const { toast } = await import('@/hooks/use-toast');
      
      if (Capacitor.getPlatform() !== 'android') {
        toast({
          title: "iOS Sync",
          description: "Use Apple Health to sync steps",
        });
        return;
      }

      setIsSyncingSteps(true);
      toast({
        title: "Syncing...",
        description: "Fetching steps from Google Fit",
      });

      const { googleFitService } = await import('@/services/GoogleFitService');
      const syncResult = await googleFitService.syncSteps();

      if (syncResult.success) {
        setLastSyncTime(new Date());
        toast({
          title: "Sync Complete! ✅",
          description: `${syncResult.steps.toLocaleString()} steps synced`,
        });
        
        // Trigger re-render by reloading
        window.location.reload();
      } else {
        toast({
          title: "Sync Failed",
          description: syncResult.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      const { toast } = await import('@/hooks/use-toast');
      toast({
        title: "Sync Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsSyncingSteps(false);
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
            
            {/* Manual Sync Button (Android only) */}
            {isAndroid && (
              <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleManualSync}
                  disabled={isSyncingSteps}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className={`w-4 h-4 ${isSyncingSteps ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {isSyncingSteps ? 'Syncing...' : 'Sync Google Fit'}
                  </span>
                </button>
                
                <div className="flex items-center gap-3">
                  {lastSyncTime && (
                    <div className="text-xs text-muted-foreground">
                      Last: {lastSyncTime.toLocaleTimeString()}
                    </div>
                  )}
                  
                  {nativeSteps.stepData.googleFitConnected && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Connected</span>
                    </div>
                  )}
                </div>
              </div>
            )}
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