import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ProgressRing } from '@/components/ProgressRing';
import { StatsCards } from '@/components/StatsCards';
import { NavigationCards } from '@/components/NavigationCards';
import { BottomNavigation } from '@/components/BottomNavigation';
import { AdBanner } from '@/components/AdBanner';
import { Button } from '@/components/ui/button';
import { Clock, Gift } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'rewards' | 'profile'>('dashboard');
  const [dailySteps] = useState(0);
  const [lifetimeSteps] = useState(0);
  const [coinsEarnedToday] = useState(0);
  const [coinsRedeemedToday] = useState(0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return (
          <div className="p-6 text-center">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4">Wallet Balance</h2>
              <div className="text-3xl font-bold text-primary mb-2">🪙 {coinsEarnedToday}</div>
              <p className="text-muted-foreground">Available Coins</p>
            </div>
          </div>
        );
      case 'rewards':
        return (
          <div className="p-6 text-center">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4">Rewards Store</h2>
              <Gift className="w-16 h-16 mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Browse amazing rewards and vouchers!</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6 text-center">
            <div className="dashboard-card">
              <h2 className="text-xl font-bold mb-4">Profile</h2>
              <div className="w-20 h-20 bg-tier-blue rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            {/* Header Banner Ad */}
            <AdBanner type="header" />

            {/* Main Progress Section */}
            <div className="px-6 py-4">
              <ProgressRing 
                dailySteps={dailySteps}
                lifetimeSteps={lifetimeSteps}
                goalSteps={10000}
              />
            </div>

            {/* Stats Cards */}
            <div className="px-6 pb-4">
              <StatsCards 
                coinsEarnedToday={coinsEarnedToday}
                coinsRedeemedToday={coinsRedeemedToday}
              />
            </div>

            {/* Countdown Timer */}
            <div className="px-6 pb-4">
              <div className="countdown-urgent">
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Claim your karma before midnight meditation</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="px-6 pb-4">
              <Button className="cta-button w-full">
                <Gift className="w-5 h-5 mr-2" />
                <span className="font-display">Claim Today's Karma</span>
              </Button>
            </div>

            {/* Inline Banner Ad */}
            <AdBanner type="inline" />

            {/* Navigation Cards */}
            <div className="px-6 pb-6">
              <NavigationCards />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <DashboardHeader 
        userName="Alex" 
        currentPhase="Mindful Journey" 
        phaseEmoji="🧘‍♂️" 
        streakCount={7} 
      />

      {/* Content Area */}
      <div className="flex-1 pb-20">
        {renderTabContent()}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
};

export default Index;