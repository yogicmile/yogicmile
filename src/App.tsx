import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AppLayout } from "@/components/AppLayout";
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { permissionManager } from '@/services/PermissionManager';
import Index from "./pages/Index";
import { WalletPage } from "./pages/WalletPage";
import { RewardsPage } from "./pages/RewardsPage";
import { ProfilePage } from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WelcomePage from "./pages/WelcomePage";
import AuthRedirectPage from "./pages/AuthRedirectPage";
import NotFound from "./pages/NotFound";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpPage } from "./pages/HelpPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { CommunityPage } from "./pages/CommunityPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AchievementsGalleryPage from "./pages/AchievementsGalleryPage";
import ReferralDashboardPage from "./pages/ReferralDashboardPage";

const queryClient = new QueryClient();

const App = () => {
  // Onboarding flow is handled within WelcomePage to avoid race conditions

  useEffect(() => {
    // Only monitor on native platforms (Android/iOS)
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      console.log('🌐 Web platform detected - skipping background service monitor');
      return;
    }

    console.log('📱 Starting background service monitor on', platform);
    
    let isRestarting = false; // Prevent multiple simultaneous restart attempts
    
    // Monitor background service every 60 seconds
    const serviceMonitor = setInterval(async () => {
      try {
        const isTrackingEnabled = localStorage.getItem('background_tracking_enabled');
        
        if (isTrackingEnabled === 'true') {
          const isServiceActive = localStorage.getItem('background_service_active');
          const lastStarted = localStorage.getItem('service_last_started');
          
          console.log('🔍 Service check:', {
            enabled: isTrackingEnabled,
            active: isServiceActive,
            lastStarted: lastStarted
          });
          
          if (isServiceActive !== 'true' && !isRestarting) {
            console.warn('⚠️ Background service appears stopped. Attempting restart...');
            
            isRestarting = true; // Lock to prevent multiple restarts
            
            try {
              // Try to restart service
              const result = await permissionManager.startForegroundService();
              
              if (result.success) {
                console.log('✅ Service restarted successfully:', result.message);
              } else {
                console.error('❌ Failed to restart service:', result.message);
              }
            } finally {
              // Release lock after 5 seconds
              setTimeout(() => {
                isRestarting = false;
              }, 5000);
            }
          } else if (isServiceActive === 'true') {
            console.log('✅ Background service is active');
          }
        } else {
          console.log('ℹ️ Background tracking not enabled by user');
        }
      } catch (error) {
        console.error('❌ Service monitor error:', error);
        isRestarting = false; // Reset lock on error
      }
    }, 60000); // Check every 60 seconds

    // Cleanup interval when component unmounts
    return () => {
      console.log('🛑 Stopping background service monitor');
      if (serviceMonitor) {
        clearInterval(serviceMonitor);
      }
    };
  }, []);

  useEffect(() => {
    // Only add listener on native platforms
    const platform = Capacitor.getPlatform();
    if (platform === 'web') {
      console.log('🌐 Web platform - skipping app resume listener');
      return;
    }

    console.log('📱 Setting up app resume listener on', platform);

    let cleanupListener: (() => void) | null = null;

    // Listen for app becoming active (resume from background)
    const setupListener = async () => {
      const resumeListener = await CapacitorApp.addListener('appStateChange', async (state) => {
        if (state.isActive) {
          console.log('📱 App resumed. Refreshing permissions...');
          
          try {
            // Force refresh permissions (ignore cache)
            const status = await permissionManager.checkAllPermissions(true);
            
            console.log('✅ Current permissions refreshed:', status);
            
            // Dispatch custom event so UI components can update
            window.dispatchEvent(new CustomEvent('permissionsUpdated', { 
              detail: status 
            }));
          } catch (error) {
            console.error('❌ Error refreshing permissions:', error);
          }
        } else {
          console.log('📱 App went to background');
        }
      });

      cleanupListener = () => resumeListener.remove();
    };

    setupListener();

    // Cleanup listener when component unmounts
    return () => {
      console.log('🛑 Removing app resume listener');
      if (cleanupListener) {
        cleanupListener();
      }
    };
  }, []);

  // Normal app flow
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <BrowserRouter>
          <AuthProvider>
            <AuthGuard>
              <AppLayout>
                <Routes>
                  <Route path="welcome" element={<WelcomePage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                  <Route path="auth/redirect" element={<AuthRedirectPage />} />
                  <Route path="" element={<Index />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="wallet" element={<WalletPage />} />
                  <Route path="rewards" element={<RewardsPage />} />
                  <Route path="challenges" element={<ChallengesPage />} />
                  <Route path="community" element={<CommunityPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="achievements" element={<AchievementsGalleryPage />} />
                  <Route path="referrals" element={<ReferralDashboardPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="help" element={<HelpPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </AuthGuard>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
