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

// Safe wrappers for Capacitor plugins to avoid breaking web builds
const safeHapticImpact = async (style: ImpactStyle) => {
  try {
    await Haptics.impact({ style });
  } catch (e) {
    // Haptics might not be available on web; ignore errors
    console.warn('Haptics not available:', (e as any)?.message || e);
  }
};

const safeScheduleNotification = async (payload: any) => {
  try {
    await LocalNotifications.schedule(payload);
  } catch (e) {
    // Notifications may be blocked or plugin not available; ignore errors
    console.warn('LocalNotifications not available:', (e as any)?.message || e);
  }
};

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
        await safeHapticImpact(ImpactStyle.Medium);
        toast({
          title: "User Exists",
          description: "Account with this number already exists. Please login.",
          variant: "destructive",
        });
        return { success: false, errors: ['User already exists'] };
      }

      await safeHapticImpact(ImpactStyle.Light);
      
      toast({
        title: "Registration Successful! 🎉",
        description: formData.authChoice === 'password' 
          ? "Check your email for verification" 
          : "You can now login with OTP",
      });

      // Send welcome notification
      await safeScheduleNotification({
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

  const generateOTP = async (mobileNumber: string, isRetry = false): Promise<{ success: boolean; error?: string; allowProceedToOTP?: boolean }> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      if (!validateMobileNumber(mobileNumber)) {
        throw new Error('Invalid mobile number format');
      }

      const formatted = formatMobileNumber(mobileNumber);
      const requestId = crypto.randomUUID();
      const userAgent = navigator.userAgent;

      // Generate and send OTP via WhatsApp using edge function
      const { data, error } = await supabase.functions.invoke('generate-whatsapp-otp', {
        body: {
          mobileNumber: formatted,
          userAgent: userAgent
        },
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
      });

      if (error) throw error;

      const response = data as { success: boolean; error?: string; message?: string; attempts_remaining?: number; code?: string; reqId?: string };

      if (!response.success) {
        throw new Error(response.error);
      }

      setState(prev => ({ ...prev, otpSent: true, canResend: false }));
      startResendTimer();

      await safeHapticImpact(ImpactStyle.Light);
      
      const description = response.attempts_remaining !== undefined 
        ? `OTP sent! ${response.attempts_remaining} of 3 requests left this hour.`
        : "Check your WhatsApp for 6-digit code";
      
      toast({
        title: "OTP Sent! 📱",
        description,
      });

      return { success: true };
    } catch (error: any) {
      let friendly = 'Failed to send OTP';
      let errorCode = '';
      let reqId = '';
      let shouldRetry = false;
      let allowProceedToOTP = false;
      
      // Detect network errors (common on APK with poor connectivity)
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.message?.includes('timeout') ||
          error?.message?.includes('aborted')) {
        friendly = 'Network error. Check your internet and try again.';
        shouldRetry = !isRetry;
      } else {
        try {
          const details = (error && (error.details || (error.context && error.context.body))) || null as any;
          let parsedDetails: any = null;
          
          if (typeof details === 'string') {
            parsedDetails = JSON.parse(details);
          } else if (details && typeof details === 'object') {
            parsedDetails = details;
          }
          
          // Extract structured error info
          if (parsedDetails) {
            errorCode = parsedDetails.code || '';
            reqId = parsedDetails.reqId || '';
            
            const errorMessages: Record<string, { message: string; canProceed?: boolean }> = {
              'INVALID_METHOD': { message: 'Service issue. Please refresh and try again.' },
              'INVALID_JSON': { message: 'Technical glitch. Retrying...', canProceed: true },
              'VALIDATION_ERROR': { message: parsedDetails.error || 'Please check your mobile number.' },
              'OTP_RATE_LIMIT': { message: parsedDetails.error || 'Too many requests. Please wait.' },
              'OTP_DAILY_LIMIT': { message: parsedDetails.error || 'Daily limit reached. Try tomorrow.' },
              'OTP_BLOCKED': { message: parsedDetails.error || 'Account blocked. Contact support.' },
              'USER_NOT_FOUND': { message: 'No account found. Sign up first or use Email & Password.' },
              'CONFIG_MISSING': { message: 'Service not configured. Contact support.' },
              'TWILIO_SANDBOX_REQUIRED': { message: 'WhatsApp not set up for this number. Use Email & Password.' },
              'TWILIO_INVALID_FROM': { message: 'WhatsApp service issue. Contact support.' },
              'TWILIO_AUTH_INVALID': { message: 'Authentication error. Contact support.' },
              'UNEXPECTED_ERROR': { message: 'Something went wrong. Try again.', canProceed: true }
            };
            
            const errorInfo = errorMessages[errorCode];
            if (errorInfo) {
              friendly = errorInfo.message;
              allowProceedToOTP = errorInfo.canProceed || false;
              shouldRetry = !isRetry && errorCode === 'INVALID_JSON';
            } else {
              friendly = parsedDetails.error || parsedDetails.message || friendly;
            }
          }
        } catch (parseErr) {
          console.warn('Failed to parse error details:', parseErr);
        }

        // Fallback pattern matching for unstructured errors
        if (/user not found/i.test(error?.message || '')) {
          friendly = 'No account found. Sign up first or use Email & Password.';
        } else if (/not a valid WhatsApp recipient/i.test(error?.message || '') || /sandbox/i.test(error?.message || '')) {
          friendly = 'WhatsApp not configured. Use Email & Password.';
        }
      }

      // One silent retry for transient errors
      if (shouldRetry && !isRetry) {
        console.log(`Retrying OTP generation (code: ${errorCode})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return generateOTP(mobileNumber, true);
      }

      console.error('OTP generation error:', error);
      
      const description = reqId 
        ? `${friendly} (Ref: ${reqId.slice(-4).toUpperCase()})`
        : friendly;
      
      toast({
        title: "OTP Generation Failed",
        description,
        variant: "destructive",
      });
      
      return { success: false, error: friendly, allowProceedToOTP };
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

      // Request a magic login link from the Edge Function and redirect the browser to it
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-auth-session', {
        body: { mobileNumber: formatted, redirectUrl: `${window.location.origin}/` }
      });

      if (sessionError || !sessionData?.success || !sessionData?.action_link) {
        throw new Error('Failed to create session: ' + (sessionData?.error || sessionError?.message || 'Edge Function returned a non-2xx status code'));
      }

      // Redirect to Supabase magic link to establish the session in this browser
      window.location.href = sessionData.action_link;

      // The redirect will handle session creation; return success to stop spinners
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