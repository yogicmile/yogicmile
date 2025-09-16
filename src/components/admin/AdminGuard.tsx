import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isLoading, isAdmin, role } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if still loading
    if (isLoading) return;

    // Wait for role resolution on protected admin pages (avoid premature redirects)
    const onAdminProtected = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
    if (onAdminProtected && user && role === null) {
      return; // keep showing verifying state until role fetched
    }

    // Special handling for admin login page
    if (location.pathname === '/admin/login') {
      // If already authenticated as admin, redirect to dashboard
      if (user && isAdmin) {
        navigate('/admin');
      }
      return;
    }

    // If no user, redirect to admin login
    if (!user) {
      navigate('/admin/login');
      return;
    }

    // If user exists but is not admin and trying to access protected admin pages, redirect to main app
    if (user && !isAdmin) {
      navigate('/');
      return;
    }

  }, [user, isAdmin, isLoading, location.pathname, navigate]);

  // Show loading while determining auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show loading if user exists but role check is pending (except on login page)
  if (user && !role && location.pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // If user is not admin and not on the admin login page, show access denied
  if (user && !isAdmin && location.pathname !== '/admin/login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin panel.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Return to main app
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};