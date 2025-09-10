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
import { EnhancedBottomNavigation } from '@/components/EnhancedBottomNavigation';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'rewards' | 'profile'>('dashboard');
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="p-6 animate-fade-in" role="tabpanel" id="wallet-panel" aria-labelledby="wallet-tab">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4 font-display">My Wallet</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4" role="img" aria-label="Money bag">💰</div>
                  <div className="text-3xl font-bold text-tier-1-paisa mb-2">
                    ₹{yogicData.wallet.mockData.totalBalance}
                  </div>
                  <p className="text-muted-foreground">Total Balance</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-tier-1-paisa-light rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-tier-1-paisa">
                      ₹{yogicData.wallet.mockData.thisWeekEarnings}
                    </div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div className="bg-tier-2-coin-light rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-tier-2-coin">
                      {yogicData.wallet.mockData.pendingRedemptions}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-6">
                  <Button 
                    onClick={() => navigate('/wallet')}
                    className="w-full h-12 bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya hover:from-tier-1-paisa/90 hover:to-tier-2-rupaya/90 text-white font-semibold rounded-2xl"
                  >
                    <span className="mr-2">💰</span>
                    Open Full Wallet
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Button variant="outline" size="sm" className="text-xs p-2">
                    <span className="mr-1">🎁</span>
                    Vouchers
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs p-2">
                    <span className="mr-1">⚡</span>
                    Bills
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs p-2">
                    <span className="mr-1">💵</span>
                    Cash
                  </Button>
                </div>

                {/* Recent Transactions Preview */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Recent Activity</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/wallet')}
                      className="text-xs"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {yogicData.wallet.mockData.transactionHistory.length > 0 ? (
                      yogicData.wallet.mockData.transactionHistory.slice(0, 3).map((transaction, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-secondary/30 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">
                              {transaction.item || transaction.source}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.date}
                            </p>
                          </div>
                          <div className={`font-bold text-sm ${
                            transaction.amount > 0 ? 'text-success' : 'text-muted-foreground'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <div className="text-2xl mb-2">🧘‍♀️</div>
                        <p className="text-xs text-muted-foreground">No transactions yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'rewards':
        return (
          <div className="p-6 animate-fade-in" role="tabpanel" id="rewards-panel" aria-labelledby="rewards-tab">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4 font-display flex items-center gap-2">
                <span role="img" aria-label="Gift">🎁</span>
                Rewards Store
                {yogicData.vouchersStore.badge && (
                  <span className="text-xs bg-tier-1-paisa text-tier-1-paisa-foreground px-2 py-1 rounded-full">
                    {yogicData.vouchersStore.badge}
                  </span>
                )}
              </h2>
              
              <div className="grid gap-3">
                {yogicData.vouchersStore.mockData.slice(0, 4).map((voucher) => (
                  <div 
                    key={voucher.id} 
                    className="p-4 border rounded-xl hover:bg-tier-3-token-light/50 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-tier-3-token"
                    role="button"
                    tabIndex={0}
                    aria-label={`${voucher.title} for ₹${voucher.cost}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // Handle voucher selection
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{voucher.title}</h3>
                          {voucher.popularity === 'high' && (
                            <span className="text-xs bg-tier-1-paisa text-tier-1-paisa-foreground px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{voucher.description}</p>
                        <p className="text-xs text-muted-foreground">Stock: {voucher.stock}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-tier-3-token font-bold">₹{voucher.cost}</div>
                        <div className="text-xs text-muted-foreground capitalize">{voucher.category}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6 animate-fade-in" role="tabpanel" id="profile-panel" aria-labelledby="profile-tab">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4 font-display">Profile</h2>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-tier-5-diamond rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl" role="img" aria-label="Person meditating">🧘‍♂️</span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">{yogicData.user.displayName}</h3>
                  <p className="text-muted-foreground text-sm">
                    {yogicData.user.tierSymbol} {yogicData.user.tierName} - Day {yogicData.user.streakDays}
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{yogicData.user.currentTier}</div>
                    <div className="text-xs text-muted-foreground">Tier</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{yogicData.user.streakDays}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{Math.floor(yogicData.user.totalLifetimeSteps / 1000)}K</div>
                    <div className="text-xs text-muted-foreground">Total Steps</div>
                  </div>
                </div>

                {/* Tier Progress */}
                <div className="mt-6 text-left">
                  <h4 className="font-semibold mb-3 text-center">Tier Progress</h4>
                  <div className="bg-tier-1-paisa-light rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Current Phase</span>
                      <span className="text-tier-1-paisa font-bold">
                        {yogicData.user.tierSymbol} {yogicData.user.tierName}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Progress: {yogicData.tierProgress.currentTierSteps.toLocaleString()} / {yogicData.tierProgress.tierTarget.toLocaleString()} steps
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-tier-1-paisa h-2 rounded-full transition-all duration-500"
                        style={{ width: `${yogicData.getTierProgressPercentage()}%` }}
                        role="progressbar"
                        aria-valuenow={yogicData.getTierProgressPercentage()}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Tier progress"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {yogicData.tierProgress.daysRemaining} days remaining
                    </div>
                  </div>
                </div>

                {/* Weekly Insights */}
                <div className="mt-6 text-left">
                  <h4 className="font-semibold mb-3 text-center">This Week</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-success/10 rounded-lg">
                      <span className="text-sm">Total Steps</span>
                      <span className="font-bold text-success">{yogicData.insights.weekStats.totalSteps.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-tier-3-token/10 rounded-lg">
                      <span className="text-sm">Daily Average</span>
                      <span className="font-bold text-tier-3-token">{yogicData.insights.weekStats.averageDaily.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-tier-5-diamond/10 rounded-lg">
                      <span className="text-sm">Improvement</span>
                      <span className="font-bold text-tier-5-diamond">{yogicData.insights.weekStats.improvement}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div role="tabpanel" id="dashboard-panel" aria-labelledby="dashboard-tab" className="animate-fade-in">
            {/* Yogic Mile Branding Header */}
            <YogicMileHeader className="animate-fade-in" />

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
                className="animate-fade-in"
              />
            </div>

            {/* Dynamic Coin Rate Display Section */}
            <div className="px-4 py-2">
              <DynamicCoinRateDisplay
                currentRate={coinRateSystem.calculateCurrentRate()}
                currentTier={coinRateSystem.currentTierData}
                nextTier={coinRateSystem.nextTierData}
                dailyPotential={coinRateSystem.getDailyPotential()}
                tierProgress={coinRateSystem.getTierProgress()}
                className="animate-fade-in"
              />
            </div>

            {/* Mid-Dashboard Ad - Mindful Products */}
            <AdBanner type="inline" />

            {/* Motivation & Streaks Section */}
            <div className="px-4 py-2">
              <MotivationStreaksSection
                currentStreak={yogicData.user.streakDays}
                nextStreakMilestone={7} // Next milestone at 7 days
                streakReward={50} // 50 bonus coins
                className="animate-fade-in"
              />
            </div>

            {/* Today's Summary Card */}
            <div className="px-4 py-2">
            <TodaysSummaryCard
              currentSteps={yogicData.dailyProgress.currentSteps}
              dailyGoal={yogicData.dailyProgress.dailyGoal}
              coinsEarned={yogicData.dailyProgress.coinsEarnedToday}
              distance={yogicData.dailyProgress.distance}
              activeMinutes={yogicData.dailyProgress.activeMinutes}
              isGoalReached={yogicData.dailyProgress.currentSteps >= yogicData.dailyProgress.dailyGoal}
              hasRedeemedToday={yogicData.dailyProgress.coinsRedeemedToday > 0}
              onClaimReward={handleClaimReward}
              coinBalance={yogicData.wallet.mockData.totalBalance * 100}
              className="animate-fade-in"
            />
            </div>

            {/* Yogic Mile Inspiration & Mindful Features */}
            <div className="px-4 py-2">
              <YogicMileInspiration
                currentTier={coinRateSystem.currentTier}
                currentStreak={coinRateSystem.currentStreak}
                className="animate-fade-in"
              />
            </div>

            {/* Enhanced Navigation Cards with Phase Journey */}
            <div className="px-4 pb-6">
              <EnhancedNavigationCards />
            </div>

            {/* Milestone Celebrations Overlay */}
            <MilestoneCelebrations
              event={coinRateSystem.celebrationEvent}
              onDismiss={coinRateSystem.dismissCelebration}
            />
          </div>
        );
    }
  };

  // Notification counts for bottom navigation
  const notificationCounts = {
    wallet: yogicData.wallet.mockData.pendingRedemptions > 0 ? yogicData.wallet.mockData.pendingRedemptions : 0,
    rewards: yogicData.vouchersStore.badge ? 1 : 0,
    profile: yogicData.tierProgress.daysRemaining <= 7 ? 1 : 0,
  };

  return (
    <ErrorBoundary>
      <div className="mobile-container relative">
        {/* Offline Indicator */}
        <OfflineIndicator />

        {/* Content Area with smooth transitions */}
        <main className="flex-1 pb-20 transition-all duration-500">
          {renderTabContent()}
        </main>

        {/* Enhanced Bottom Navigation with safe area handling */}
        <EnhancedBottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          notificationCounts={notificationCounts}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Index;