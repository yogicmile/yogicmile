import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { guestDataManager } from '@/services/GuestDataManager';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isGuest: boolean;
  signUp: (formData: SignUpData) => Promise<{ error: any }>;
  signIn: (mobileNumber: string, password?: string, otp?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  generateOTP: (mobileNumber: string) => Promise<{ error: any; otp?: string }>;
  verifyOTP: (mobileNumber: string, otp: string) => Promise<{ error: any }>;
  migrateGuestData: () => Promise<boolean>;
}

interface SignUpData {
  fullName: string;
  mobileNumber: string;
  email?: string;
  password?: string;
  address: string;
  age?: number;
  gender?: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Handle deep link authentication on mobile FIRST
    if (Capacitor.isNativePlatform()) {
      const handleDeepLink = async (url: string) => {
        console.log('[AuthContext] Deep link received:', url);
        
        // Check if it's an auth callback
        if (url.includes('yogicmile://auth-callback')) {
          try {
            // Extract the URL fragment containing auth tokens
            const parsedUrl = new URL(url);
            const fragment = parsedUrl.hash;
            
            if (fragment) {
              // Parse the fragment to get access_token and refresh_token
              const params = new URLSearchParams(fragment.substring(1));
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token');
              
              if (accessToken) {
                console.log('[AuthContext] Setting session from deep link');
                const { data: sessionData, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken || '',
                });
                
                if (error) {
                  console.error('[AuthContext] Deep link auth error:', error);
                } else {
                  console.log('[AuthContext] Deep link auth success');
                  setSession(sessionData.session);
                  setUser(sessionData.session?.user ?? null);
                  setIsGuest(false);
                  localStorage.removeItem('yogic_mile_guest_mode');
                }
              }
            }
          } catch (error) {
            console.error('[AuthContext] Deep link parsing error:', error);
          }
        }
      };
      
      // Listen for app URL open events
      CapacitorApp.addListener('appUrlOpen', async (data: any) => {
        await handleDeepLink(data.url);
      });
    }
    
    // Read guest mode flag but DO NOT early return; always initialize Supabase auth
    const guestMode = localStorage.getItem('yogic_mile_guest_mode') === 'true';
    setIsGuest(guestMode);

    // Set up auth state listener FIRST (sync only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          setIsGuest(false);
          localStorage.removeItem('yogic_mile_guest_mode');
        }
        if (event === 'SIGNED_OUT') {
          // Preserve guest mode if user explicitly enabled it earlier
          if (guestMode) setIsGuest(true);
        }
      }
    );

    // Process redirect params from magic link (hash tokens or code param)
    // Returns true if redirect was handled, false otherwise
    const processRedirectParams = async (): Promise<boolean> => {
      try {
        // 1) Hash tokens: #access_token=...&refresh_token=...
        const rawHash = window.location.hash || '';
        const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (!error && data?.session) {
              setSession(data.session);
              setUser(data.session.user);
              setIsGuest(false);
              localStorage.removeItem('yogic_mile_guest_mode');
              // Clean the URL
              const { origin, pathname, search } = window.location;
              window.history.replaceState({}, document.title, origin + pathname + search);
              return true; // Redirect handled
            }
          }
        }

        // 2) Code param: ?code=... (Supabase can use code exchange flow)
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          try {
            const authAny = supabase.auth as any;
            const { data, error } = await authAny.exchangeCodeForSession({ code });
            if (!error && data?.session) {
              setSession(data.session);
              setUser(data.session.user);
              setIsGuest(false);
              localStorage.removeItem('yogic_mile_guest_mode');
              // Clean code param from URL
              url.searchParams.delete('code');
              url.searchParams.delete('type');
              window.history.replaceState({}, document.title, url.toString());
              return true; // Redirect handled
            }
          } catch (err) {
            console.error('exchangeCodeForSession failed:', err);
          } finally {
            // Clean code param from URL even if exchange failed
            url.searchParams.delete('code');
            url.searchParams.delete('type');
            window.history.replaceState({}, document.title, url.toString());
          }
        }
      } catch (e) {
        console.error('Auth redirect processing failed:', e);
      }
      return false; // No redirect handled
    };

    // Initialize: first try to process redirect tokens, then read existing session
    (async () => {
      const redirectHandled = await processRedirectParams();
      
      // Only get session if we didn't just process a redirect
      if (!redirectHandled) {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session) {
          setIsGuest(false);
          localStorage.removeItem('yogic_mile_guest_mode');
        }
      }
      
      // Always set loading to false at the end, only once
      setIsLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, []);

  // Listen for app state changes on native platforms (when user returns from browser)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      let listenerHandle: any;
      
      const setupListener = async () => {
        listenerHandle = await CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
          if (isActive) {
            // App came to foreground - check if session was established
            const { data: { session } } = await supabase.auth.getSession();
            if (session && !user) {
              setSession(session);
              setUser(session.user);
              setIsGuest(false);
              localStorage.removeItem('yogic_mile_guest_mode');
            }
          }
        });
      };
      
      setupListener();
      
      return () => {
        if (listenerHandle) {
          listenerHandle.remove();
        }
      };
    }
  }, [user]);

  const signUp = async (formData: SignUpData) => {
    setIsLoading(true);
    try {
      let authResult;
      
      // Get redirect URL based on platform
      const getRedirectUrl = () => {
        if (Capacitor.isNativePlatform()) {
          return 'yogicmile://auth-callback';
        }
        return `${window.location.origin}/`;
      };
      
      // Always use Supabase authentication - no custom users table approach
      if (formData.email && formData.password) {
        // Email/password signup
        const redirectUrl = getRedirectUrl();
        
        authResult = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName,
              mobile_number: formData.mobileNumber,
              address: formData.address,
              age: formData.age,
              gender: formData.gender,
              referral_code: formData.referralCode
            }
          }
        });
      } else {
        // Mobile-only signup - use phone authentication
        const formattedNumber = formData.mobileNumber.startsWith('+91') 
          ? formData.mobileNumber 
          : `+91${formData.mobileNumber}`;
          
        authResult = await supabase.auth.signInWithOtp({
          phone: formattedNumber,
          options: {
            shouldCreateUser: true,
            data: {
              full_name: formData.fullName,
              address: formData.address,
              age: formData.age,
              gender: formData.gender,
              referral_code: formData.referralCode
            }
          }
        });
      }

      if (authResult.error) {
        toast({
          title: "Sign up failed",
          description: authResult.error.message,
          variant: "destructive",
        });
        return { error: authResult.error };
      }

      toast({
        title: "Registration successful!",
        description: formData.email && formData.password 
          ? "Please check your email for verification." 
          : "Please check your SMS for the OTP to complete registration.",
      });

      return { error: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (mobileNumber: string, password?: string, otp?: string) => {
    setIsLoading(true);
    try {
      if (otp) {
        // Phone/OTP authentication
        const formattedNumber = mobileNumber.startsWith('+91') 
          ? mobileNumber 
          : `+91${mobileNumber}`;
          
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedNumber,
          token: otp,
          type: 'sms'
        });

        if (error) {
          toast({
            title: "Invalid OTP",
            description: "The OTP you entered is invalid or has expired.",
            variant: "destructive",
          });
          return { error };
        }

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in with OTP.",
        });
        
        return { error: null };
      } else if (password) {
        // For password login, we need an email. Check if user provided email format
        const isEmail = mobileNumber.includes('@');
        
        if (!isEmail) {
          toast({
            title: "Password login requires email",
            description: "Please use your email address for password login, or use OTP with your mobile number.",
            variant: "destructive",
          });
          return { error: { message: "Email required for password login" } };
        }
        
        // Email/password login through Supabase Auth
        const { error } = await supabase.auth.signInWithPassword({
          email: mobileNumber, // This is actually an email in this case
          password,
        });

        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
          return { error };
        }

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        
        return { error: null };
      } else {
        toast({
          title: "Invalid login method",
          description: "Please provide either password or OTP for login.",
          variant: "destructive",
        });
        return { error: { message: "Invalid login method" } };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateOTP = async (mobileNumber: string) => {
    try {
      const formattedNumber = mobileNumber.startsWith('+91') 
        ? mobileNumber 
        : `+91${mobileNumber}`;
        
      // Use Supabase's native phone authentication
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedNumber,
        options: {
          shouldCreateUser: true
        }
      });

      if (error) {
        toast({
          title: "Failed to send OTP",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "OTP sent successfully",
        description: "Please check your SMS for the OTP code.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Failed to send OTP", 
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const verifyOTP = async (mobileNumber: string, otp: string) => {
    try {
      const formattedNumber = mobileNumber.startsWith('+91') 
        ? mobileNumber 
        : `+91${mobileNumber}`;
        
      // Use Supabase's native OTP verification
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedNumber,
        token: otp,
        type: 'sms'
      });

      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "OTP verified successfully",
        description: "Welcome to Yogic Mile!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsGuest(false);
    localStorage.removeItem('yogic_mile_guest_mode');
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    localStorage.setItem('yogic_mile_guest_mode', 'true');
    toast({
      title: "Guest Mode",
      description: "You're now using the app as a guest. Sign up to save your progress!",
    });
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem('yogic_mile_guest_mode');
  };

  const migrateGuestData = async (): Promise<boolean> => {
    if (!user) return false;
    if (!guestDataManager.hasGuestData()) return false;

    try {
      const guestData = guestDataManager.getAllGuestData();
      
      // Migrate wallet data
      if (guestData.wallet.totalEarned > 0) {
        const { error: walletError } = await supabase
          .from('wallet_balances')
          .upsert({
            user_id: user.id,
            total_balance: guestData.wallet.balance,
            total_earned: guestData.wallet.totalEarned,
            updated_at: new Date().toISOString()
          });
        if (walletError) console.error('Wallet migration error:', walletError);
      }

      // Migrate daily steps
      for (const stepData of guestData.steps) {
        const { error: stepsError } = await supabase
          .from('daily_steps')
          .upsert({
            user_id: user.id,
            date: stepData.date,
            steps: stepData.steps,
            paisa_earned: stepData.coins,
            phase_id: stepData.phase,
            capped_steps: stepData.steps,
            units_earned: stepData.coins
          });
        if (stepsError) console.error('Steps migration error:', stepsError);
      }

      // Migrate phase data
      const { error: phaseError } = await supabase
        .from('user_phases')
        .upsert({
          user_id: user.id,
          current_phase: guestData.phase.currentPhase,
          total_steps: guestData.phase.totalSteps
        });
      if (phaseError) console.error('Phase migration error:', phaseError);

      // Clear guest data after successful migration
      guestDataManager.clearAllGuestData();
      
      toast({
        title: "Progress saved! 🎉",
        description: "Your guest data has been migrated to your account",
      });
      
      return true;
    } catch (error) {
      console.error('Guest data migration failed:', error);
      return false;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isGuest,
    signUp,
    signIn,
    signOut,
    enterGuestMode,
    exitGuestMode,
    generateOTP,
    verifyOTP,
    migrateGuestData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};