import { Home, Wallet, Gift, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useHapticFeedback } from '@/hooks/use-animations';

interface EnhancedBottomNavigationProps {
  activeTab: 'dashboard' | 'wallet' | 'rewards' | 'profile';
  onTabChange: (tab: 'dashboard' | 'wallet' | 'rewards' | 'profile') => void;
  notificationCounts?: {
    wallet?: number;
    rewards?: number;
    profile?: number;
  };
}

export const EnhancedBottomNavigation = ({ 
  activeTab, 
  onTabChange, 
  notificationCounts = {} 
}: EnhancedBottomNavigationProps) => {
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const { triggerHaptic } = useHapticFeedback();

  const tabs = [
    { id: 'dashboard' as const, icon: Home, label: 'Dashboard' },
    { id: 'wallet' as const, icon: Wallet, label: 'Wallet' },
    { id: 'rewards' as const, icon: Gift, label: 'Rewards' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    setIndicatorPosition(activeIndex * 25); // 25% per tab
  }, [activeTab, tabs]);

  const handleTabChange = (tabId: typeof activeTab) => {
    triggerHaptic('light');
    onTabChange(tabId);
  };

  const getNotificationCount = (tabId: string) => {
    return notificationCounts[tabId as keyof typeof notificationCounts] || 0;
  };

  // Support keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, tabId: typeof activeTab) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTabChange(tabId);
    }
  };

  // Support swipe gestures
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1].id);
    }
    if (isRightSwipe && currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1].id);
    }
  };

  return (
    <nav 
      className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-surface/80 backdrop-blur-md border-t border-border/50 px-6 py-2 z-50"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="tablist"
      aria-label="Main navigation"
    >
      {/* Sliding indicator */}
      <div 
        className="absolute top-0 h-1 bg-gradient-primary rounded-b-full transition-all duration-500 ease-out"
        style={{
          left: `${indicatorPosition}%`,
          width: '25%',
        }}
      />
      
      <div className="flex justify-around relative">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const notificationCount = getNotificationCount(tab.id);
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`relative tab-button ${
                isActive ? 'tab-active' : 'tab-inactive'
              } focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded-xl`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              tabIndex={isActive ? 0 : -1}
            >
              <div className="relative">
                <tab.icon 
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} 
                />
                
                {/* Notification badge */}
                {notificationCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-destructive-foreground">
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                  </div>
                )}
              </div>
              
              <span className={`text-xs font-medium transition-all duration-300 ${
                isActive ? 'opacity-100' : 'opacity-75'
              }`}>
                {tab.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-foreground rounded-full animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};