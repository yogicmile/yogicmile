import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityAlert {
  id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
  severity: 'low' | 'medium' | 'high';
}

export const useSecurityMonitoring = () => {
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch recent security events for the current user
  const fetchSecurityAlerts = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const alerts: SecurityAlert[] = (data || []).map(log => ({
        id: log.id,
        action: log.action,
        details: (log.details as Record<string, any>) || {},
        created_at: log.created_at,
        severity: getSeverityLevel(log.action)
      }));

      setRecentAlerts(alerts);
    } catch (error) {
      console.error('Failed to fetch security alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityLevel = (action: string): 'low' | 'medium' | 'high' => {
    if (action.includes('failed') || action.includes('blocked')) {
      return 'high';
    }
    if (action.includes('otp_generation') || action.includes('rate_limit')) {
      return 'medium';
    }
    return 'low';
  };

  const getAlertMessage = (alert: SecurityAlert): string => {
    switch (alert.action) {
      case 'otp_generated':
        return 'OTP was generated for your account';
      case 'otp_verified_successfully':
        return 'OTP was successfully verified';
      case 'otp_generation_failed':
        return 'Failed OTP generation attempt';
      case 'otp_verification_failed':
        return 'Failed OTP verification attempt';
      case 'otp_generation_blocked':
        return 'OTP generation was blocked due to rate limits';
      case 'otp_rate_limit_exceeded':
        return 'Account temporarily blocked due to too many attempts';
      default:
        return alert.action.replace(/_/g, ' ').toUpperCase();
    }
  };

  // Log a custom security event
  const logSecurityEvent = async (action: string, details: Record<string, any> = {}) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action,
          details,
          ip_address: null, // Browser can't access real IP
          user_agent: navigator.userAgent
        });

      if (error) throw error;
      
      // Refresh alerts after logging
      fetchSecurityAlerts();
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSecurityAlerts();
    }
  }, [user]);

  return {
    recentAlerts,
    isLoading,
    fetchSecurityAlerts,
    logSecurityEvent,
    getAlertMessage,
  };
};