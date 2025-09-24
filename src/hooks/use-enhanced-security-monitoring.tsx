import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  action: string;
  details: any;
  created_at: string;
  severity: 'low' | 'medium' | 'high';
}

interface SecurityMetrics {
  activeAlerts: number;
  securityScore: number;
  threatLevel: 'low' | 'medium' | 'high';
  lastScanTime: string;
}

interface RateLimitStatus {
  operation_type: string;
  attempt_count: number;
  blocked_until: string | null;
  window_start: string;
}

export const useEnhancedSecurityMonitoring = () => {
  const { user } = useAuth();
  const [recentAlerts, setRecentAlerts] = useState<SecurityAlert[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    activeAlerts: 0,
    securityScore: 85,
    threatLevel: 'low',
    lastScanTime: new Date().toISOString()
  });
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch security alerts with enhanced details
  const fetchSecurityAlerts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const alerts: SecurityAlert[] = data.map(log => ({
        id: log.id,
        action: log.action,
        details: log.details,
        created_at: log.created_at,
        severity: getSeverityLevel(log.action, log.details)
      }));

      setRecentAlerts(alerts);
      updateSecurityMetrics(alerts);
      
    } catch (error: any) {
      console.error('Failed to fetch security alerts:', error);
      toast.error('Failed to load security alerts');
    } finally {
      setIsLoading(false);
    }
  };

  // Check rate limiting status
  const fetchRateLimitStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRateLimitStatus(data || []);
    } catch (error: any) {
      console.error('Failed to fetch rate limit status:', error);
    }
  };

  // Enhanced security event logging with fraud detection
  const logSecurityEvent = async (
    eventType: string,
    severity: 'low' | 'medium' | 'high' = 'medium',
    details: Record<string, any> = {}
  ) => {
    if (!user) return;

    try {
      // Check for fraud patterns before logging
      const fraudCheck = await checkFraudPatterns(eventType, details);
      
      if (fraudCheck.isFraud) {
        severity = 'high';
        details.fraud_detected = true;
        details.fraud_reason = fraudCheck.reason;
      }

      // Log the security event
      const { error } = await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_severity: severity,
        p_details: details
      });

      if (error) throw error;

      // Refresh alerts to show the new event
      await fetchSecurityAlerts();

      // Show notification for high severity events
      if (severity === 'high') {
        toast.warning(`Security Alert: ${eventType}`, {
          description: 'Suspicious activity detected. Please review your account security.'
        });
      }

    } catch (error: any) {
      console.error('Failed to log security event:', error);
    }
  };

  // Check for fraud patterns using the new database function
  const checkFraudPatterns = async (eventType: string, details: Record<string, any>) => {
    if (!user) return { isFraud: false, reason: null };

    try {
      // Call the fraud detection function
      const { data, error } = await supabase
        .rpc('detect_fraud_patterns', {
          p_user_id: user.id,
          p_activity_type: eventType,
          p_activity_data: details
        });

      if (error) throw error;

      return {
        isFraud: data || false,
        reason: data ? 'Pattern detected by fraud detection system' : null
      };
    } catch (error) {
      console.error('Fraud detection check failed:', error);
      return { isFraud: false, reason: null };
    }
  };

  // Enhanced rate limiting check
  const checkRateLimit = async (operationType: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check existing rate limits
      const { data: existing } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('operation_type', operationType)
        .gte('window_start', oneHourAgo.toISOString())
        .maybeSingle();

      if (existing) {
        if (existing.blocked_until && new Date(existing.blocked_until) > now) {
          toast.error('Rate limit exceeded. Please try again later.');
          return true; // Rate limited
        }

        // Update attempt count
        const newCount = existing.attempt_count + 1;
        const isBlocked = newCount >= getRateLimitThreshold(operationType);

        await supabase
          .from('rate_limits')
          .update({
            attempt_count: newCount,
            blocked_until: isBlocked ? new Date(now.getTime() + 60 * 60 * 1000).toISOString() : null,
            updated_at: now.toISOString()
          })
          .eq('id', existing.id);

        return isBlocked;
      } else {
        // Create new rate limit record
        await supabase
          .from('rate_limits')
          .insert({
            user_id: user.id,
            operation_type: operationType,
            attempt_count: 1,
            window_start: now.toISOString()
          });

        return false;
      }
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  };

  // Get rate limit thresholds for different operations
  const getRateLimitThreshold = (operationType: string): number => {
    const thresholds: Record<string, number> = {
      'password_reset': 3,
      'login_attempt': 5,
      'otp_generation': 5,
      'data_export': 2,
      'profile_update': 10,
      'step_submission': 100
    };
    return thresholds[operationType] || 10;
  };

  // Determine severity level based on action and details
  const getSeverityLevel = (action: string, details: any): 'low' | 'medium' | 'high' => {
    const highRiskActions = [
      'security_violation',
      'multiple_failed_logins',
      'suspicious_activity',
      'data_breach_attempt',
      'unauthorized_access'
    ];

    const mediumRiskActions = [
      'password_changed',
      'email_changed',
      'profile_updated',
      'device_added'
    ];

    if (highRiskActions.includes(action)) return 'high';
    if (mediumRiskActions.includes(action)) return 'medium';
    if (details?.severity === 'high') return 'high';
    if (details?.fraud_detected) return 'high';
    
    return 'low';
  };

  // Update security metrics based on recent alerts
  const updateSecurityMetrics = (alerts: SecurityAlert[]) => {
    const highSeverityCount = alerts.filter(a => a.severity === 'high').length;
    const mediumSeverityCount = alerts.filter(a => a.severity === 'medium').length;
    
    let threatLevel: 'low' | 'medium' | 'high' = 'low';
    let securityScore = 100;

    if (highSeverityCount > 0) {
      threatLevel = 'high';
      securityScore -= (highSeverityCount * 20);
    } else if (mediumSeverityCount > 2) {
      threatLevel = 'medium';
      securityScore -= (mediumSeverityCount * 10);
    }

    // Ensure security score doesn't go below 0
    securityScore = Math.max(0, securityScore);

    setSecurityMetrics({
      activeAlerts: alerts.length,
      securityScore,
      threatLevel,
      lastScanTime: new Date().toISOString()
    });
  };

  // Get user-friendly alert message
  const getAlertMessage = (alert: SecurityAlert): string => {
    const messages: Record<string, string> = {
      'login_success': 'Successful login detected',
      'login_failed': 'Failed login attempt',
      'password_changed': 'Password was changed',
      'profile_updated': 'Profile information updated',
      'otp_generated': 'OTP code generated',
      'otp_verified': 'OTP code verified',
      'data_export_requested': 'Data export requested',
      'suspicious_activity': 'Suspicious activity detected',
      'security_violation': 'Security policy violation',
      'rate_limit_exceeded': 'Rate limit exceeded'
    };

    return messages[alert.action] || `Security event: ${alert.action}`;
  };

  // Initialize security monitoring
  useEffect(() => {
    if (user) {
      fetchSecurityAlerts();
      fetchRateLimitStatus();
    }
  }, [user]);

  return {
    recentAlerts,
    securityMetrics,
    rateLimitStatus,
    isLoading,
    fetchSecurityAlerts,
    logSecurityEvent,
    checkRateLimit,
    getAlertMessage,
    checkFraudPatterns
  };
};