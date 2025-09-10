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
import { useMockStepTracking } from '@/hooks/use-mock-data';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'rewards' | 'profile'>('dashboard');
  const mockData = useMockStepTracking();

  const handleClaimReward = async (): Promise<boolean> => {
    try {
      await mockData.redeemCoins(10);
      return true;
    } catch {
      return false;
    }
  };

  const handleGoalReached = () => {
    console.log('Daily goal reached! 🎉');
  };

  const todayData = mockData.getTodaySteps();

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
                    {mockData.coinBalance.total.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground">Available Coins</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-tier-1-paisa-light rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-tier-1-paisa">
                      {mockData.coinBalance.todayEarned}
                    </div>
                    <div className="text-xs text-muted-foreground">Earned Today</div>
                  </div>
                  <div className="bg-tier-2-coin-light rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-tier-2-coin">
                      {mockData.coinBalance.todayRedeemed}
                    </div>
                    <div className="text-xs text-muted-foreground">Used Today</div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Recent Transactions</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {mockData.transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-2 bg-secondary/30 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-bold text-sm ${
                          transaction.amount > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
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
              <h2 className="text-xl font-bold mb-4 font-display">Vouchers & Coupons Store</h2>
              <div className="text-center">
                <Gift className="w-16 h-16 mx-auto text-tier-3-token mb-4" />
                <p className="text-muted-foreground mb-6">
                  Browse amazing vouchers and redeem coins for rewards!
                </p>
                
                <div className="grid gap-3">
                  {mockData.vouchers.slice(0, 4).map((voucher) => (
                    <div key={voucher.id} className="p-4 border rounded-xl hover:bg-tier-3-token-light/50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{voucher.title}</h3>
                            {voucher.isPopular && (
                              <span className="text-xs bg-tier-1-paisa text-tier-1-paisa-foreground px-2 py-1 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{voucher.description}</p>
                          <p className="text-xs text-muted-foreground">{voucher.brand}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-tier-3-token font-bold">{voucher.coinCost} coins</div>
                          {voucher.stockRemaining && (
                            <div className="text-xs text-muted-foreground">{voucher.stockRemaining} left</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <span className="text-3xl">{mockData.user.avatarEmoji}</span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">{mockData.user.username}</h3>
                  <p className="text-muted-foreground text-sm">🟡 Paisa Phase - Day {mockData.user.streakCount}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{mockData.user.currentPhase.id}</div>
                    <div className="text-xs text-muted-foreground">Tier</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{mockData.user.streakCount}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  <div className="bg-secondary rounded-lg p-3">
                    <div className="font-bold text-lg">{Math.floor(mockData.user.totalLifetimeSteps / 1000)}K</div>
                    <div className="text-xs text-muted-foreground">Total Steps</div>
                  </div>
                </div>

                {/* Achievements Section */}
                <div className="mt-6 text-left">
                  <h4 className="font-semibold mb-3 text-center">Recent Achievements</h4>
                  <div className="space-y-2">
                    {mockData.achievements
                      .filter(achievement => achievement.isUnlocked)
                      .slice(0, 3)
                      .map((achievement) => (
                        <div key={achievement.id} className="flex items-center gap-3 p-2 bg-success/10 rounded-lg">
                          <span className="text-2xl">{achievement.emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          </div>
                          <div className="text-success font-bold text-sm">+{achievement.coinReward}</div>
                        </div>
                      ))}
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
                dailySteps={todayData.steps}
                lifetimeSteps={mockData.user.totalLifetimeSteps}
                goalSteps={mockData.user.preferences.dailyStepGoal}
                currentTier={mockData.user.currentPhase.id}
                onGoalReached={handleGoalReached}
              />
            </div>

            {/* Stats Cards */}
            <div className="px-6 pb-4">
              <StatsCards 
                coinsEarnedToday={mockData.coinBalance.todayEarned}
                coinsRedeemedToday={mockData.coinBalance.todayRedeemed}
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
                coinBalance={mockData.coinBalance.total}
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
    wallet: mockData.coinBalance.todayEarned > 0 ? 1 : 0,
    rewards: 2, // Example: 2 new rewards available
    profile: mockData.achievements.filter(a => a.isUnlocked).length > 0 ? 1 : 0,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <DashboardHeader 
        userName={mockData.user.username} 
        currentPhase={mockData.user.currentPhase.name} 
        phaseEmoji={mockData.user.currentPhase.emoji} 
        streakCount={mockData.user.streakCount} 
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