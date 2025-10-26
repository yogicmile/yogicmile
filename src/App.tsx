
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AppLayout } from "@/components/AppLayout";
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
  // Onboarding flow is handled within WelcomePage to avoid race conditions


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
