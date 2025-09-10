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
import { useYogicMileData } from '@/hooks/use-mock-data';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'rewards' | 'profile'>('dashboard');
  const yogicData = useYogicMileData();

  const handleClaimReward = async (): Promise<boolean> => {
    try {
      await yogicData.redeemDailyCoins(10);
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
              <h2 className="text-xl font-bold mb-4 font-display">My Wallet</h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-6xl mb-4">💰</div>
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

                {/* Recent Transactions */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Recent Transactions</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {yogicData.wallet.mockData.transactionHistory.slice(0, 5).map((transaction, index) => (
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
                          transaction.amount > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount)}
                        </div>
                      </div>
                    ))}
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
              <h2 className="text-xl font-bold mb-4 font-display flex items-center gap-2">
                <span>🎁</span>
                Rewards Store
                {yogicData.vouchersStore.badge && (
                  <span className="text-xs bg-tier-1-paisa text-tier-1-paisa-foreground px-2 py-1 rounded-full">
                    {yogicData.vouchersStore.badge}
                  </span>
                )}
              </h2>
              
              <div className="grid gap-3">
                {yogicData.vouchersStore.mockData.slice(0, 4).map((voucher) => (
                  <div key={voucher.id} className="p-4 border rounded-xl hover:bg-tier-3-token-light/50 transition-colors cursor-pointer">
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
                        <div className="text-xs text-muted-foreground">{voucher.category}</div>
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
          <div className="p-6 animate-fade-in" role="tabpanel" id="profile-panel">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4 font-display">Profile</h2>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-tier-5-diamond rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl">🧘‍♂️</span>
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
          <div role="tabpanel" id="dashboard-panel" className="animate-fade-in">
            {/* Header Banner Ad */}
            <AdBanner type="header" />

            {/* Main Progress Section */}
            <div className="px-6 py-4">
              <InteractiveProgressRing 
                dailySteps={yogicData.dailyProgress.currentSteps}
                lifetimeSteps={yogicData.user.totalLifetimeSteps}
                goalSteps={yogicData.dailyProgress.dailyGoal}
                currentTier={yogicData.user.currentTier}
                onGoalReached={handleGoalReached}
              />
            </div>

            {/* Stats Cards */}
            <div className="px-6 pb-4">
              <StatsCards 
                coinsEarnedToday={yogicData.dailyProgress.coinsEarnedToday}
                coinsRedeemedToday={yogicData.dailyProgress.coinsRedeemedToday}
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
                coinBalance={yogicData.wallet.mockData.totalBalance}
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
    wallet: yogicData.wallet.mockData.pendingRedemptions > 0 ? yogicData.wallet.mockData.pendingRedemptions : 0,
    rewards: yogicData.vouchersStore.badge ? 1 : 0,
    profile: yogicData.tierProgress.daysRemaining <= 7 ? 1 : 0,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <DashboardHeader 
        userName={yogicData.user.displayName} 
        currentPhase={yogicData.user.tierName} 
        phaseEmoji={yogicData.user.tierSymbol} 
        streakCount={yogicData.user.streakDays} 
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