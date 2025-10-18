import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AppLayout } from "@/components/AppLayout";
import { FirstTimePermissionFlow } from "@/components/onboarding/FirstTimePermissionFlow";
import { permissionManager } from "@/services/PermissionManager";
import Index from "./pages/Index";
import { WalletPage } from "./pages/WalletPage";
import { RewardsPage } from "./pages/RewardsPage";
import { ProfilePage } from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WelcomePage from "./pages/WelcomePage";
import NotFound from "./pages/NotFound";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpPage } from "./pages/HelpPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { CommunityPage } from "./pages/CommunityPage";

const queryClient = new QueryClient();

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    const completed = await permissionManager.hasCompletedOnboarding();
    setIsFirstLaunch(!completed);
  };

  const handleOnboardingComplete = () => {
    setIsFirstLaunch(false);
  };

  // Show permission flow on first launch
  if (isFirstLaunch === true) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <FirstTimePermissionFlow onComplete={handleOnboardingComplete} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show loading state while checking
  if (isFirstLaunch === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground font-semibold">Loading...</div>
      </div>
    );
  }

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
                  <Route path="" element={<Index />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="wallet" element={<WalletPage />} />
                  <Route path="rewards" element={<RewardsPage />} />
                  <Route path="challenges" element={<ChallengesPage />} />
                  <Route path="community" element={<CommunityPage />} />
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
