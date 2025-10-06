import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { EnhancedBottomNavigation } from '@/components/EnhancedBottomNavigation';
import { FloatingHelpButton } from '@/components/FloatingHelpButton';
import { ThemeInitializer } from '@/components/ThemeInitializer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Hide bottom navigation on auth pages
  const hideBottomNav = ['/welcome', '/login', '/signup'].includes(location.pathname);
  
  // Determine active tab based on current route
  const getActiveTab = (): 'dashboard' | 'wallet' | 'rewards' | 'challenges' | 'community' | 'profile' => {
    switch (location.pathname) {
      case '/wallet':
        return 'wallet';
      case '/rewards':
        return 'rewards';
      case '/challenges':
        return 'challenges';
      case '/community':
        return 'community';
      case '/profile':
        return 'profile';
      default:
        return 'dashboard';
    }
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'wallet' | 'rewards' | 'challenges' | 'community' | 'profile'>(getActiveTab());

  const handleTabChange = (tab: 'dashboard' | 'wallet' | 'rewards' | 'challenges' | 'community' | 'profile') => {
    setActiveTab(tab);
    
    // Navigate to appropriate route
    switch (tab) {
      case 'dashboard':
        navigate('/');
        break;
      case 'wallet':
        navigate('/wallet');
        break;
      case 'rewards':
        navigate('/rewards');
        break;
      case 'challenges':
        navigate('/challenges');
        break;
      case 'community':
        navigate('/community');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  // Mock data for navigation
  const notificationCounts = {
    rewards: 3,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Theme bootstrapper */}
      <ThemeInitializer />

      {/* Main content */}
      <main className={hideBottomNav ? "" : "pb-32"}> {/* Add bottom padding only when nav is shown */}
        {children}
      </main>
      
      {/* Persistent Bottom Navigation - hidden on auth pages */}
      {!hideBottomNav && (
        <>
          <EnhancedBottomNavigation
            activeTab={getActiveTab()}
            onTabChange={handleTabChange}
            notificationCounts={notificationCounts}
          />
          {location.pathname !== '/help' && <FloatingHelpButton />}
        </>
      )}
    </div>
  );
};