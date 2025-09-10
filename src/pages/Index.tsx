import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { InteractiveProgressRing } from '@/components/InteractiveProgressRing';
import { StatsCards } from '@/components/StatsCards';
import { EnhancedNavigationCards } from '@/components/EnhancedNavigationCards';
import { EnhancedBottomNavigation } from '@/components/EnhancedBottomNavigation';
import { CountdownTimer } from '@/components/CountdownTimer';
import { EnhancedCTAButton } from '@/components/EnhancedCTAButton';
import { AdBanner } from '@/components/AdBanner';
import { Gift } from 'lucide-react';
import { useStepTracking } from '@/hooks/use-step-tracking';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'rewards' | 'profile'>('dashboard');
  const stepTracking = useStepTracking();

  const handleClaimReward = async (): Promise<boolean> => {
    try {
      // Simulate API call
      stepTracking.claimReward();
      return true;
    } catch {
      return false;
    }
  };

  const handleGoalReached = () => {
    console.log('Daily goal reached! 🎉');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="p-6 animate-fade-in" role="tabpanel" id="wallet-panel">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4 font-display">Wallet Balance</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">🪙</div>
                  <div className="text-3xl font-bold text-tier-1-paisa mb-2">
                    {stepTracking.coinsEarnedToday}
                  </div>
                  <p className="text-muted-foreground">Available Coins</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-tier-1-paisa-light rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-tier-1-paisa">
                      {stepTracking.coinsEarnedToday}
                    </div>
                    <div className="text-xs text-muted-foreground">Earned Today</div>
                  </div>
                  <div className="bg-tier-2-coin-light rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-tier-2-coin">
                      {stepTracking.coinsRedeemedToday}
                    </div>
                    <div className="text-xs text-muted-foreground">Used Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'rewards':
        return (
          <div className="p-6 animate-fade-in" role="tabpanel" id="rewards-panel">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4 font-display">Vouchers & Coupons Store</h2>
              <div className="text-center">
                <Gift className="w-16 h-16 mx-auto text-tier-3-token mb-4" />
                <p className="text-muted-foreground mb-6">
                  Browse amazing vouchers and redeem coins for rewards!
                </p>
                
                <div className="grid gap-3">
                  <div className="p-4 border rounded-xl hover:bg-tier-3-token-light/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-left">Amazon Gift Card</h3>
                        <p className="text-sm text-muted-foreground text-left">$10 Amazon voucher</p>
                      </div>
                      <div className="text-tier-3-token font-bold">500 coins</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-xl hover:bg-tier-4-gem-light/50 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-left">Sports Store Coupon</h3>
                        <p className="text-sm text-muted-foreground text-left">20% off fitness gear</p>
                      </div>
                      <div className="text-tier-4-gem font-bold">300 coins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6 animate-fade-in" role="tabpanel" id="profile-panel">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4 font-display">Profile</h2>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-tier-5-diamond rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🧘‍♂️</span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Alex</h3>
                  <p className="text-muted-foreground text-sm">🟡 Paisa Phase - Day {stepTracking.streak}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{stepTracking.currentTier}</div>
                    <div className="text-xs text-muted-foreground">Tier</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{stepTracking.streak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{Math.floor(stepTracking.lifetimeSteps / 1000)}K</div>
                    <div className="text-xs text-muted-foreground">Total Steps</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div role="tabpanel" id="dashboard-panel" className="animate-fade-in">
            {/* Header Banner Ad */}
            <AdBanner type="header" />

            {/* Main Progress Section */}
            <div className="px-6 py-4">
              <InteractiveProgressRing 
                dailySteps={stepTracking.dailySteps}
                lifetimeSteps={stepTracking.lifetimeSteps}
                goalSteps={stepTracking.goalSteps}
                currentTier={stepTracking.currentTier}
                onGoalReached={handleGoalReached}
              />
            </div>

            {/* Stats Cards */}
            <div className="px-6 pb-4">
              <StatsCards 
                coinsEarnedToday={stepTracking.coinsEarnedToday}
                coinsRedeemedToday={stepTracking.coinsRedeemedToday}
              />
            </div>

            {/* Countdown Timer */}
            <div className="px-6 pb-4">
              <CountdownTimer />
            </div>

            {/* Enhanced CTA Button */}
            <div className="px-6 pb-4">
              <EnhancedCTAButton
                onClaim={handleClaimReward}
                coinBalance={stepTracking.coinsEarnedToday}
                rewardAmount={10}
              />
            </div>

            {/* Inline Banner Ad */}
            <AdBanner type="inline" />

            {/* Enhanced Navigation Cards */}
            <div className="px-6 pb-6">
              <EnhancedNavigationCards />
            </div>
          </div>
        );
    }
  };

  // Notification counts for bottom navigation
  const notificationCounts = {
    wallet: stepTracking.coinsEarnedToday > 0 ? 1 : 0,
    rewards: 2, // Example: 2 new rewards available
    profile: 0,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <DashboardHeader 
        userName="Alex" 
        currentPhase="Paisa Phase" 
        phaseEmoji="🟡" 
        streakCount={stepTracking.streak} 
      />

      {/* Content Area with smooth transitions */}
      <div className="flex-1 pb-20 transition-all duration-500">
        {renderTabContent()}
      </div>

      {/* Enhanced Bottom Navigation */}
      <EnhancedBottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        notificationCounts={notificationCounts}
      />
    </div>
  );
};

export default Index;