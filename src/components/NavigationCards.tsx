import { List, Gift, Disc, Wallet } from 'lucide-react';

export const NavigationCards = () => {
  const navigationItems = [
    {
      icon: List,
      title: "Karma Journal",
      subtitle: "Track Progress",
      gradient: "from-tier-gold via-tier-gold to-[hsl(35_80%_65%)]"
    },
    {
      icon: Gift,
      title: "Wellness Store",
      subtitle: "Mindful Rewards",
      gradient: "from-tier-amethyst via-tier-amethyst to-[hsl(290_45%_70%)]"
    },
    {
      icon: Disc,
      title: "Dharma Wheel",
      subtitle: "Daily Inspiration",
      gradient: "from-tier-sage via-tier-sage to-[hsl(160_40%_60%)]"
    },
    {
      icon: Wallet,
      title: "Sacred Vault",
      subtitle: "Your Balance",
      gradient: "from-tier-rose via-tier-rose to-[hsl(320_50%_70%)]"
    }
  ];

  return (
    <div>
      <h3 className="text-xl font-display font-semibold mb-6 text-foreground">Mindful Pathways</h3>
      <div className="grid grid-cols-2 gap-5">
        {navigationItems.map((item, index) => (
          <div key={index} className="nav-card">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 mx-auto shadow-premium`}>
              <item.icon className="w-7 h-7 text-white" />
            </div>
            <h4 className="font-semibold text-sm text-foreground mb-2 font-display">{item.title}</h4>
            <p className="text-xs text-muted-foreground font-medium">{item.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
};