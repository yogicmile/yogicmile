import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useYogicMileData } from '@/hooks/use-mock-data';

interface NavigationCard {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  yogicIcon: string;
  badge?: string | number;
  gradient: string;
  description: string;
  isNew?: boolean;
}

export const EnhancedNavigationCards = () => {
  const navigate = useNavigate();
  const mockData = useYogicMileData();

  const navigationCards: NavigationCard[] = [
    {
      id: 'phase-journey',
      title: 'Phase Journey',
      subtitle: 'Explore All 9 Tiers',
      icon: '🗺️',
      yogicIcon: '🕉️',
      badge: 'Discover',
      gradient: 'from-golden-accent/20 via-serene-blue/10 to-soft-lavender/20',
      description: 'Discover your path through the 9 phases of transformation',
      isNew: true
    },
    {
      id: 'coins-earned',
      title: 'Daily Earnings',
      subtitle: `${mockData.dailyProgress.coinsEarnedToday} coins today`,
      icon: '📊',
      yogicIcon: '🪷💰',
      badge: mockData.dailyProgress.coinsEarnedToday > 0 ? mockData.dailyProgress.coinsEarnedToday : null,
      gradient: 'from-sage-green/20 via-deep-teal/10 to-serene-blue/20',
      description: 'Track your mindful earnings and coin history'
    },
    {
      id: 'vouchers',
      title: 'Rewards Store',
      subtitle: 'Mindful Shopping',
      icon: '🎁',
      yogicIcon: '☮️🛍️',
      badge: 'NEW',
      gradient: 'from-soft-lavender/20 via-warm-coral/10 to-golden-accent/20',
      description: 'Redeem coins for wellness and lifestyle rewards'
    },
    {
      id: 'spin-wheel',
      title: 'Lucky Spin',
      subtitle: 'Spin & Win',
      icon: '🎡',
      yogicIcon: '☸️',
      badge: 1,
      gradient: 'from-warm-coral/20 via-golden-accent/10 to-sage-green/20',
      description: 'Spin the wheel of fortune for bonus rewards'
    },
    {
      id: 'wallet',
      title: 'My Wallet',
      subtitle: 'Mindful Money',
      icon: '💰',
      yogicIcon: '💪💳',
      badge: mockData.wallet.mockData.pendingRedemptions > 0 ? mockData.wallet.mockData.pendingRedemptions : null,
      gradient: 'from-deep-teal/20 via-serene-blue/10 to-soft-lavender/20',
      description: 'Manage your earnings and transaction history'
    },
    {
      id: 'calculation-review',
      title: 'Calc Review',
      subtitle: 'Verify Logic',
      icon: '🧮',
      yogicIcon: '📊✨',
      badge: 'TEST',
      gradient: 'from-purple-100/20 via-indigo-100/10 to-blue-100/20',
      description: 'Test coin calculations across all phases'
    }
  ];

  const handleCardClick = (cardId: string) => {
    console.log(`Navigating to: ${cardId}`);
    
    if (cardId === 'phase-journey') {
      navigate('/phase-journey');
    } else if (cardId === 'calculation-review') {
      navigate('/calculation-review');
    } else {
      // Add navigation logic for other cards here
      console.log(`Opening ${cardId} view...`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Phase Journey - Featured Card */}
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-lg border-golden-accent/30 bg-gradient-to-br ${navigationCards[0].gradient}`}
        onClick={() => handleCardClick(navigationCards[0].id)}
      >
        <div className="p-6">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10 transform rotate-12">
            <div className="text-6xl">{navigationCards[0].yogicIcon}</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{navigationCards[0].icon}</div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{navigationCards[0].title}</h3>
                  <p className="text-sm text-muted-foreground">{navigationCards[0].subtitle}</p>
                </div>
              </div>
              {navigationCards[0].badge && (
                <Badge 
                  variant="secondary" 
                  className="bg-golden-accent text-golden-accent-foreground animate-pulse"
                >
                  {navigationCards[0].badge}
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {navigationCards[0].description}
            </p>
            
            {/* Tier Preview Icons */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {['🟡', '🪙', '🎯', '💎', '💠', '👑', '⚡', '🌟', '🔥'].map((symbol, index) => (
                  <div 
                    key={index}
                    className={`w-6 h-6 text-xs flex items-center justify-center rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-golden-accent text-white scale-110' : 'bg-gray-200 opacity-60'
                    }`}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground ml-2">
                Phase 1 of 9
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Other Navigation Cards */}
      <div className="grid grid-cols-2 gap-4">
        {navigationCards.slice(1).map((card) => (
          <Card 
            key={card.id}
            className={`relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-lg bg-gradient-to-br ${card.gradient} border-border/30`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="p-4">
              {/* Yogic Icon Background */}
              <div className="absolute top-1 right-1 text-2xl opacity-20">
                {card.yogicIcon}
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl">{card.icon}</div>
                  {card.badge && (
                    <Badge 
                      variant={typeof card.badge === 'string' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {card.badge}
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-semibold text-sm text-foreground mb-1">
                  {card.title}
                </h3>
                
                {card.subtitle && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {card.subtitle}
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mindfulness Message */}
      <div className="text-center mt-6 p-4 bg-soft-lavender/10 rounded-2xl border border-soft-lavender/20">
        <div className="text-2xl mb-2">⭐</div>
        <p className="text-sm text-muted-foreground italic">
          "Every step on your journey matters. Walk with purpose." 
        </p>
      </div>
    </div>
  );
};
