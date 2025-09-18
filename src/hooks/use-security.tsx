import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PrivacySettings {
  id?: string;
  user_id?: string;
  profile_visibility: 'public' | 'friends_only' | 'private';
  analytics_tracking: boolean;
  marketing_emails: boolean;
  location_tracking: boolean;
  data_collection: boolean;
  login_notifications: boolean;
  security_alerts: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FraudAlert {
  id: string;
  user_id: string;
  fraud_type: string;
  detection_timestamp: string;
  severity_level: string;
  detection_data: any;
  auto_action_taken?: string;
  admin_reviewed: boolean;
  admin_user_id?: string;
  resolution_status: string;
  resolution_notes?: string;
  created_at: string;
}

export interface SecurityAuditEvent {
  id: string;
  event_type: string;
  event_timestamp: string;
  result_status: string;
  additional_data: any;
}

export const useSecurity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityAuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch privacy settings
  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      let { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No settings found, create default
        const defaultSettings: Omit<PrivacySettings, 'id'> = {
          profile_visibility: 'public',
          analytics_tracking: true,
          marketing_emails: true,
          location_tracking: true,
          data_collection: true,
          login_notifications: true,
          security_alerts: true,
        };

        const { data: newData, error: createError } = await supabase
          .from('privacy_settings')
          .insert([{ user_id: user.id, ...defaultSettings }])
          .select()
          .single();

        if (createError) throw createError;
        data = newData;
      } else if (error) {
        throw error;
      }

      setPrivacySettings(data as PrivacySettings);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive"
      });
    }
  };

  // Update privacy settings
  const updatePrivacySettings = async (settings: Partial<PrivacySettings>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('privacy_settings')
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;

      setPrivacySettings(prev => prev ? { ...prev, ...settings } : null);
      
      // Log privacy update event
      await logSecurityEvent('privacy_update', 'success', { updated_fields: Object.keys(settings) });

      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been updated successfully",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive"
      });
      return false;
    }
  };

  // Fetch fraud alerts for current user
  const fetchFraudAlerts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('fraud_detection')
        .select('*')
        .eq('user_id', user.id)
        .eq('resolution_status', 'open')
        .order('detection_timestamp', { ascending: false })
        .limit(10);

      if (error) throw error;
      setFraudAlerts((data || []) as FraudAlert[]);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
    }
  };

  // Fetch recent security events
  const fetchSecurityEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', user.id)
        .order('event_timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSecurityEvents(data || []);
    } catch (error) {
      console.error('Error fetching security events:', error);
    }
  };

  // Log security event
  const logSecurityEvent = async (
    eventType: string,
    resultStatus: string,
    additionalData: any = {}
  ) => {
    try {
      const { error } = await supabase
        .from('security_audit_log')
        .insert([{
          event_id: crypto.randomUUID(),
          user_id: user?.id,
          event_type: eventType,
          result_status: resultStatus,
          additional_data: additionalData,
          ip_address: null, // Will be set by database function if needed
          user_agent: navigator.userAgent
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  // Request data export
  const requestDataExport = async (exportType: 'full' | 'basic' | 'transactions' | 'steps' = 'full') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('data_export_requests')
        .insert([{
          user_id: user.id,
          export_type: exportType,
          download_token: crypto.randomUUID()
        }]);

      if (error) throw error;

      await logSecurityEvent('data_export', 'success', { export_type: exportType });

      toast({
        title: "Export Requested",
        description: "Your data export has been requested. You'll receive an email when it's ready.",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error requesting data export:', error);
      toast({
        title: "Error",
        description: "Failed to request data export",
        variant: "destructive"
      });
      return false;
    }
  };

  // Request account deletion
  const requestAccountDeletion = async (reason?: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .insert([{
          user_id: user.id,
          reason: reason || 'User requested'
        }]);

      if (error) throw error;

      await logSecurityEvent('account_deletion', 'success', { reason });

      toast({
        title: "Deletion Requested",
        description: "Your account deletion has been requested. You have 30 days to cancel this request.",
        variant: "default"
      });

      return true;
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      toast({
        title: "Error",
        description: "Failed to request account deletion",
        variant: "destructive"
      });
      return false;
    }
  };

  // Fraud detection for steps
  const detectStepFraud = async (stepCount: number, location?: { latitude: number; longitude: number }) => {
    if (!user) return;

    const alerts = [];

    // Check for unrealistic step counts
    if (stepCount > 30000) {
      alerts.push({
        type: 'unrealistic_steps',
        severity: 'high',
        data: { step_count: stepCount, threshold: 30000 }
      });
    }

    // Check for GPS spoofing (if location available)
    if (location) {
      const lastLocation = localStorage.getItem('last_known_location');
      if (lastLocation) {
        const last = JSON.parse(lastLocation);
        const distance = calculateDistance(last.latitude, last.longitude, location.latitude, location.longitude);
        const timeElapsed = Date.now() - last.timestamp;
        const speed = (distance / (timeElapsed / 1000 / 3600)); // km/h

        if (speed > 100) { // More than 100 km/h
          alerts.push({
            type: 'speed_violation',
            severity: 'medium',
            data: { speed, distance, time_elapsed: timeElapsed }
          });
        }
      }
      
      localStorage.setItem('last_known_location', JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: Date.now()
      }));
    }

    // Report fraud alerts
    for (const alert of alerts) {
      try {
        await supabase
          .from('fraud_detection')
          .insert([{
            user_id: user.id,
            fraud_type: alert.type,
            severity_level: alert.severity,
            detection_data: alert.data,
            auto_action_taken: alert.severity === 'high' ? 'flag_review' : 'warning'
          }]);
      } catch (error) {
        console.error('Error reporting fraud alert:', error);
      }
    }

    return alerts;
  };

  // Utility function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPrivacySettings(),
        fetchFraudAlerts(),
        fetchSecurityEvents()
      ]);
      setIsLoading(false);
    };

    if (user) {
      loadData();
    }
  }, [user]);

  return {
    privacySettings,
    fraudAlerts,
    securityEvents,
    isLoading,
    updatePrivacySettings,
    requestDataExport,
    requestAccountDeletion,
    detectStepFraud,
    logSecurityEvent,
    refreshData: () => {
      fetchPrivacySettings();
      fetchFraudAlerts();
      fetchSecurityEvents();
    }
  };
};