import { Home, Wallet, Gift, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: 'dashboard' | 'wallet' | 'rewards' | 'profile';
  onTabChange: (tab: 'dashboard' | 'wallet' | 'rewards' | 'profile') => void;
}

export const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'dashboard' as const, icon: Home, label: 'Home' },
    { id: 'wallet' as const, icon: Wallet, label: 'Wallet' },
    { id: 'rewards' as const, icon: Gift, label: 'Rewards' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bottom-navigation">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`tab-button ${
              activeTab === tab.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};