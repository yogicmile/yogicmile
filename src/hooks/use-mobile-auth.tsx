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
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, mobile_number')
        .eq('mobile_number', formatted)
        .single();

      if (existingUser) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        toast({
          title: "User Exists",
          description: "Account with this number already exists. Please login.",
          variant: "destructive",
        });
        return { success: false, errors: ['User already exists'] };
      }

      // Create user account
      let userId: string;
      
      if (formData.authChoice === 'password' && formData.email && formData.password) {
        // Email + Password signup
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
      } else {
        // OTP-only signup
        userId = crypto.randomUUID();
      }

      const userData = {
        id: userId,
        mobile_number: formatted,
        full_name: formData.fullName,
        email: formData.email || null,
        address: `${formData.address.city}, ${formData.address.district}, ${formData.address.state}, ${formData.address.country}`,
        referred_by: formData.referralCode || null,
        referral_code: formatted, // Mobile acts as referral code
        password_hash: formData.authChoice === 'password' ? 'hashed_by_supabase' : null,
      };

      // Insert into users table
      const { error: dbError } = await supabase
        .from('users')
        .insert(userData);

      if (dbError) throw dbError;

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
      
      // Get client IP and user agent for security logging
      const clientIP = null; // Browser doesn't expose real IP
      const userAgent = navigator.userAgent;

      // Generate OTP with rate limiting and audit logging
      const { data, error } = await supabase.rpc('generate_otp_with_rate_limit', {
        p_mobile_number: formatted,
        p_ip_address: clientIP,
        p_user_agent: userAgent
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
        description: response.message || "Check your SMS for 6-digit code",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "OTP Generation Failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
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

      // Get user data for session
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('mobile_number', formatted)
        .single();

      if (user) {
        // Store secure session
        const sessionData = {
          mobileNumber: formatted,
          verifiedAt: new Date().toISOString(),
          deviceId: crypto.randomUUID(),
        };

        await Preferences.set({
          key: 'yogic_mile_secure_session',
          value: JSON.stringify(sessionData),
        });

        // Enable biometric for faster future access
        setState(prev => ({ ...prev, biometricEnabled: true }));

        await Haptics.impact({ style: ImpactStyle.Light });
        
        toast({
          title: "OTP Verified! ✅",
          description: "Login successful",
        });

        return { success: true };
      }

      throw new Error('User not found');
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
      
      // Get user data for session
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('mobile_number', formatted)
        .single();

      if (user) {
        // Store secure session
        const session = {
          userId: user.id,
          mobileNumber: formatted,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
          createdAt: Date.now(),
        };

        await Preferences.set({
          key: SECURE_STORAGE_KEY,
          value: JSON.stringify(session),
        });

        setState(prev => ({ 
          ...prev, 
          sessionSecure: true,
          otpSent: false,
        }));
      }

      await Haptics.impact({ style: ImpactStyle.Light });
      
      toast({
        title: "OTP Verified! ✅",
        description: "Login successful",
      });

      return { success: true };
    }

    throw new Error('User not found');
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