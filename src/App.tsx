import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/AuthGuard";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AuthGuard>
            <AppLayout>
              <Routes>
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/" element={<Index />} />
                <Route path="/phase-journey" element={<PhaseJourney />} />
                <Route path="/coins-history" element={<CoinsHistory />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/calculation-review" element={<CalculationReview />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </AuthGuard>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
