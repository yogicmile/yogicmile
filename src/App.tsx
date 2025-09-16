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
                {/* Additional admin routes will be added here */}
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
                      <Route path="coins-history" element={<CoinsHistory />} />
                      <Route path="phase-journey" element={<PhaseJourney />} />
                      <Route path="calculation-review" element={<CalculationReview />} />
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
