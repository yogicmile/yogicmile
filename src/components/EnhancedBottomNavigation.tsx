import { useState, useEffect } from 'react';
import { Home, Wallet, Gift, User, TrendingUp } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedBottomNavigationProps {
  activeTab: 'dashboard' | 'wallet' | 'rewards' | 'profile';
  onTabChange: (tab: 'dashboard' | 'wallet' | 'rewards' | 'profile') => void;
  notificationCounts?: {
    dashboard?: number;
    wallet?: number;
    rewards?: number;
    profile?: number;
  };
  walletBalance?: number;
}

type TabId = 'dashboard' | 'wallet' | 'rewards' | 'profile';

export const EnhancedBottomNavigation = ({ 
  activeTab, 
  onTabChange, 
  notificationCounts = {},
  walletBalance = 0
}: EnhancedBottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [animatingTab, setAnimatingTab] = useState<string | null>(null);
  const [coinAnimation, setCoinAnimation] = useState(false);

  // Animate coin when wallet is active
  useEffect(() => {
    if (activeTab === 'wallet') {
      const interval = setInterval(() => {
        setCoinAnimation(prev => !prev);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const tabs = [
    {
      id: 'dashboard' as TabId,
      label: 'Dashboard',
      icon: Home,
      emoji: '🏠',
      gradient: 'from-serene-blue to-deep-teal',
      badge: notificationCounts.dashboard,
      route: '/'
    },
    {
      id: 'wallet' as TabId,
      label: 'Wallet',
      icon: Wallet,
      emoji: '💰',
      gradient: 'from-tier-1-paisa to-tier-2-rupaya',
      badge: walletBalance >= 5 ? `₹${walletBalance}` : notificationCounts.wallet,
      route: '/wallet'
    },
    {
      id: 'rewards' as TabId,
      label: 'Rewards',
      icon: Gift,
      emoji: '🎁',
      gradient: 'from-sage-green to-tier-3-token',
      badge: notificationCounts.rewards,
      route: '/rewards'
    },
    {
      id: 'profile' as TabId,
      label: 'Profile',
      icon: User,
      emoji: '👤',
      gradient: 'from-soft-lavender to-tier-5-diamond',
      badge: notificationCounts.profile,
      route: '/profile'
    }
  ];

  const handleTabPress = (tabId: TabId) => {
    if (tabId === activeTab) return;
    
    setAnimatingTab(tabId);
    
    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    setTimeout(() => {
      setAnimatingTab(null);
    }, 200);

    // Handle navigation for wallet
    if (tabId === 'wallet') {
      navigate('/wallet');
    } else {
      onTabChange(tabId);
    }
  };

  const getTabAnimation = (tabId: string) => {
    if (animatingTab === tabId) {
      return 'scale-95 shadow-sm';
    }
    return 'scale-100';
  };

  const getIconAnimation = (tabId: string) => {
    if (tabId === 'wallet' && (activeTab === 'wallet' || coinAnimation)) {
      return 'animate-bounce';
    }
    return '';
  };

  const isTabActive = (tabId: TabId) => {
    if (tabId === 'wallet') {
      return location.pathname === '/wallet';
    }
    return activeTab === tabId;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Yogic Mile Mini Header */}
      <div className="bg-surface/95 backdrop-blur-md border-t px-4 py-2">
        <div className="text-center">
          <div className="text-xs text-tier-1-paisa font-medium opacity-80">
            Walk. Earn. Evolve. 🧘‍♀️
          </div>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav 
        className="bg-surface/95 backdrop-blur-md border-t border-border/50 px-4 py-2"
        role="tablist"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = isTabActive(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-tier-1-paisa focus:ring-offset-2",
                  getTabAnimation(tab.id),
                  isActive 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                    : "text-muted-foreground hover:text-foreground"
                )}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.id}-panel`}
                tabIndex={isActive ? 0 : -1}
              >
                {/* Icon with animation */}
                <div className={cn(
                  "relative mb-1 transition-transform duration-200",
                  getIconAnimation(tab.id)
                )}>
                  {isActive ? (
                    <span className="text-xl">{tab.emoji}</span>
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                  
                  {/* Notification Badge */}
                  {tab.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "default"}
                      className={cn(
                        "absolute -top-2 -right-2 min-w-5 h-5 text-xs px-1 rounded-full border-2 border-surface",
                        tab.id === 'wallet' && typeof tab.badge === 'string' && tab.badge.includes('₹')
                          ? "bg-tier-1-paisa text-tier-1-paisa-foreground animate-pulse"
                          : isActive 
                          ? "bg-white text-foreground" 
                          : "bg-tier-1-paisa text-tier-1-paisa-foreground"
                      )}
                    >
                      {tab.badge}
                    </Badge>
                  )}

                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-30 bg-white"></div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  "text-xs font-medium transition-all duration-200",
                  isActive 
                    ? "text-white font-semibold" 
                    : "text-muted-foreground"
                )}>
                  {tab.label}
                </span>

                {/* Active tab underline */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress indicator for active tab */}
        <div className="flex justify-center mt-2">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <div
                key={`indicator-${tab.id}`}
                className={cn(
                  "w-2 h-1 rounded-full transition-all duration-300",
                  isTabActive(tab.id)
                    ? "bg-tier-1-paisa w-6"
                    : "bg-border"
                )}
              />
            ))}
          </div>
        </div>
      </nav>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-bottom bg-surface/95 backdrop-blur-md"></div>
    </div>
  );
};