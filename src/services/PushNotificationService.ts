import { PushNotifications, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type: 'reminder' | 'achievement' | 'deal' | 'coin_expiry' | 'custom';
    userId?: string;
    relatedId?: string;
    imageUrl?: string;
    deepLink?: string;
    trackingId?: string;
  };
}

export interface NotificationSettings {
  walking_reminders_enabled: boolean;
  coin_expiry_alerts: boolean;
  achievement_notifications: boolean;
  location_deals_enabled: boolean;
  reminder_frequency: 'daily' | 'weekly' | 'custom';
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private fcmToken: string | null = null;
  private isInitialized = false;

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Request permissions
      const permStatus = await this.requestPermissions();
      if (!permStatus || !(permStatus as any).display) {
        console.warn('Push notification permissions not granted');
        return false;
      }

      // Register for push notifications
      await this.registerPushNotifications();

      // Set up listeners
      this.setupNotificationListeners();

      // Get FCM token
      await this.getFCMToken();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return false;
    }
  }

  async requestPermissions() {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback - use local notifications
      return await LocalNotifications.requestPermissions();
    }

    return await PushNotifications.requestPermissions();
  }

  private async registerPushNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    await PushNotifications.register();
  }

  private setupNotificationListeners(): void {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback - set up local notification listeners
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('Local notification received:', notification);
        this.handleNotificationReceived(notification as any);
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('Local notification action performed:', action);
        this.handleNotificationActionPerformed(action as any);
      });
      return;
    }

    // Registration listeners
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token:', token.value);
      this.fcmToken = token.value;
      this.updateFCMTokenInDatabase(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Notification received listeners
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action performed:', action);
      this.handleNotificationActionPerformed(action);
    });
  }

  private async updateFCMTokenInDatabase(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          fcm_token: token,
        });

      if (error) {
        console.error('Failed to update FCM token:', error);
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }

  private handleNotificationReceived(notification: PushNotificationSchema): void {
    // Log notification received
    this.logNotificationEvent('received', notification);

    // Handle foreground notification display
    if (Capacitor.isNativePlatform()) {
      // Show local notification for foreground display
      LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: notification.title || 'Notification',
          body: notification.body || '',
          schedule: { at: new Date(Date.now() + 100) },
          extra: notification.data,
        }]
      });
    }
  }

  private handleNotificationActionPerformed(action: ActionPerformed): void {
    console.log('Notification action performed:', action);
    
    // Log notification opened
    this.logNotificationEvent('opened', action.notification);

    // Handle deep linking
    if (action.notification.data?.deepLink) {
      this.handleDeepLink(action.notification.data.deepLink);
    }

    // Handle specific notification types
    if (action.notification.data?.type) {
      this.handleNotificationType(action.notification.data.type, action.notification.data);
    }
  }

  private async logNotificationEvent(event: 'received' | 'opened', notification: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('notification_logs').insert({
        user_id: user.id,
        notification_id: notification.data?.trackingId,
        fcm_token: this.fcmToken || '',
        status: event === 'received' ? 'delivered' : 'opened',
        delivered_at: event === 'received' ? new Date().toISOString() : undefined,
        opened_at: event === 'opened' ? new Date().toISOString() : undefined,
      });
    } catch (error) {
      console.error('Failed to log notification event:', error);
    }
  }

  private handleDeepLink(deepLink: string): void {
    // Parse and handle deep links
    try {
      const url = new URL(deepLink, window.location.origin);
      window.location.href = url.pathname + url.search;
    } catch (error) {
      console.error('Invalid deep link:', deepLink, error);
    }
  }

  private handleNotificationType(type: string, data: any): void {
    switch (type) {
      case 'achievement':
        // Navigate to achievements page
        window.location.href = '/profile?tab=achievements';
        break;
      case 'deal':
        // Navigate to deals page
        window.location.href = '/rewards?category=deals';
        break;
      case 'coin_expiry':
        // Navigate to wallet page
        window.location.href = '/wallet';
        break;
      case 'reminder':
        // Navigate to dashboard
        window.location.href = '/';
        break;
      default:
        // Default action
        break;
    }
  }

  async sendLocalNotification(payload: NotificationPayload): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: payload.title,
          body: payload.body,
          schedule: { at: new Date(Date.now() + 100) },
          extra: payload.data,
        }]
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  async scheduleWalkingReminder(delayMinutes: number = 120): Promise<void> {
    const settings = await this.getUserNotificationSettings();
    if (!settings?.walking_reminders_enabled) return;

    // Check if we're in quiet hours
    if (this.isInQuietHours(settings)) return;

    const messages = [
      "Time for a mindful walk! 🚶‍♀️",
      "Your steps are waiting! Take a short walk 🌟",
      "Break time! A quick walk will boost your energy ⚡",
      "Step towards wellness - time for a walk! 🌿"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: "Walking Reminder",
          body: randomMessage,
          schedule: { at: new Date(Date.now() + delayMinutes * 60000) },
          extra: {
            type: 'reminder',
            category: 'walking'
          },
        }]
      });
    } catch (error) {
      console.error('Failed to schedule walking reminder:', error);
    }
  }

  async checkAndNotifyCoinExpiry(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const settings = await this.getUserNotificationSettings();
      if (!settings?.coin_expiry_alerts) return;

      // This would check for expiring coins in the database
      // For now, we'll simulate the check
      const expiringAmount = await this.getExpiringCoins(user.id);
      
      if (expiringAmount > 0) {
        await this.sendLocalNotification({
          title: "Coins Expiring Soon!",
          body: `Redeem your ₹${(expiringAmount / 100).toFixed(2)} before midnight!`,
          data: {
            type: 'coin_expiry',
            userId: user.id,
          }
        });
      }
    } catch (error) {
      console.error('Failed to check coin expiry:', error);
    }
  }

  async notifyAchievementUnlocked(achievement: string, imageUrl?: string): Promise<void> {
    const settings = await this.getUserNotificationSettings();
    if (!settings?.achievement_notifications) return;

    await this.sendLocalNotification({
      title: "🎉 Achievement Unlocked!",
      body: achievement,
      data: {
        type: 'achievement',
        imageUrl,
      }
    });
  }

  private async getUserNotificationSettings(): Promise<NotificationSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return data as NotificationSettings | null;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return null;
    }
  }

  private isInQuietHours(settings: NotificationSettings): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
    
    const quietStart = settings.quiet_hours_start;
    const quietEnd = settings.quiet_hours_end;
    
    // Handle quiet hours that span midnight
    if (quietStart > quietEnd) {
      return currentTime >= quietStart || currentTime <= quietEnd;
    } else {
      return currentTime >= quietStart && currentTime <= quietEnd;
    }
  }

  private async getExpiringCoins(userId: string): Promise<number> {
    // This would query the database for coins expiring in 24 hours
    // For demo purposes, return a random amount
    return Math.random() > 0.8 ? Math.floor(Math.random() * 500) + 100 : 0;
  }

  private async getFCMToken(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      // Web doesn't have FCM tokens in the same way
      return 'web_token_' + Date.now();
    }

    // This would get the actual FCM token in native environment
    return this.fcmToken;
  }

  getFCMTokenSync(): string | null {
    return this.fcmToken;
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [] });
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }
}