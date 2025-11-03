import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * AuthRedirectPage - Universal auth callback handler
 * 
 * This page intercepts magic link redirects from email verification
 * and redirects to the native app deep link on mobile devices.
 */
export default function AuthRedirectPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        // Extract URL fragment (contains tokens)
        const hash = window.location.hash;
        
        if (!hash) {
          console.warn('No auth tokens found in URL');
          navigate('/');
          return;
        }

        // Parse tokens from URL
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        console.log('Auth redirect received:', { type, hasAccessToken: !!accessToken });

        if (accessToken && refreshToken) {
          // Set session in Supabase as fallback for web
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // On native, redirect to deep link
          if (Capacitor.isNativePlatform()) {
            const deepLink = `yogicmile://auth-callback${hash}`;
            console.log('Redirecting to native app:', deepLink);
            
            // Attempt to open native app
            window.location.href = deepLink;
            
            // Fallback: If deep link fails after 2s, show success message
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
          } else {
            // Web: navigate to home
            navigate('/', { replace: true });
          }
        } else {
          console.error('Missing auth tokens in redirect');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth redirect error:', error);
        navigate('/login');
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Completing authentication...</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Please wait while we redirect you to the app.
        </p>
      </div>
    </div>
  );
}
