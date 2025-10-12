import { useState, useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MobileAuthState {
  isLoading: boolean;
  otpSent: boolean;
  otpResendTimer: number;
  canResend: boolean;
  biometricEnabled: boolean;
  sessionSecure: boolean;
  failedAttempts: number;
}

export interface SignUpFormData {
  mobileNumber: string;
  authChoice: 'password' | 'otp';
  password?: string;
  email?: string;
  address: {
    city: string;
    district: string;
    state: string;
    country: string;
  };
  fullName: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  referralCode?: string;
}

const OTP_RESEND_INTERVAL = 30; // seconds
const MAX_OTP_ATTEMPTS = 3;
const SECURE_STORAGE_KEY = 'mobile-auth-session';

export const useMobileAuth = () => {
  const { toast } = useToast();
  const [state, setState] = useState<MobileAuthState>({
    isLoading: false,
    otpSent: false,
    otpResendTimer: 0,
    canResend: true,
    biometricEnabled: false,
    sessionSecure: false,
    failedAttempts: 0,
  });

  const resendInterval = useRef<NodeJS.Timeout | null>(null);
  const otpAttempts = useRef(0);

  useEffect(() => {
    checkSecureSession();
    setupNotificationPermissions();
    
    return () => {
      if (resendInterval.current) {
        clearInterval(resendInterval.current);
      }
    };
  }, []);

  const checkSecureSession = async () => {
    try {
      const { value } = await Preferences.get({ key: SECURE_STORAGE_KEY });
      if (value) {
        const session = JSON.parse(value);
        // Validate session expiry and integrity
        if (session.expiresAt > Date.now()) {
          setState(prev => ({ ...prev, sessionSecure: true }));
        }
      }
    } catch (error) {
      console.error('Failed to check secure session:', error);
    }
  };

  const setupNotificationPermissions = async () => {
    try {
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.error('Notification permission failed:', error);
    }
  };

  const formatMobileNumber = (mobile: string): string => {
    // Remove all non-digits
    const digits = mobile.replace(/\D/g, '');
    
    // Add +91 prefix if not present and number is 10 digits
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    
    // If already has country code
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits}`;
    }
    
    return digits;
  };

  const validateMobileNumber = (mobile: string): boolean => {
    const formatted = formatMobileNumber(mobile);
    const phoneRegex = /^\+91[6-9]\d{9}$/;
    return phoneRegex.test(formatted);
  };

  const validateSignUpForm = (formData: SignUpFormData): string[] => {
    const errors: string[] = [];
    
    if (!validateMobileNumber(formData.mobileNumber)) {
      errors.push('Invalid mobile number format');
    }
    
    if (!formData.fullName.trim()) {
      errors.push('Full name is required');
    }
    
    if (!formData.address.city.trim()) {
      errors.push('City is required');
    }
    
    if (!formData.address.district.trim()) {
      errors.push('District is required');
    }
    
    if (!formData.address.state.trim()) {
      errors.push('State is required');
    }
    
    if (formData.authChoice === 'password' && !formData.password) {
      errors.push('Password is required when selected');
    }
    
    if (formData.authChoice === 'password' && formData.password && formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      errors.push('Invalid email format');
    }
    
    return errors;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const signUpMobile = async (formData: SignUpFormData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const errors = validateSignUpForm(formData);
      if (errors.length > 0) {
        toast({
          title: "Validation Error",
          description: errors.join(', '),
          variant: "destructive",
        });
        return { success: false, errors };
      }

      const formatted = formatMobileNumber(formData.mobileNumber);
      
      // Create user account using secure RPC function
      let userId: string | null = null;
      
      if (formData.authChoice === 'password' && formData.email && formData.password) {
        // Email + Password signup through Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
              mobile_number: formatted,
            }
          }
        });

        if (error) throw error;
        userId = data.user!.id;
      }

      // Use secure RPC to create user record (handles duplicates safely)
      const { data: createdUserId, error: dbError } = await supabase.rpc('create_user_with_mobile', {
        p_mobile_number: formatted,
        p_full_name: formData.fullName,
        p_email: formData.email || null,
        p_address: `${formData.address.city}, ${formData.address.district}, ${formData.address.state}, ${formData.address.country}`,
        p_referred_by: formData.referralCode || null,
        p_user_id: userId
      });

      if (dbError) throw dbError;
      
      // Check if user already existed
      if (createdUserId && createdUserId !== userId) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        toast({
          title: "User Exists",
          description: "Account with this number already exists. Please login.",
          variant: "destructive",
        });
        return { success: false, errors: ['User already exists'] };
      }

      await Haptics.impact({ style: ImpactStyle.Light });
      
      toast({
        title: "Registration Successful! 🎉",
        description: formData.authChoice === 'password' 
          ? "Check your email for verification" 
          : "You can now login with OTP",
      });

      // Send welcome notification
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: "Welcome to Yogic Mile! 🚶‍♂️",
          body: "Start your walking journey today",
          schedule: { at: new Date(Date.now() + 2000) },
        }]
      });

      return { success: true, mobileNumber: formatted };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      return { success: false, errors: [error.message] };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const generateOTP = async (mobileNumber: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (!validateMobileNumber(mobileNumber)) {
        throw new Error('Invalid mobile number format');
      }

      const formatted = formatMobileNumber(mobileNumber);
      
      // Get user agent for security logging
      const userAgent = navigator.userAgent;

      // Generate and send OTP via WhatsApp using edge function
      const { data, error } = await supabase.functions.invoke('generate-whatsapp-otp', {
        body: {
          mobileNumber: formatted,
          userAgent: userAgent
        }
      });

      if (error) throw error;

      const response = data as { success: boolean; error?: string; message?: string };

      if (!response.success) {
        throw new Error(response.error);
      }

      setState(prev => ({ ...prev, otpSent: true, canResend: false }));
      startResendTimer();

      await Haptics.impact({ style: ImpactStyle.Light });
      
      toast({
        title: "OTP Sent! 📱",
        description: "Check your WhatsApp for 6-digit code",
      });

      return { success: true };
    } catch (error: any) {
      // Surface better error details from edge function
      let friendly = error?.message || 'Failed to send OTP';
      try {
        const details = (error && (error.details || (error.context && error.context.body))) || null as any;
        if (typeof details === 'string') {
          const parsed = JSON.parse(details);
          friendly = parsed?.error || parsed?.message || friendly;
        } else if (details && typeof details === 'object') {
          friendly = details?.error || details?.message || friendly;
        }
      } catch {}

      // Common hint when account doesn’t exist (server returns 404 User not found)
      if (/user not found/i.test(friendly)) {
        friendly = 'No account found for this number. Please sign up first or use Email & Password.';
      }

      console.error('OTP generation error:', error);
      toast({
        title: "OTP Generation Failed",
        description: friendly,
        variant: "destructive",
      });
      return { success: false, error: friendly };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const verifyOTP = async (mobileNumber: string, otp: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const formatted = formatMobileNumber(mobileNumber);
      
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        throw new Error('OTP must be exactly 6 digits');
      }

      // Get client IP and user agent for security logging
      const clientIP = null; // Browser doesn't expose real IP
      const userAgent = navigator.userAgent;

      // Verify OTP with audit logging
      const { data, error } = await supabase.rpc('verify_otp_with_audit', {
        p_mobile_number: formatted,
        p_otp: otp,
        p_ip_address: clientIP,
        p_user_agent: userAgent
      });

      if (error) throw error;

      const response = data as { success: boolean; error?: string; verified?: boolean };

      if (!response.success) {
        // Add progressive delay for failed attempts
        const attemptCount = (state.failedAttempts || 0) + 1;
        setState(prev => ({ ...prev, failedAttempts: attemptCount }));
        
        const delay = Math.min(attemptCount * 2000, 30000); // Max 30 second delay
        if (attemptCount > 1) {
          toast({
            title: "Too Many Failed Attempts",
            description: `Please wait ${delay/1000} seconds before trying again`,
            variant: "destructive",
          });
          
          setTimeout(() => {
            setState(prev => ({ ...prev, isLoading: false }));
          }, delay);
          
          return { success: false, error: response.error };
        }
        
        throw new Error(response.error || 'Invalid OTP code. Please try again.');
      }

      // Reset failed attempts on success
      setState(prev => ({ ...prev, failedAttempts: 0, otpSent: false }));

      // Get user data for session (if authenticated, can view own row)
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('mobile_number', formatted)
        .maybeSingle();

      // Create Supabase auth session after OTP verification
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-auth-session', {
        body: { mobileNumber: formatted }
      });

      if (sessionError || !sessionData?.success || !sessionData?.session) {
        throw new Error('Failed to create session: ' + (sessionData?.error || sessionError?.message));
      }

      // Set the Supabase auth session with tokens from edge function
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
      });

      if (setSessionError) {
        throw new Error('Failed to establish session: ' + setSessionError.message);
      }

      // Store secure local session for additional tracking
      const localSession = {
        mobileNumber: formatted,
        verifiedAt: new Date().toISOString(),
        deviceId: crypto.randomUUID(),
      };

      await Preferences.set({
        key: SECURE_STORAGE_KEY,
        value: JSON.stringify(localSession),
      });

      setState(prev => ({ ...prev, biometricEnabled: true }));
      await Haptics.impact({ style: ImpactStyle.Light });
      
      toast({
        title: "OTP Verified! ✅",
        description: "Logging you in...",
      });

      return { success: true };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const startResendTimer = () => {
    setState(prev => ({ ...prev, otpResendTimer: OTP_RESEND_INTERVAL }));
    
    resendInterval.current = setInterval(() => {
      setState(prev => {
        if (prev.otpResendTimer <= 1) {
          if (resendInterval.current) {
            clearInterval(resendInterval.current);
          }
          return { ...prev, otpResendTimer: 0, canResend: true };
        }
        return { ...prev, otpResendTimer: prev.otpResendTimer - 1 };
      });
    }, 1000);
  };

  const clearSecureSession = async () => {
    try {
      await Preferences.remove({ key: SECURE_STORAGE_KEY });
      setState(prev => ({ ...prev, sessionSecure: false }));
    } catch (error) {
      console.error('Failed to clear secure session:', error);
    }
  };

  return {
    state,
    formatMobileNumber,
    validateMobileNumber,
    signUpMobile,
    generateOTP,
    verifyOTP,
    clearSecureSession,
  };
};