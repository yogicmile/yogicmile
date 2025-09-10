import { List, Gift, Disc, Wallet, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useHapticFeedback } from '@/hooks/use-animations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  gradient: string;
  tierColor: string;
  hasNotification?: boolean;
  notificationText?: string;
  quickActions?: Array<{
    label: string;
    action: () => void;
  }>;
}

export const EnhancedNavigationCards = () => {
  const [selectedCard, setSelectedCard] = useState<NavigationItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const navigationItems: NavigationItem[] = [
    {
      icon: List,
      title: "Coins Earned",
      subtitle: "Track Earnings",
      gradient: "from-tier-1-paisa via-tier-1-paisa to-tier-2-coin",
      tierColor: "tier-1-paisa",
      hasNotification: true,
      notificationText: "New earnings available",
      quickActions: [
        { label: "View Daily Log", action: () => console.log("Quick log") },
        { label: "Earning Stats", action: () => console.log("View stats") },
      ]
    },
    {
      icon: Gift,
      title: "Vouchers & Coupons",
      subtitle: "Redeem Rewards",
      gradient: "from-tier-3-token via-tier-3-token to-tier-4-gem",
      tierColor: "tier-3-token",
      hasNotification: false,
      quickActions: [
        { label: "Browse Store", action: () => console.log("Browse rewards") },
        { label: "My Vouchers", action: () => console.log("My purchases") },
      ]
    },
    {
      icon: Disc,
      title: "Spin Wheel",
      subtitle: "Bonus Coins",
      gradient: "from-tier-5-diamond via-tier-5-diamond to-tier-6-crown",
      tierColor: "tier-5-diamond",
      hasNotification: true,
      notificationText: "Free spin available",
      quickActions: [
        { label: "Spin Now", action: () => console.log("Spin now") },
        { label: "Spin History", action: () => console.log("Spin history") },
      ]
    },
    {
      icon: Wallet,
      title: "Wallet",
      subtitle: "Balance & History",
      gradient: "from-tier-7-emperor via-tier-7-emperor to-tier-8-legend",
      tierColor: "tier-7-emperor",
      hasNotification: false,
      quickActions: [
        { label: "View Balance", action: () => console.log("View balance") },
        { label: "Redeem History", action: () => console.log("Transaction history") },
      ]
    }
  ];

  const handleCardClick = (item: NavigationItem) => {
    triggerHaptic('medium');
    setSelectedCard(item);
    setShowModal(true);
  };

  const handleQuickAction = (action: () => void) => {
    triggerHaptic('light');
    action();
    setShowModal(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, item: NavigationItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(item);
    }
  };

  return (
    <>
      <div>
        <h3 className="text-xl font-display font-semibold mb-6 text-foreground">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-5">
          {navigationItems.map((item, index) => (
            <div 
              key={index} 
              className="nav-card group relative overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50"
              onClick={() => handleCardClick(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              role="button"
              tabIndex={0}
              aria-label={`${item.title} - ${item.subtitle}`}
            >
              {/* Notification badge */}
              {item.hasNotification && (
                <div className="absolute -top-1 -right-1 z-10">
                  <div className="w-3 h-3 bg-destructive rounded-full animate-pulse border-2 border-surface" />
                </div>
              )}
              
              {/* Icon container with enhanced animation */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 mx-auto shadow-premium group-hover:shadow-glow transition-all duration-500 group-hover:scale-110 group-active:scale-95`}>
                <item.icon className="w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-12" />
              </div>
              
              {/* Content */}
              <h4 className="font-semibold text-sm text-foreground mb-2 font-display group-hover:text-tier-1-paisa transition-colors duration-300">
                {item.title}
              </h4>
              <p className="text-xs text-muted-foreground font-medium mb-3">
                {item.subtitle}
              </p>
              
              {/* Notification text */}
              {item.hasNotification && item.notificationText && (
                <Badge variant="secondary" className="text-xs mb-2 animate-pulse">
                  {item.notificationText}
                </Badge>
              )}
              
              {/* Arrow indicator */}
              <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Modal with Quick Actions */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-display">
              {selectedCard && (
                <>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedCard.gradient} flex items-center justify-center`}>
                    <selectedCard.icon className="w-5 h-5 text-white" />
                  </div>
                  {selectedCard.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCard && (
            <div className="space-y-4">
              <p className="text-muted-foreground">{selectedCard.subtitle}</p>
              
              {selectedCard.hasNotification && selectedCard.notificationText && (
                <div className={`p-3 bg-${selectedCard.tierColor}-light rounded-lg border-l-4 border-${selectedCard.tierColor}`}>
                  <p className={`text-sm font-medium text-${selectedCard.tierColor}`}>
                    {selectedCard.notificationText}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Quick Actions</h4>
                {selectedCard.quickActions?.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className={`w-full p-3 text-left bg-${selectedCard.tierColor}/10 hover:bg-${selectedCard.tierColor}/20 rounded-lg transition-colors duration-200 text-sm font-medium`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};