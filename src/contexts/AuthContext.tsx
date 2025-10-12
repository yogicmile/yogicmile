import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
    const processRedirectParams = async () => {
      try {
        // 1) Hash tokens: #access_token=...&refresh_token=...
        const rawHash = window.location.hash || '';
        const hash = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            setIsLoading(true);
            const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (!error && data?.session) {
              setSession(data.session);
              setUser(data.session.user);
              setIsGuest(false);
              localStorage.removeItem('yogic_mile_guest_mode');
              // Clean the URL
              const { origin, pathname, search } = window.location;
              window.history.replaceState({}, document.title, origin + pathname + search);
              return; // Done
            }
          }
        }

        // 2) Code param: ?code=... (Supabase can use code exchange flow)
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          setIsLoading(true);
          try {
            const authAny = supabase.auth as any;
            const { data, error } = await authAny.exchangeCodeForSession({ code });
            if (!error && data?.session) {
              setSession(data.session);
              setUser(data.session.user);
              setIsGuest(false);
              localStorage.removeItem('yogic_mile_guest_mode');
            }
          } catch (err) {
            console.error('exchangeCodeForSession failed:', err);
          } finally {
            // Clean code param from URL
            url.searchParams.delete('code');
            url.searchParams.delete('type');
            window.history.replaceState({}, document.title, url.toString());
          }
        }
      } catch (e) {
        console.error('Auth redirect processing failed:', e);
      }
    };

    // Initialize: first try to process redirect tokens, then read existing session
    (async () => {
      await processRedirectParams();
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session) {
        setIsGuest(false);
        localStorage.removeItem('yogic_mile_guest_mode');
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (formData: SignUpData) => {
    setIsLoading(true);
    try {
      let authResult;
      
      // Always use Supabase authentication - no custom users table approach
      if (formData.email && formData.password) {
        // Email/password signup
        const redirectUrl = `${window.location.origin}/`;
        
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};