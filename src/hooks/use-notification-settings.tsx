import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { PushNotificationService } from '@/services/PushNotificationService';

export interface NotificationSettings {
  id?: string;
  user_id: string;
  walking_reminders_enabled: boolean;
  coin_expiry_alerts: boolean;
  achievement_notifications: boolean;
  location_deals_enabled: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'custom';
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
  fcm_token?: string;
}

const defaultSettings: Omit<NotificationSettings, 'user_id'> = {
  walking_reminders_enabled: true,
  coin_expiry_alerts: true,
  achievement_notifications: true,
  location_deals_enabled: true,
  reminder_frequency: 'daily',
  quiet_hours_start: '22:00:00',
  quiet_hours_end: '07:00:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

export const useNotificationSettings = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const pushService = PushNotificationService.getInstance();

  useEffect(() => {
    if (user && !isGuest) {
      loadSettings();
      initializePushNotifications();
    } else {
      setIsLoading(false);
    }
  }, [user, isGuest]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data as NotificationSettings);
      } else {
        // Create default settings for new user
        const newSettings = {
          user_id: user.id,
          ...defaultSettings,
        };
        
        const { data: created, error: createError } = await supabase
          .from('notification_settings')
          .insert(newSettings)
          .select()
          .single();

        if (createError) throw createError;
        setSettings(created as NotificationSettings);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      toast({
        title: "Settings Load Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializePushNotifications = async () => {
    try {
      const initialized = await pushService.initialize();
      if (initialized) {
        toast({
          title: "Notifications Ready",
          description: "Push notifications have been enabled",
        });
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const updateSettings = async (updates: Partial<NotificationSettings>) => {
    if (!user || !settings) return;

    try {
      setIsSaving(true);
      
      const updatedSettings = { ...settings, ...updates };
      
      const { data, error } = await supabase
        .from('notification_settings')
        .update(updatedSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data as NotificationSettings);
      
      toast({
        title: "Settings Updated",
        description: "Notification preferences saved successfully",
      });

      // Schedule walking reminders if enabled
      if (updates.walking_reminders_enabled === true) {
        await pushService.scheduleWalkingReminder();
      }

      return data;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast({
        title: "Update Failed",
        description: "Could not save notification preferences",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = async (key: keyof NotificationSettings, value?: any) => {
    if (!settings) return;

    const currentValue = settings[key];
    const newValue = value !== undefined ? value : !currentValue;
    
    await updateSettings({ [key]: newValue });
  };

  const updateQuietHours = async (startTime: string, endTime: string) => {
    await updateSettings({
      quiet_hours_start: startTime,
      quiet_hours_end: endTime,
    });
  };

  const updateReminderFrequency = async (frequency: 'daily' | 'weekly' | 'custom') => {
    await updateSettings({ reminder_frequency: frequency });
  };

  const resetToDefaults = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      
      const resetSettings = {
        user_id: user.id,
        ...defaultSettings,
      };

      const { data, error } = await supabase
        .from('notification_settings')
        .update(resetSettings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data as NotificationSettings);
      
      toast({
        title: "Settings Reset",
        description: "Notification preferences reset to defaults",
      });
      
      return data;
    } catch (error) {
      console.error('Failed to reset notification settings:', error);
      toast({
        title: "Reset Failed",
        description: "Could not reset notification preferences",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const testNotification = async (type: 'reminder' | 'achievement' | 'deal' | 'coin_expiry') => {
    const testMessages = {
      reminder: {
        title: "🚶‍♀️ Test Walking Reminder",
        body: "This is a test walking reminder notification!",
      },
      achievement: {
        title: "🎉 Test Achievement",
        body: "Congratulations! You've unlocked a test achievement!",
      },
      deal: {
        title: "🛍️ Test Deal Alert", 
        body: "New deal available: 20% off at Test Café!",
      },
      coin_expiry: {
        title: "⏰ Test Coin Expiry",
        body: "Test: Your ₹5.00 coins expire at midnight!",
      },
    };

    const message = testMessages[type];
    await pushService.sendLocalNotification({
      title: message.title,
      body: message.body,
      data: { type, userId: user?.id },
    });

    toast({
      title: "Test Notification Sent",
      description: `${message.title} notification delivered`,
    });
  };

  return {
    settings,
    isLoading,
    isSaving,
    updateSettings,
    toggleSetting,
    updateQuietHours,
    updateReminderFrequency,
    resetToDefaults,
    testNotification,
    refreshSettings: loadSettings,
  };
};