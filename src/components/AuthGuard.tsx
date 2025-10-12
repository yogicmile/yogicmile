import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/LoadingStates';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading, isGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) return;

    // Public routes that don't require authentication
    const publicRoutes = ['/welcome', '/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    // Routes that ALWAYS require authenticated user (no guest access)
    const authOnlyRoutes = ['/profile', '/wallet', '/rewards', '/settings', '/community', '/challenges'];
    const isAuthOnlyRoute = authOnlyRoutes.includes(location.pathname);

    // Enforce auth on protected routes: send to login if not authenticated
    if (isAuthOnlyRoute && !user) {
      navigate('/login');
      return;
    }

    // If no user and not guest, redirect to welcome page for non-public routes
    if (!user && !isGuest && !isPublicRoute && !isAuthOnlyRoute) {
      navigate('/welcome');
      return;
    }

    // If user is authenticated and on public routes, redirect to home
    if (user && isPublicRoute) {
      navigate('/');
      return;
    }

    // If first visit (no user, no guest mode), show welcome
    if (!user && !isGuest && location.pathname === '/' && !localStorage.getItem('yogic_mile_visited')) {
      localStorage.setItem('yogic_mile_visited', 'true');
      navigate('/welcome');
      return;
    }
  }, [user, isGuest, isLoading, location.pathname, navigate]);

  // Show loading while determining auth state
  if (isLoading) {
    return <PageLoading />;
  }

  return <>{children}</>;
};