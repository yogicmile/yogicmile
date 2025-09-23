import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import PhaseJourney from "./pages/PhaseJourney";
import CoinsHistory from "./pages/CoinsHistory";
import { WalletPage } from "./pages/WalletPage";
import { RewardsPage } from "./pages/RewardsPage";
import { ProfilePage } from "./pages/ProfilePage";
import CalculationReview from "./pages/CalculationReview";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WelcomePage from "./pages/WelcomePage";
import NotFound from "./pages/NotFound";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminAdsCoupons } from "./pages/admin/AdminAdsCoupons";
import { AdminRewards } from "./pages/admin/AdminRewards";
import { AdminModeration } from "./pages/admin/AdminModeration";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminSettings } from "./pages/admin/AdminSettings";
import { SettingsPage } from "./pages/SettingsPage";
import { AchievementsPage } from "./pages/AchievementsPage"; 
import { GoalsPage } from "./pages/GoalsPage";
import { ReferralPage } from "./pages/ReferralPage";
import { AdminPerformance } from "./pages/admin/AdminPerformance";
import { SpinWheelPage } from "./pages/SpinWheelPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CommunityTestPage } from "./pages/CommunityTestPage";
import { ChallengesPage } from "./pages/ChallengesPage";
import { HelpPage } from "./pages/HelpPage";

const LazyGamificationTestPage = lazy(() => import('./pages/GamificationTestPage'));
const LazyNotificationTestPage = lazy(() => import('./pages/NotificationTestPage'));

const LazySpinWheelPage = lazy(() => import("./pages/SpinWheelPage").then(m => ({ default: m.SpinWheelPage })));
const LazyStepTrackingTestPage = lazy(() => import('./pages/StepTrackingTestPage'));
const LazyPhaseTestingPage = lazy(() => import('./pages/PhaseTestingPage'));
const LazyWalletTestPage = lazy(() => import('./pages/WalletTestPage').then(m => ({ default: m.WalletTestPage })));
const LazyRewardsTestPage = lazy(() => import('./pages/RewardsTestPage').then(m => ({ default: m.RewardsTestPage })));
const LazySpinWheelTestPage = lazy(() => import('./pages/SpinWheelTestPage').then(m => ({ default: m.SpinWheelTestPage })));
const LazyLocationTestPage = lazy(() => import('./pages/LocationTestPage').then(m => ({ default: m.LocationTestPage })));
const LazyReferralTestPage = lazy(() => import('./pages/ReferralTestPage').then(m => ({ default: m.ReferralTestPage })));
const LazySupportTestPage = lazy(() => import('./pages/SupportTestPage').then(m => ({ default: m.SupportTestPage })));
const LazyAdminTestPage = lazy(() => import('./pages/admin/AdminTestPage').then(m => ({ default: m.AdminTestPage })));
const LazySecurityTestPage = lazy(() => import('./pages/SecurityTestPage').then(m => ({ default: m.SecurityTestPage })));
const LazyPerformanceTestPage = lazy(() => import('./pages/PerformanceTestPage').then(m => ({ default: m.PerformanceTestPage })));
const LazyIntegrationTestPage = lazy(() => import('./pages/IntegrationTestPage').then(m => ({ default: m.IntegrationTestPage })));
const LazyUXTestPage = lazy(() => import('./pages/UXTestPage'));
const LazyAccessibilityTestPage = lazy(() => import('./pages/AccessibilityTestPage'));
const LazyCrossPlatformTestPage = lazy(() => import('./pages/CrossPlatformTestPage'));
const LazyBusinessLogicTestPage = lazy(() => import('./pages/BusinessLogicTestPage'));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="ads" element={<AdminAdsCoupons />} />
                <Route path="rewards" element={<AdminRewards />} />
                <Route path="moderation" element={<AdminModeration />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="performance" element={<AdminPerformance />} />
                <Route path="testing" element={<Suspense fallback={null}><LazyAdminTestPage /></Suspense>} />
              </Route>
              
              {/* Main App Routes */}
              <Route path="/*" element={
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
                      <Route path="community-test" element={<CommunityTestPage />} />
                      <Route path="coins-history" element={<CoinsHistory />} />
                      <Route path="phase-journey" element={<PhaseJourney />} />
                      <Route path="spin-wheel" element={<Suspense fallback={null}><LazySpinWheelPage /></Suspense>} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="achievements" element={<AchievementsPage />} />
                      <Route path="goals" element={<GoalsPage />} />
                      <Route path="referral" element={<ReferralPage />} />
                      <Route path="help" element={<HelpPage />} />
                      <Route path="support-testing" element={<Suspense fallback={null}><LazySupportTestPage /></Suspense>} />
                      <Route path="calculation-review" element={<CalculationReview />} />
                      <Route path="step-tracking-test" element={<Suspense fallback={null}><LazyStepTrackingTestPage /></Suspense>} />
                      <Route path="phase-testing" element={<Suspense fallback={null}><LazyPhaseTestingPage /></Suspense>} />
                      <Route path="wallet-testing" element={<Suspense fallback={null}><LazyWalletTestPage /></Suspense>} />
                      <Route path="rewards-testing" element={<Suspense fallback={null}><LazyRewardsTestPage /></Suspense>} />
                      <Route path="spin-wheel-testing" element={<Suspense fallback={null}><LazySpinWheelTestPage /></Suspense>} />
                      <Route path="location-testing" element={<Suspense fallback={null}><LazyLocationTestPage /></Suspense>} />
                      <Route path="referral-testing" element={<Suspense fallback={null}><LazyReferralTestPage /></Suspense>} />
                      <Route path="gamification-test" element={<Suspense fallback={null}><LazyGamificationTestPage /></Suspense>} />
                      <Route path="notification-test" element={<Suspense fallback={null}><LazyNotificationTestPage /></Suspense>} />
                      <Route path="security-tests" element={<Suspense fallback={null}><LazySecurityTestPage /></Suspense>} />
                      <Route path="performance-tests" element={<Suspense fallback={null}><LazyPerformanceTestPage /></Suspense>} />
                      <Route path="integration-tests" element={<Suspense fallback={null}><LazyIntegrationTestPage /></Suspense>} />
                      <Route path="ux-testing" element={<Suspense fallback={null}><LazyUXTestPage /></Suspense>} />
                      <Route path="accessibility-testing" element={<Suspense fallback={null}><LazyAccessibilityTestPage /></Suspense>} />
                      <Route path="cross-platform-testing" element={<Suspense fallback={null}><LazyCrossPlatformTestPage /></Suspense>} />
                      <Route path="business-logic-testing" element={<Suspense fallback={null}><LazyBusinessLogicTestPage /></Suspense>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </AuthGuard>
              } />
            </Routes>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
