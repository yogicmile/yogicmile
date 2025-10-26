import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/LoadingStates';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/welcome', '/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    const authOnlyRoutes = ['/profile', '/wallet', '/rewards', '/settings', '/community', '/challenges'];
    const isAuthOnlyRoute = authOnlyRoutes.includes(location.pathname);

    // Authenticated users shouldn't see public auth pages
    if (user && isPublicRoute) {
      navigate('/');
      return;
    }

    // Unauthenticated users cannot access protected routes
    if (!user && isAuthOnlyRoute) {
      navigate('/welcome');
      return;
    }
  }, [user, isLoading, location.pathname, navigate]);

  // Show loading while determining auth state
  if (isLoading) {
    return <PageLoading />;
  }

  return <>{children}</>;
};