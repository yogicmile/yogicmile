import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { permissionManager } from '@/services/PermissionManager';

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
  const navigate = useNavigate();
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
      
      // Helper: Get redirect URL based on platform
      const getAuthRedirectUrl = () => {
        if (Capacitor.isNativePlatform()) {
          return 'yogicmile://auth-callback';
        }
        return `${window.location.origin}/`;
      };

      if (formData.authChoice === 'password' && formData.email && formData.password) {
        // Email + Password signup through Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(),
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
    
    const clientRequestId = crypto.randomUUID().slice(0, 8);
    
    try {
      if (!validateMobileNumber(mobileNumber)) {
        toast({
          title: "Invalid Number",
          description: "Please enter a valid 10-digit mobile number",
          variant: "destructive",
        });
        return { success: false, error: 'Invalid mobile number format' };
      }

      const formatted = formatMobileNumber(mobileNumber);
      const userAgent = navigator.userAgent;

      console.info(`[${clientRequestId}] Requesting OTP for ${formatted.replace(/\d(?=\d{4})/g, '*')}`);

      let response: any = null;
      let responseError: any = null;

      // First attempt: Use Supabase client invoke
      try {
        const { data, error } = await supabase.functions.invoke('generate-whatsapp-otp', {
          body: {
            mobileNumber: formatted,
            userAgent: userAgent
          }
        });

        if (error) {
          responseError = error;
          console.warn(`[${clientRequestId}] Invoke failed:`, error);
        } else {
          response = data;
        }
      } catch (invokeErr) {
        responseError = invokeErr;
        console.warn(`[${clientRequestId}] Invoke exception:`, invokeErr);
      }

      // If first attempt failed with INVALID_JSON or empty response, retry once
      if (!response || responseError) {
        const shouldRetry = !isRetry && (
          responseError?.message?.includes('INVALID_JSON') ||
          responseError?.message?.includes('Empty request body') ||
          !response
        );

        if (shouldRetry) {
          console.info(`[${clientRequestId}] Retrying after 800ms...`);
          await new Promise(resolve => setTimeout(resolve, 800));
          
          try {
            const { data, error } = await supabase.functions.invoke('generate-whatsapp-otp', {
              body: {
                mobileNumber: formatted,
                userAgent: userAgent
              }
            });

            if (error) {
              responseError = error;
              console.warn(`[${clientRequestId}] Retry failed:`, error);
            } else {
              response = data;
              responseError = null;
            }
          } catch (retryErr) {
            responseError = retryErr;
            console.warn(`[${clientRequestId}] Retry exception:`, retryErr);
          }
        }
      }

      // Fallback: Direct fetch to edge function URL
      if (!response || responseError) {
        console.info(`[${clientRequestId}] Falling back to direct fetch...`);
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3eW1mdmZhaXF2dGlxamZtZWp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NzY4ODAsImV4cCI6MjA3MzI1Mjg4MH0.BuuVywo2S7yhIsO4LvqCvJVULKdUlXKNKiKzVjgr6yw';
          
          const fetchResponse = await fetch(
            'https://rwymfvfaiqvtiqjfmejv.supabase.co/functions/v1/generate-whatsapp-otp',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': anonKey,
                'Authorization': `Bearer ${session?.access_token || anonKey}`
              },
              body: JSON.stringify({
                mobileNumber: formatted,
                userAgent: userAgent
              })
            }
          );

          if (!fetchResponse.ok) {
            const errorText = await fetchResponse.text();
            throw new Error(`HTTP ${fetchResponse.status}: ${errorText}`);
          }

          response = await fetchResponse.json();
          responseError = null;
          console.info(`[${clientRequestId}] Direct fetch succeeded`);
        } catch (fetchErr: any) {
          console.error(`[${clientRequestId}] Direct fetch failed:`, fetchErr);
          throw new Error(fetchErr.message || 'Failed to connect to OTP service');
        }
      }

      // Parse response
      if (!response || !response.success) {
        const errorCode = response?.code || '';
        const serverReqId = response?.reqId || '';
        const serverError = response?.error || 'Failed to send OTP';
        
        console.error(`[${clientRequestId}] Server error: ${errorCode} - ${serverError} (${serverReqId})`);
        
        const errorMessages: Record<string, string> = {
          'INVALID_JSON': 'Temporary issue sending request. Please try again.',
          'CONFIG_MISSING': 'WhatsApp service not configured. Please use Email & Password.',
          'VALIDATION_ERROR': response?.error || 'Please enter a valid mobile number with country code.',
          'OTP_RATE_LIMIT': response?.error || 'Too many requests. Please wait before trying again.',
          'OTP_DAILY_LIMIT': response?.error || 'Daily limit reached. Please try again tomorrow.',
          'OTP_BLOCKED': response?.error || 'Your account is blocked. Please contact support.',
          'USER_CREATION_FAILED': 'Could not prepare account. Please try Email & Password.',
          'TWILIO_SANDBOX_REQUIRED': 'WhatsApp not set up. Please use Email & Password.',
          'TWILIO_INVALID_FROM': 'WhatsApp service issue. Please contact support.',
          'TWILIO_AUTH_INVALID': 'Authentication error. Please contact support.',
          'UNEXPECTED_ERROR': response?.error || 'Something went wrong. Please try again.'
        };
        
        const friendlyMessage = errorMessages[errorCode] || serverError;
        const displayMessage = serverReqId 
          ? `${friendlyMessage} (Ref: ${serverReqId.slice(-4).toUpperCase()})`
          : friendlyMessage;
        
        toast({
          title: "OTP Failed",
          description: displayMessage,
          variant: "destructive",
        });
        
        return { 
          success: false, 
          error: friendlyMessage,
          allowProceedToOTP: errorCode === 'INVALID_JSON' || errorCode === 'UNEXPECTED_ERROR'
        };
      }

      // Success
      const serverReqId = response.reqId || '';
      console.info(`[${clientRequestId}] OTP sent successfully (server: ${serverReqId})`);

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
      console.error(`[${clientRequestId}] OTP generation failed:`, error);
      
      let friendlyMessage = 'Failed to send OTP. Please try again.';
      
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.message?.includes('timeout')) {
        friendlyMessage = 'Network error. Check your internet connection.';
      }
      
      toast({
        title: "OTP Generation Failed",
        description: friendlyMessage,
        variant: "destructive",
      });
      
      return { success: false, error: friendlyMessage };
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

      // Detect if running on native platform
      const isNative = Capacitor.isNativePlatform();
      const platform = isNative ? 'native' : 'web';

      // Request session creation from Edge Function
      const { data: sessionData, error: sessionError } = await supabase.functions.invoke('create-auth-session', {
        body: { 
          mobileNumber: formatted, 
          platform,
          redirectUrl: isNative ? 'yogicmile://auth-callback' : `${window.location.origin}/`
        }
      });

      if (sessionError || !sessionData?.success) {
        throw new Error('Failed to create session: ' + (sessionData?.error || sessionError?.message || 'Edge Function returned a non-2xx status code'));
      }

      // Handle response based on platform
      if (isNative && sessionData.access_token && sessionData.refresh_token) {
        // Native platform: Set session directly in-app
        console.log('🔐 Setting session directly for native platform');
        
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token
        });

        if (setSessionError) {
          throw new Error('Failed to establish session: ' + setSessionError.message);
        }

        await safeHapticImpact(ImpactStyle.Medium);

        // Check permissions after successful login
        console.log('🔍 Checking permissions after login...');
        const permissionStatus = await permissionManager.checkRealTimePermissionStatus();

        if (!permissionStatus.allGranted) {
          // Permissions incomplete - store flags for modal
          console.log('⚠️ Permissions incomplete:', permissionStatus);
          
          sessionStorage.setItem('show_permission_modal', 'true');
          sessionStorage.setItem('permission_status', JSON.stringify(permissionStatus));
          
          toast({
            title: "Login Successful! 🎉",
            description: "Please complete setup to start tracking",
            variant: "default",
          });
        } else {
          // All permissions granted
          console.log('✅ All permissions granted');
          
          toast({
            title: "Login Successful! 🎉",
            description: "Welcome back! Step tracking active.",
          });
        }

        // Trigger immediate health data sync on login (Android)
        if (Capacitor.getPlatform() === 'android') {
          try {
            console.log('[Auth] Initializing Google Fit on login...');
            const { googleFitService } = await import('@/services/GoogleFitService');
            const initResult = await googleFitService.initialize();
            
            if (initResult.success) {
              console.log('[Auth] Performing immediate sync...');
              const syncResult = await googleFitService.syncSteps();
              
              if (syncResult.success && syncResult.steps > 0) {
                toast({
                  title: "Steps Synced! ✅",
                  description: `${syncResult.steps.toLocaleString()} steps loaded from Google Fit`,
                  duration: 3000,
                });
              }
            } else {
              console.log('[Auth] Google Fit unavailable, using local sensors');
            }
          } catch (error) {
            console.error('[Auth] Failed to sync health data on login:', error);
            // Graceful degradation - continue without Google Fit
          }
        }

        // Navigate to dashboard (modal will show if needed)
        navigate('/');
        
        return { success: true };
      } else if (!isNative && sessionData.action_link) {
        // Web platform: Use magic link redirect
        console.log('🌐 Redirecting to magic link for web platform');
        window.location.href = sessionData.action_link;
        return { success: true };
      } else {
        throw new Error('Invalid response from session creation');
      }
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