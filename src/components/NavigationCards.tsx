import { List, Gift, Disc, Wallet } from 'lucide-react';

export const NavigationCards = () => {
  const navigationItems = [
    {
      icon: List,
      title: "Coins Earned",
      subtitle: "Daily Earnings",
      gradient: "from-tier-gold to-tier-gold/80"
    },
    {
      icon: Gift,
      title: "Vouchers & Store",
      subtitle: "Redeem Rewards",
      gradient: "from-tier-blue to-tier-blue/80"
    },
    {
      icon: Disc,
      title: "Spin Wheel",
      subtitle: "Lucky Bonus",
      gradient: "from-tier-purple to-tier-purple/80"
    },
    {
      icon: Wallet,
      title: "Wallet",
      subtitle: "Balance & History",
      gradient: "from-tier-green to-tier-green/80"
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {navigationItems.map((item, index) => (
          <div key={index} className="nav-card">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 mx-auto shadow-md`}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-sm text-foreground mb-1">{item.title}</h4>
            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};