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
    // Check for guest mode in localStorage
    const guestMode = localStorage.getItem('yogic_mile_guest_mode');
    if (guestMode === 'true') {
      setIsGuest(true);
      setIsLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        if (event === 'SIGNED_IN') {
          setIsGuest(false);
          localStorage.removeItem('yogic_mile_guest_mode');
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (formData: SignUpData) => {
    setIsLoading(true);
    try {
      // Check if user exists in our custom users table by mobile number
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('mobile_number', formData.mobileNumber)
        .single();

      if (existingUser) {
        toast({
          title: "User already exists",
          description: "A user with this mobile number already exists. Please try logging in.",
          variant: "destructive",
        });
        return { error: { message: "User already exists" } };
      }

      let authError = null;
      let authUser = null;

      // If email and password provided, create Supabase auth user
      if (formData.email && formData.password) {
        const redirectUrl = `${window.location.origin}/`;
        
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: formData.fullName,
              mobile_number: formData.mobileNumber
            }
          }
        });
        
        authError = error;
        authUser = data.user;
      } else {
        // Create a temporary user ID for mobile-only users
        authUser = { id: crypto.randomUUID() } as User;
      }

      if (authError) {
        toast({
          title: "Sign up failed",
          description: authError.message,
          variant: "destructive",
        });
        return { error: authError };
      }

      // Store user data in our custom users table
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authUser!.id,
          mobile_number: formData.mobileNumber,
          email: formData.email || null,
          full_name: formData.fullName,
          password_hash: formData.password ? 'hashed_by_supabase' : null,
          address: formData.address,
          age: formData.age || null,
          gender: formData.gender || null,
          referred_by: formData.referralCode || null,
          referral_code: formData.mobileNumber // Mobile number acts as referral code
        });

      if (dbError) {
        toast({
          title: "Registration failed",
          description: dbError.message,
          variant: "destructive",
        });
        return { error: dbError };
      }

      toast({
        title: "Registration successful!",
        description: formData.email && formData.password 
          ? "Please check your email for verification." 
          : "You can now log in with your mobile number.",
      });

      return { error: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (mobileNumber: string, password?: string, otp?: string) => {
    setIsLoading(true);
    try {
      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('mobile_number', mobileNumber)
        .single();

      if (userError || !userData) {
        toast({
          title: "User not found",
          description: "No account found with this mobile number. Please sign up first.",
          variant: "destructive",
        });
        return { error: { message: "User not found" } };
      }

      if (otp) {
        // OTP-based login
        const { data: isValid } = await supabase.rpc('verify_otp', {
          p_mobile_number: mobileNumber,
          p_otp: otp
        });

        if (!isValid) {
          toast({
            title: "Invalid OTP",
            description: "The OTP you entered is invalid or has expired.",
            variant: "destructive",
          });
          return { error: { message: "Invalid OTP" } };
        }

        // SECURITY FIX: This is a temporary workaround 
        // TODO: Implement proper Supabase phone authentication
        // For now, we'll use the existing flow but without fake sessions
        
        // The user has been verified via OTP, but we need proper Supabase auth
        // This should be replaced with actual phone auth when implemented
        toast({
          title: "OTP Verified Successfully",
          description: "Please implement proper authentication for production use.",
          variant: "default",
        });
        
        // For demo purposes, allow the user to proceed
        // but do not set fake session data
        return { error: null };
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in with OTP.",
        });
        
        return { error: null };
      } else if (password && userData.email) {
        // Email/password login through Supabase Auth
        const { error } = await supabase.auth.signInWithPassword({
          email: userData.email,
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
      // Get client info for security logging
      const clientIP = null; // Browser doesn't expose real IP
      const userAgent = navigator.userAgent;

      const { data, error } = await supabase.rpc('generate_otp_with_rate_limit', {
        p_mobile_number: mobileNumber,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      });

      if (error) {
        toast({
          title: "Failed to send OTP",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      const response = data as { success: boolean; error?: string; message?: string };

      if (!response.success) {
        toast({
          title: "Failed to send OTP",
          description: response.error,
          variant: "destructive",
        });
        return { error: { message: response.error } };
      }

      toast({
        title: "OTP sent successfully",
        description: response.message || "Please check your SMS for the OTP code.",
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
      // Get client info for security logging
      const clientIP = null; // Browser doesn't expose real IP
      const userAgent = navigator.userAgent;

      const { data, error } = await supabase.rpc('verify_otp_with_audit', {
        p_mobile_number: mobileNumber,
        p_otp: otp,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      });

      if (error) {
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      const response = data as { success: boolean; error?: string; verified?: boolean };

      if (!response.success) {
        toast({
          title: "Invalid OTP",
          description: response.error || "The OTP you entered is invalid or has expired.",
          variant: "destructive",
        });
        return { error: { message: response.error || "Invalid OTP" } };
      }

      toast({
        title: "OTP verified successfully",
        description: "You can now access your account.",
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