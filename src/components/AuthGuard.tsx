import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/LoadingStates';
import { permissionManager } from '@/services/PermissionManager';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = () => {
      const completed = permissionManager.hasCompletedPermissions();
      setOnboardingComplete(completed);
      setCheckingOnboarding(false);
    };
    
    checkOnboarding();
  }, []);

  useEffect(() => {
    // Wait for both auth and onboarding checks to complete
    if (authLoading || checkingOnboarding) return;

    const publicRoutes = ['/permissions', '/welcome', '/login', '/signup', '/auth/redirect'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    const authOnlyRoutes = ['/profile', '/wallet', '/rewards', '/settings', '/community', '/challenges'];
    const isAuthOnlyRoute = authOnlyRoutes.includes(location.pathname);
    
    const isRootRoute = location.pathname === '/';

    // RULE 1: Authenticated users always have access (skip onboarding check)
    if (user) {
      // Authenticated users shouldn't see welcome/login/signup pages
      if (isPublicRoute && location.pathname !== '/auth/redirect') {
        navigate('/');
        return;
      }
      // Authenticated users can access any route
      return;
    }

    // RULE 2: For unauthenticated users, check onboarding status
    // If onboarding not complete AND trying to access any route except /permissions
    if (!onboardingComplete && !isPublicRoute) {
      console.log('[AuthGuard] Onboarding not complete, redirecting to /permissions');
      navigate('/permissions');
      return;
    }

    // RULE 3: If onboarding complete but not authenticated
    // - Allow access to public routes
    // - Block access to auth-only routes → redirect to /welcome
    if (onboardingComplete && !user) {
      if (isAuthOnlyRoute || isRootRoute) {
        console.log('[AuthGuard] Not authenticated, redirecting to /welcome');
        navigate('/welcome');
        return;
      }
    }
  }, [user, authLoading, checkingOnboarding, onboardingComplete, location.pathname, navigate]);

  // Show loading while checking auth or onboarding
  if (authLoading || checkingOnboarding) {
    return <PageLoading />;
  }

  return <>{children}</>;
};