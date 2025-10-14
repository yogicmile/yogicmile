import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { registerPlugin } from '@capacitor/core';

const ONBOARDING_KEY = 'yogicmile_onboarding_complete';
const PERMISSIONS_KEY = 'yogicmile_permissions_status';

export interface PermissionStatus {
  activityRecognition: boolean;
  notifications: boolean;
  batteryOptimized: boolean;
  motion: boolean;
  allGranted: boolean;
}

export interface BackgroundStepTrackingPlugin {
  requestPermissions(): Promise<{ activityRecognition: boolean; notifications: boolean; allGranted: boolean }>;
  requestAllPermissions(): Promise<{ activityRecognition: boolean; notifications: boolean; allGranted: boolean }>;
  requestBatteryOptimizationExemption(): Promise<{ granted: boolean; message: string }>;
  isBatteryOptimizationDisabled(): Promise<{ disabled: boolean }>;
  openManufacturerBatterySettings(): Promise<{ opened: boolean }>;
  startForegroundService(options: { notificationTitle: string; notificationText: string }): Promise<{ success: boolean; message: string }>;
  getDeviceInfo(): Promise<{ manufacturer: string; model: string; androidVersion: string; apiLevel: number }>;
  hasAggressiveBatteryOptimization(): Promise<{ aggressive: boolean; manufacturer: string; recommendations: string[] }>;
}

const BackgroundStepTracking = registerPlugin<BackgroundStepTrackingPlugin>(
  'BackgroundStepTracking',
  {
    web: () => import('../services/BackgroundStepTrackingWeb').then(m => new m.BackgroundStepTrackingWeb()),
  }
);

export class PermissionManager {
  private static instance: PermissionManager;

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const { value } = await Preferences.get({ key: ONBOARDING_KEY });
      return value === 'true';
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      return false;
    }
  }

  /**
   * Mark onboarding as complete
   */
  async markOnboardingComplete(): Promise<void> {
    try {
      await Preferences.set({ key: ONBOARDING_KEY, value: 'true' });
      console.log('Onboarding marked as complete');
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);
    }
  }

  /**
   * Check all permissions status
   */
  async checkAllPermissions(): Promise<PermissionStatus> {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      return {
        activityRecognition: false,
        notifications: false,
        batteryOptimized: true,
        motion: false,
        allGranted: false,
      };
    }

    try {
      if (platform === 'android') {
        const permResult = await BackgroundStepTracking.requestPermissions();
        const batteryResult = await BackgroundStepTracking.isBatteryOptimizationDisabled();

        return {
          activityRecognition: permResult.activityRecognition,
          notifications: permResult.notifications,
          batteryOptimized: batteryResult.disabled,
          motion: true, // N/A on Android
          allGranted: permResult.allGranted && batteryResult.disabled,
        };
      } else if (platform === 'ios') {
        // iOS uses CMPedometer which doesn't need explicit permission check before requesting
        return {
          activityRecognition: true, // N/A on iOS
          notifications: true, // N/A for step tracking
          batteryOptimized: true, // N/A on iOS
          motion: false, // Will be requested
          allGranted: false,
        };
      }
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }

    return {
      activityRecognition: false,
      notifications: false,
      batteryOptimized: false,
      motion: false,
      allGranted: false,
    };
  }

  /**
   * Request Activity Recognition permission (Android)
   */
  async requestActivityRecognition(): Promise<boolean> {
    const platform = Capacitor.getPlatform();

    if (platform !== 'android') {
      return true;
    }

    try {
      const result = await BackgroundStepTracking.requestAllPermissions();
      return result.activityRecognition;
    } catch (error) {
      console.error('Failed to request activity recognition:', error);
      return false;
    }
  }

  /**
   * Request Notification permission (Android 13+)
   */
  async requestNotifications(): Promise<boolean> {
    const platform = Capacitor.getPlatform();

    if (platform !== 'android') {
      return true;
    }

    try {
      const result = await BackgroundStepTracking.requestAllPermissions();
      return result.notifications;
    } catch (error) {
      console.error('Failed to request notifications:', error);
      return false;
    }
  }

  /**
   * Request Battery Optimization Exemption (Android)
   */
  async requestBatteryOptimization(): Promise<{ granted: boolean; manufacturer?: string }> {
    const platform = Capacitor.getPlatform();

    if (platform !== 'android') {
      return { granted: true };
    }

    try {
      const deviceInfo = await BackgroundStepTracking.getDeviceInfo();
      const result = await BackgroundStepTracking.requestBatteryOptimizationExemption();

      return {
        granted: result.granted,
        manufacturer: deviceInfo.manufacturer,
      };
    } catch (error) {
      console.error('Failed to request battery optimization exemption:', error);
      return { granted: false };
    }
  }

  /**
   * Request Motion permission (iOS)
   */
  async requestMotionPermission(): Promise<boolean> {
    const platform = Capacitor.getPlatform();

    if (platform !== 'ios') {
      return true;
    }

    try {
      const result = await BackgroundStepTracking.requestPermissions();
      return result.activityRecognition; // Will be mapped from iOS status
    } catch (error) {
      console.error('Failed to request motion permission:', error);
      return false;
    }
  }

  /**
   * Request all permissions sequentially
   */
  async requestAllPermissions(): Promise<{ success: boolean; failedPermissions: string[] }> {
    const platform = Capacitor.getPlatform();
    const failedPermissions: string[] = [];

    if (platform === 'web') {
      return { success: false, failedPermissions: ['Platform not supported'] };
    }

    try {
      if (platform === 'android') {
        // Request Activity Recognition + Notifications
        const permResult = await BackgroundStepTracking.requestAllPermissions();

        if (!permResult.activityRecognition) {
          failedPermissions.push('Activity Recognition');
        }
        if (!permResult.notifications) {
          failedPermissions.push('Notifications');
        }

        // Request Battery Optimization Exemption
        const batteryResult = await this.requestBatteryOptimization();
        if (!batteryResult.granted) {
          failedPermissions.push('Battery Optimization');
        }
      } else if (platform === 'ios') {
        // Request Motion Permission
        const motionGranted = await this.requestMotionPermission();
        if (!motionGranted) {
          failedPermissions.push('Motion & Fitness');
        }
      }

      return {
        success: failedPermissions.length === 0,
        failedPermissions,
      };
    } catch (error) {
      console.error('Failed to request all permissions:', error);
      return { success: false, failedPermissions: ['Unknown error'] };
    }
  }

  /**
   * Get permission statuses for UI display
   */
  async getPermissionStatuses(): Promise<PermissionStatus> {
    return this.checkAllPermissions();
  }

  /**
   * Open manufacturer-specific battery settings (Android)
   */
  async openBatterySettings(): Promise<void> {
    const platform = Capacitor.getPlatform();

    if (platform !== 'android') {
      return;
    }

    try {
      await BackgroundStepTracking.openManufacturerBatterySettings();
    } catch (error) {
      console.error('Failed to open battery settings:', error);
    }
  }

  /**
   * Get device-specific recommendations (Android)
   */
  async getDeviceRecommendations(): Promise<{ aggressive: boolean; manufacturer: string; recommendations: string[] }> {
    const platform = Capacitor.getPlatform();

    if (platform !== 'android') {
      return { aggressive: false, manufacturer: 'Unknown', recommendations: [] };
    }

    try {
      const result = await BackgroundStepTracking.hasAggressiveBatteryOptimization();
      return result;
    } catch (error) {
      console.error('Failed to get device recommendations:', error);
      return { aggressive: false, manufacturer: 'Unknown', recommendations: [] };
    }
  }

  /**
   * Start foreground service after permissions granted
   */
  async startForegroundService(): Promise<{ success: boolean; message: string }> {
    const platform = Capacitor.getPlatform();

    if (platform !== 'android') {
      // On iOS, start CMPedometer tracking
      try {
        const result = await BackgroundStepTracking.requestPermissions();
        if (result.activityRecognition) {
          return { success: true, message: 'Step tracking started' };
        }
        return { success: false, message: 'Motion permission denied' };
      } catch (error) {
        return { success: false, message: 'Failed to start tracking' };
      }
    }

    try {
      const result = await BackgroundStepTracking.startForegroundService({
        notificationTitle: 'Yogic Mile',
        notificationText: 'Tracking steps in background',
      });

      return result;
    } catch (error) {
      console.error('Failed to start foreground service:', error);
      return { success: false, message: 'Failed to start service' };
    }
  }

  /**
   * Save permission status to preferences
   */
  private async savePermissionStatus(status: PermissionStatus): Promise<void> {
    try {
      await Preferences.set({
        key: PERMISSIONS_KEY,
        value: JSON.stringify(status),
      });
    } catch (error) {
      console.error('Failed to save permission status:', error);
    }
  }
}

export const permissionManager = PermissionManager.getInstance();
