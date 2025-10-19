import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeviceSession {
  id: string;
  device_fingerprint: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

interface SecurityEvent {
  id: string;
  action: string;
  details: any;
  created_at: string;
  severity: 'low' | 'medium' | 'high';
}

export const useEnhancedSecurity = () => {
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([]);
  const [recentSecurityEvents, setRecentSecurityEvents] = useState<SecurityEvent[]>([]);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Generate device fingerprint
  const generateDeviceFingerprint = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform,
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(16);
  }, []);

  // Initialize device session via Edge Function (secure)
  const initializeDeviceSession = useCallback(async () => {
    if (!user) return;

    const fingerprint = generateDeviceFingerprint();
    setDeviceFingerprint(fingerprint);

    try {
      const { data, error } = await supabase.functions.invoke('create-device-session', {
        body: {
          device_fingerprint: fingerprint,
          user_agent: navigator.userAgent
        }
      });

      if (error) {
        console.error('Failed to initialize device session:', error);
      } else if (data?.success) {
        console.log('Device session created successfully');
      }
    } catch (error) {
      console.error('Failed to initialize device session:', error);
    }
  }, [user, generateDeviceFingerprint]);

  // Fetch device sessions from safe view (excludes session_token)
  const fetchDeviceSessions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Using type assertion for the view which isn't in generated types
      const { data, error } = await (supabase as any)
        .from('device_sessions_safe')
        .select('*')
        .eq('user_id', user.id)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setDeviceSessions((data || []) as DeviceSession[]);
    } catch (error) {
      console.error('Failed to fetch device sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch recent security events
  const fetchSecurityEvents = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const events: SecurityEvent[] = (data || []).map(log => ({
        id: log.id,
        action: log.action,
        details: log.details || {},
        created_at: log.created_at,
        severity: getSeverityLevel(log.action)
      }));

      setRecentSecurityEvents(events);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    }
  }, [user]);

  const getSeverityLevel = (action: string): 'low' | 'medium' | 'high' => {
    if (action.includes('failed') || action.includes('blocked')) {
      return 'high';
    }
    if (action.includes('otp_generation') || action.includes('rate_limit')) {
      return 'medium';
    }
    return 'low';
  };

  // Log security event
  const logSecurityEvent = useCallback(async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' = 'medium',
    details: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_severity: severity,
        p_details: details,
        p_ip_address: null,
        p_user_agent: navigator.userAgent
      });

      if (error) throw error;
      
      // Refresh security events after logging
      fetchSecurityEvents();
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user, fetchSecurityEvents]);

  // Revoke device session via Edge Function (secure)
  const revokeDeviceSession = useCallback(async (sessionId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('revoke-device-session', {
        body: { session_id: sessionId }
      });

      if (error) throw error;
      
      if (data?.success) {
        fetchDeviceSessions();
      }
    } catch (error) {
      console.error('Failed to revoke device session:', error);
    }
  }, [user, fetchDeviceSessions]);

  // Update session activity via Edge Function (secure)
  const updateSessionActivity = useCallback(async () => {
    if (!user || !deviceFingerprint) return;

    try {
      const { error } = await supabase.functions.invoke('update-session-activity', {
        body: { device_fingerprint: deviceFingerprint }
      });

      if (error) {
        console.error('Failed to update session activity:', error);
      }
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }, [user, deviceFingerprint]);

  // Validate password strength
  const validatePasswordStrength = useCallback((password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"|,.<>?]/.test(password),
      noCommon: !['password', '123456', 'qwerty', 'admin'].includes(password.toLowerCase())
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    return {
      checks,
      score,
      strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong',
      isValid: score >= 4
    };
  }, []);

  useEffect(() => {
    if (user) {
      initializeDeviceSession();
      fetchDeviceSessions();
      fetchSecurityEvents();

      // Update session activity every 5 minutes
      const interval = setInterval(updateSessionActivity, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [user, initializeDeviceSession, fetchDeviceSessions, fetchSecurityEvents, updateSessionActivity]);

  return {
    deviceSessions,
    recentSecurityEvents,
    deviceFingerprint,
    isLoading,
    logSecurityEvent,
    revokeDeviceSession,
    validatePasswordStrength,
    fetchDeviceSessions,
    fetchSecurityEvents,
    updateSessionActivity
  };
};