import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useFitnessData } from '@/hooks/use-fitness-data';

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
  const fitnessData = useFitnessData();

  const navigationCards: NavigationCard[] = [
    {
      id: 'wallet',
      title: 'My Wallet',
      subtitle: `Balance: ${fitnessData.wallet.mockData.totalBalance} coins`,
      icon: '💰',
      yogicIcon: '💪💳',
      badge: fitnessData.wallet.mockData.pendingRedemptions > 0 ? fitnessData.wallet.mockData.pendingRedemptions : null,
      gradient: 'from-deep-teal/20 via-serene-blue/10 to-soft-lavender/20',
      description: 'Manage your earnings and transaction history',
      isNew: false
    },
    {
      id: 'vouchers',
      title: 'Rewards Store',
      subtitle: 'Shop Rewards',
      icon: '🎁',
      yogicIcon: '🛍️✨',
      badge: 'Shop Now',
      gradient: 'from-soft-lavender/20 via-warm-coral/10 to-golden-accent/20',
      description: 'Redeem coins for rewards and lifestyle products',
      isNew: false
    }
  ];

  const handleCardClick = (cardId: string) => {
    switch (cardId) {
      case 'vouchers':
        navigate('/rewards');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation Cards */}
      <div className="grid grid-cols-2 gap-4">
        {navigationCards.map((card) => (
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
