import { Gift, Zap, Banknote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuickActionsProps {
  balance: number;
}

export const QuickActions = ({ balance }: QuickActionsProps) => {
  const actions = [
    {
      id: 'voucher',
      title: 'Redeem for Voucher',
      subtitle: 'Shopping, food, entertainment',
      minimum: 'From ₹10',
      icon: Gift,
      color: 'bg-blue-500',
      badge: null,
      enabled: balance >= 10,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'bills',
      title: 'Pay Bill',
      subtitle: 'Mobile, electricity, DTH',
      minimum: 'From ₹50',
      icon: Zap,
      color: 'bg-green-500',
      badge: null,
      enabled: balance >= 50,
      gradient: 'from-green-500 to-green-600'
    },
    {
      id: 'cash',
      title: 'Withdraw Cash',
      subtitle: 'Direct to bank account',
      minimum: '₹500+ only',
      icon: Banknote,
      color: 'bg-tier-1-paisa',
      badge: 'Popular',
      enabled: balance >= 500,
      gradient: 'from-tier-1-paisa to-tier-2-rupaya'
    }
  ];

  const handleActionClick = (actionId: string) => {
    console.log(`Action clicked: ${actionId}`);
    // Handle navigation to specific redemption flow
  };

  return (
    <div className="grid gap-3">
      {actions.map((action) => {
        const IconComponent = action.icon;
        
        return (
          <Button
            key={action.id}
            variant="ghost"
            className={`h-auto p-4 justify-start text-left hover:scale-102 transition-all duration-200 ${
              !action.enabled ? 'opacity-50' : ''
            }`}
            onClick={() => handleActionClick(action.id)}
            disabled={!action.enabled}
          >
            <div className="flex items-center gap-4 w-full">
              {/* Icon with gradient background */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-white shadow-lg`}>
                <IconComponent className="w-6 h-6" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate">{action.title}</h3>
                  {action.badge && (
                    <Badge variant="secondary" className="bg-tier-1-paisa text-tier-1-paisa-foreground px-2 py-0.5 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">{action.subtitle}</p>
                <p className="text-xs text-muted-foreground">{action.minimum}</p>
              </div>
              
              {/* Status indicator */}
              <div className="flex-shrink-0">
                {action.enabled ? (
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-muted rounded-full"></div>
                )}
              </div>
            </div>
          </Button>
        );
      })}
      
      {/* Coming Soon Section */}
      <div className="mt-4 p-4 bg-secondary/30 rounded-xl border border-dashed">
        <div className="text-center">
          <div className="text-3xl mb-2">🔜</div>
          <h4 className="font-medium mb-1">More Options Coming Soon</h4>
          <p className="text-xs text-muted-foreground">
            UPI transfers, investment options, and charity donations
          </p>
        </div>
      </div>
    </div>
  );
};