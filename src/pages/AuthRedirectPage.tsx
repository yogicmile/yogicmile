import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * AuthRedirectPage - Universal auth callback handler
 * 
 * Handles BOTH token flows:
 * 1. Hash flow (from PWA): #access_token=...&refresh_token=...
 * 2. Code flow (from magic links): ?code=... (Supabase requires code exchange)
 */
export default function AuthRedirectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        console.log('🔐 AuthRedirectPage: Processing auth redirect...');

        // FLOW 1: Hash tokens (direct access_token + refresh_token)
        const hash = window.location.hash;
        if (hash) {
          console.log('📍 Detected hash flow (direct tokens)');
          await handleHashFlow(hash);
          return;
        }

        // FLOW 2: Code flow (requires exchange with Supabase)
        const code = searchParams.get('code');
        if (code) {
          console.log('📍 Detected code flow (requires exchange)');
          await handleCodeFlow(code);
          return;
        }

        // FLOW 3: Error from Supabase
        const error = searchParams.get('error');
        if (error) {
          const errorDesc = searchParams.get('error_description');
          console.error('❌ Auth error from Supabase:', error, errorDesc);
          toast({
            title: 'Authentication Error',
            description: errorDesc || error,
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        // No valid auth params found
        console.warn('⚠️ No auth tokens or code found in URL');
        navigate('/');
      } catch (error) {
        console.error('🔴 Auth redirect error:', error);
        toast({
          title: 'Auth Error',
          description: 'Failed to complete authentication. Please try again.',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };

    handleAuthRedirect();
  }, [navigate, searchParams, toast]);

  /**
   * Handle direct token flow (hash-based)
   * Used by: PWA web redirects, some OAuth flows
   */
  const handleHashFlow = async (hash: string) => {
    try {
      console.log('🔑 Processing hash tokens...');

      // Parse tokens from URL fragment
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        console.error('❌ Missing tokens in hash flow');
        toast({
          title: 'Invalid Token',
          description: 'Missing access or refresh token',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      console.log('✅ Setting session from hash tokens...');

      // Set session directly
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('❌ Session set error:', sessionError.message);
        toast({
          title: 'Session Error',
          description: sessionError.message,
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      console.log('✅ Hash flow success! Session set.');
      await redirectAfterAuth();
    } catch (error) {
      console.error('🔴 Hash flow error:', error);
      throw error;
    }
  };

  /**
   * Handle code exchange flow
   * Used by: Magic links, email verification links
   * Supabase returns code parameter instead of tokens directly
   */
  const handleCodeFlow = async (code: string) => {
    try {
      console.log('🔐 Exchanging code for session...');

      // Exchange code for session (Supabase backend validates)
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('❌ Code exchange failed:', exchangeError.message);
        
        // Common errors
        if (exchangeError.message.includes('signature')) {
          toast({
            title: 'Invalid Token',
            description: 'The link has expired or is invalid. Please request a new one.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Authentication Failed',
            description: exchangeError.message,
            variant: 'destructive',
          });
        }
        
        navigate('/login');
        return;
      }

      if (!data.session) {
        console.error('❌ No session returned from code exchange');
        toast({
          title: 'Authentication Error',
          description: 'Failed to create session',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      console.log('✅ Code exchange success! Session created.');
      await redirectAfterAuth();
    } catch (error) {
      console.error('🔴 Code flow error:', error);
      throw error;
    }
  };

  /**
   * Redirect to appropriate location after successful auth
   */
  const redirectAfterAuth = async () => {
    try {
      // On native platform, attempt deep link
      if (Capacitor.isNativePlatform()) {
        console.log('📱 Native platform detected, attempting deep link...');
        
        const deepLink = 'yogicmile://auth-success';
        console.log('Redirecting to:', deepLink);
        
        window.location.href = deepLink;

        // Fallback: if deep link fails after 2s, navigate in browser
        setTimeout(() => {
          console.log('⏱️ Deep link timeout, falling back to browser navigation');
          navigate('/', { replace: true });
        }, 2000);
      } else {
        // Web: navigate directly
        console.log('🌐 Web platform, navigating to home...');
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('🔴 Redirect error:', error);
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Completing Authentication</h2>
          <p className="text-muted-foreground">Please wait while we redirect you to the app...</p>
        </div>

        {/* Debug info (remove in production) */}
        <div className="mt-8 text-xs text-muted-foreground bg-muted p-3 rounded max-w-xs">
          <p>URL Params:</p>
          <code className="text-left break-all">
            {window.location.hash || window.location.search || 'No params'}
          </code>
        </div>
      </div>
    </div>
  );
}
