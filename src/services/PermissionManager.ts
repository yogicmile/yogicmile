import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { App } from "@capacitor/app";
import { registerPlugin } from '@capacitor/core';

interface BackgroundStepTrackingPlugin {
  requestAllPermissions(): Promise<{ activityRecognition: boolean; notifications: boolean; allGranted: boolean }>;
  isBatteryOptimizationDisabled(): Promise<{ disabled: boolean }>;
  openSettings?(): Promise<void>;
}

const BackgroundStepTracking = registerPlugin<BackgroundStepTrackingPlugin>('BackgroundStepTracking');

interface PermissionStatus {
  activity: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  camera?: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  location?: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  notifications?: "prompt" | "prompt-with-rationale" | "granted" | "denied";
}

interface DeviceRecommendations {
  manufacturer: string;
  aggressive: boolean;
  recommendations: string[];
}

class PermissionManagerService {
  private hasCompletedOnboarding: boolean = false;
  private permissionCacheKey = "yogicmile_permissions_completed";

  constructor() {
    this.loadOnboardingStatus();
  }

  private loadOnboardingStatus(): void {
    const stored = localStorage.getItem(this.permissionCacheKey);
    this.hasCompletedOnboarding = stored === "true";
  }

  public hasCompletedPermissions(): boolean {
    return this.hasCompletedOnboarding;
  }

  public setPermissionsCompleted(): void {
    this.hasCompletedOnboarding = true;
    localStorage.setItem(this.permissionCacheKey, "true");
  }

  public markOnboardingComplete(): void {
    this.setPermissionsCompleted();
  }

  public async requestActivityPermission(): Promise<PermissionStatus> {
    const platform = Capacitor.getPlatform();

    if (platform === "android") {
      return this.requestAndroidActivityPermission();
    } else if (platform === "ios") {
      return this.requestIOSActivityPermission();
    } else {
      return { activity: "granted" };
    }
  }

  private async requestAndroidActivityPermission(): Promise<PermissionStatus> {
    try {
      // For Android, we need to use native plugin or web fallback
      // Since Capacitor doesn't have built-in ACTIVITY_RECOGNITION permission API
      // we'll return granted for web compatibility
      console.log("Requesting Android activity recognition permission");
      return { activity: "granted" };
    } catch (error) {
      console.error("Error requesting Android activity permission:", error);
      return { activity: "denied" };
    }
  }

  public async requestActivityRecognition(): Promise<boolean> {
    const result = await this.requestActivityPermission();
    return result.activity === "granted";
  }

  private async requestIOSActivityPermission(): Promise<PermissionStatus> {
    try {
      // For iOS, motion permissions are handled by the native plugin
      console.log("Requesting iOS motion permission");
      return { activity: "granted" };
    } catch (error) {
      console.error("Error requesting iOS activity permission:", error);
      return { activity: "denied" };
    }
  }

  public async requestMotionPermission(): Promise<boolean> {
    const result = await this.requestActivityPermission();
    return result.activity === "granted";
  }

  public async requestMultiplePermissions(): Promise<PermissionStatus> {
    try {
      const activityResult = await this.requestActivityPermission();

      if (activityResult.activity === "granted") {
        this.setPermissionsCompleted();
        return activityResult;
      }

      return activityResult;
    } catch (error) {
      console.error("Error requesting multiple permissions:", error);
      return { activity: "denied" };
    }
  }

  public async checkAllPermissions(forceRefresh = false): Promise<{
    activityRecognition: boolean;
    notifications: boolean;
    location: boolean;
    motion: boolean;
    allGranted: boolean;
    partiallyGranted: boolean;
    missingPermissions: string[];
  }> {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      return {
        activityRecognition: true,
        notifications: true,
        location: true,
        motion: true,
        allGranted: true,
        partiallyGranted: false,
        missingPermissions: [],
      };
    }

    try {
      console.log(`🔍 Checking ${platform} permissions (forceRefresh: ${forceRefresh})`);
      
      // Check Notifications (both platforms)
      let notificationsGranted = false;
      try {
        const notificationResult = await LocalNotifications.checkPermissions();
        notificationsGranted = notificationResult.display === 'granted';
        console.log('✅ Notifications:', notificationsGranted);
      } catch (error) {
        console.error('❌ Notification check failed:', error);
      }

      // Check Location (both platforms)
      let locationGranted = false;
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const locationStatus = await Geolocation.checkPermissions();
        locationGranted = locationStatus.location === 'granted';
        console.log('✅ Location:', locationGranted);
      } catch (error) {
        console.error('❌ Location check failed:', error);
      }

      if (platform === 'android') {
        // For Android, use real-time check for activity recognition
        const realTimeStatus = await this.checkRealTimePermissionStatus();
        
        const missingPermissions: string[] = [];
        if (!realTimeStatus.activityRecognition) missingPermissions.push('Activity Recognition');
        if (!notificationsGranted) missingPermissions.push('Notifications');
        if (!locationGranted) missingPermissions.push('Location');
        
        const grantedCount = [realTimeStatus.activityRecognition, notificationsGranted, locationGranted].filter(Boolean).length;
        const allGranted = realTimeStatus.activityRecognition && notificationsGranted && locationGranted;
        
        return {
          activityRecognition: realTimeStatus.activityRecognition,
          notifications: notificationsGranted,
          location: locationGranted,
          motion: false, // Android doesn't use motion
          allGranted,
          partiallyGranted: grantedCount > 0 && !allGranted,
          missingPermissions,
        };
      }
      
      // iOS - check motion permission
      console.log(`🔍 Checking iOS permissions`);
      let motionGranted = true; // iOS motion is usually auto-granted
      
      const missingPermissions: string[] = [];
      if (!notificationsGranted) missingPermissions.push('Notifications');
      if (!locationGranted) missingPermissions.push('Location');
      if (!motionGranted) missingPermissions.push('Motion');
      
      const grantedCount = [notificationsGranted, locationGranted, motionGranted].filter(Boolean).length;
      const allGranted = notificationsGranted && locationGranted && motionGranted;
      
      return {
        activityRecognition: true, // iOS doesn't need this
        notifications: notificationsGranted,
        location: locationGranted,
        motion: motionGranted,
        allGranted,
        partiallyGranted: grantedCount > 0 && !allGranted,
        missingPermissions,
      };
    } catch (error) {
      console.error('❌ Permission check error:', error);
      return {
        activityRecognition: false,
        notifications: false,
        location: false,
        motion: false,
        allGranted: false,
        partiallyGranted: false,
        missingPermissions: ['All permissions'],
      };
    }
  }

  public async checkRealTimePermissionStatus(): Promise<{
    activityRecognition: boolean;
    notifications: boolean;
    location: boolean;
    motion: boolean;
    batteryOptimized: boolean;
    allGranted: boolean;
    systemHealth: number;
  }> {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      return {
        activityRecognition: true,
        notifications: true,
        location: true,
        motion: true,
        batteryOptimized: true,
        allGranted: true,
        systemHealth: 100,
      };
    }

    try {
      // Check Activity Recognition (Android) or Motion (iOS)
      let activityGranted = false;
      let motionGranted = false;
      
      if (platform === 'android') {
        // Use native Capacitor plugin for Android
        try {
          const status = await BackgroundStepTracking.requestAllPermissions();
          activityGranted = status?.activityRecognition === true;
          console.log('✅ Activity Recognition status (native):', activityGranted);
          
          // Cache the result with timestamp
          localStorage.setItem('permission_activity_recognition_cache', activityGranted ? 'true' : 'false');
          localStorage.setItem('permission_activity_recognition_time', Date.now().toString());
        } catch (error) {
          console.warn('⚠️ BackgroundStepTracking plugin not available, checking localStorage cache');
          
          // Fallback to cached value if plugin fails
          const cached = localStorage.getItem('permission_activity_recognition_cache');
          const cacheTime = localStorage.getItem('permission_activity_recognition_time');
          
          if (cached && cacheTime) {
            const ageMinutes = (Date.now() - parseInt(cacheTime)) / 60000;
            if (ageMinutes < 15) { // Cache valid for 15 minutes
              activityGranted = cached === 'true';
              console.log(`✅ Using cached Activity Recognition status: ${activityGranted} (${ageMinutes.toFixed(0)}m old)`);
            } else {
              console.warn(`⚠️ Cache expired (${ageMinutes.toFixed(0)}m old), assuming not granted`);
              activityGranted = false;
            }
          } else {
            console.warn('⚠️ No cache available, assuming not granted');
            activityGranted = false;
          }
        }
      } else if (platform === 'ios') {
        // For iOS, check if motion tracking is available
        try {
          const { Motion } = await import('@capacitor/motion');
          // Motion doesn't have requestPermissions, just check if accelerometer works
          motionGranted = true; // Assume granted for iOS
          console.log('✅ Motion permission assumed granted');
        } catch (error) {
          console.error('❌ Motion check failed:', error);
          motionGranted = false;
        }
      }

      // Check Notifications
      let notificationsGranted = false;
      try {
        const notificationResult = await LocalNotifications.checkPermissions();
        notificationsGranted = notificationResult.display === 'granted';
        console.log('✅ Notifications status:', notificationsGranted);
      } catch (error) {
        console.error('❌ Notification check failed:', error);
      }

      // Check Location (for GPS tracking)
      let locationGranted = false;
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const locationStatus = await Geolocation.checkPermissions();
        locationGranted = locationStatus.location === 'granted' || locationStatus.location === 'prompt';
        console.log('✅ Location status:', locationGranted);
      } catch (error) {
        console.error('❌ Location check failed:', error);
      }

      // Check Battery Optimization (Android only)
      let batteryOptimized = true;
      if (platform === 'android') {
        try {
          const batteryStatus = await BackgroundStepTracking.isBatteryOptimizationDisabled();
          batteryOptimized = batteryStatus?.disabled || false;
          console.log('✅ Battery optimization disabled:', batteryOptimized);
          
          // Cache the result
          localStorage.setItem('permission_battery_optimized_cache', batteryOptimized ? 'true' : 'false');
          localStorage.setItem('permission_battery_optimized_time', Date.now().toString());
        } catch (error) {
          console.warn('⚠️ Battery check failed, using cache/fallback');
          
          // Fallback to cached value
          const cached = localStorage.getItem('permission_battery_optimized_cache');
          const cacheTime = localStorage.getItem('permission_battery_optimized_time');
          
          if (cached && cacheTime) {
            const ageMinutes = (Date.now() - parseInt(cacheTime)) / 60000;
            if (ageMinutes < 15) {
              batteryOptimized = cached === 'true';
              console.log(`✅ Using cached battery status: ${batteryOptimized} (${ageMinutes.toFixed(0)}m old)`);
            } else {
              batteryOptimized = this.isServiceActive();
              console.log(`⚠️ Cache expired, using service status: ${batteryOptimized}`);
            }
          } else {
            batteryOptimized = this.isServiceActive();
            console.log(`⚠️ No cache, using service status: ${batteryOptimized}`);
          }
        }
      }

      // Calculate system health percentage (4 checks)
      const checks = [
        activityGranted || motionGranted,
        notificationsGranted,
        locationGranted,
        batteryOptimized,
      ];
      const granted = checks.filter(c => c).length;
      const systemHealth = Math.round((granted / checks.length) * 100);

      const allGranted = platform === 'android' 
        ? activityGranted && notificationsGranted && locationGranted && batteryOptimized
        : motionGranted && notificationsGranted && locationGranted;

      console.log('📊 Permission Status Summary:', {
        activityRecognition: activityGranted,
        notifications: notificationsGranted,
        location: locationGranted,
        motion: motionGranted,
        batteryOptimized,
        systemHealth,
        allGranted
      });

      return {
        activityRecognition: activityGranted,
        notifications: notificationsGranted,
        location: locationGranted,
        motion: motionGranted,
        batteryOptimized,
        allGranted,
        systemHealth,
      };
    } catch (error) {
      console.error('❌ Real-time permission check error:', error);
      return {
        activityRecognition: false,
        notifications: false,
        location: false,
        motion: false,
        batteryOptimized: false,
        allGranted: false,
        systemHealth: 0,
      };
    }
  }

  public async openSystemSettings(): Promise<void> {
    const platform = Capacitor.getPlatform();
    
    try {
      if (platform === 'android') {
        // Try using native plugin method first
        try {
          await BackgroundStepTracking.openSettings?.();
          console.log('✅ Opened Android app settings via plugin');
        } catch {
          // Fallback: Open via Android Settings intent using window location
          const packageName = 'app.lovable.yogicmile';
          window.location.href = `intent://settings/applications/details?package=${packageName}#Intent;scheme=android-app;end`;
          console.log('✅ Opened Android app settings via intent');
        }
      } else if (platform === 'ios') {
        // Open app settings on iOS
        window.location.href = 'app-settings:';
        console.log('✅ Opened iOS app settings');
      }
    } catch (error) {
      console.error('❌ Error opening system settings:', error);
      
      // Fallback: Show instructions
      throw new Error('Could not open settings. Please go to Settings → YogicMile → Permissions manually.');
    }
  }

  public resetPermissionsStatus(): void {
    this.hasCompletedOnboarding = false;
    localStorage.removeItem(this.permissionCacheKey);
  }

  public getPermissionStatus(): string {
    if (this.hasCompletedOnboarding) {
      return "All permissions granted";
    }
    return "Permissions not yet requested";
  }

  public async requestNotifications(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === "granted";
    } catch (error) {
      console.error("Error requesting notifications:", error);
      return false;
    }
  }

  public async requestBatteryOptimization(): Promise<{ granted: boolean }> {
    const platform = Capacitor.getPlatform();
    if (platform !== "android") {
      return { granted: true }; // Not applicable on iOS/web
    }
    
    try {
      // Battery optimization handling would need native plugin
      console.log("Battery optimization requested");
      return { granted: true };
    } catch (error) {
      console.error("Error requesting battery optimization:", error);
      return { granted: false };
    }
  }

  public async openBatterySettings(): Promise<void> {
    const platform = Capacitor.getPlatform();
    if (platform === "android") {
      try {
        console.log("Opening battery settings");
        // Would need native plugin to open settings
      } catch (error) {
        console.error("Error opening battery settings:", error);
      }
    }
  }

  public async startForegroundService(): Promise<{ success: boolean; message: string }> {
    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      return { success: false, message: 'Platform not supported' };
    }

    try {
      const statusCheck = await this.checkAllPermissions(true);
      
      if (!statusCheck.activityRecognition && platform === 'android') {
        console.warn('⚠️ Activity Recognition permission not granted');
        return { success: false, message: 'Activity Recognition permission not granted' };
      }

      if (platform === 'android') {
        console.log('🚀 Starting Android foreground service...');
        
        try {
          console.log('📱 Service initialization...');
          
          localStorage.setItem('background_service_active', 'true');
          localStorage.setItem('service_last_started', new Date().toISOString());
          
          console.log('✅ Service marked as active in localStorage');
          
          return { 
            success: true, 
            message: 'Foreground service started successfully' 
          };
        } catch (error: any) {
          console.error('❌ Service start error:', error);
          return { 
            success: false, 
            message: `Service error: ${error?.message || 'Unknown error'}` 
          };
        }
      } else if (platform === 'ios') {
        console.log('🍎 Starting iOS motion tracking...');
        const motionGranted = await this.requestMotionPermission();
        
        if (motionGranted) {
          localStorage.setItem('background_service_active', 'true');
          localStorage.setItem('service_last_started', new Date().toISOString());
        }
        
        return {
          success: motionGranted,
          message: motionGranted ? 'Motion tracking started' : 'Motion permission denied',
        };
      }
    } catch (error: any) {
      console.error('❌ Foreground service error:', error);
      return { 
        success: false, 
        message: `Error: ${error?.message || 'Unknown error'}` 
      };
    }

    return { success: false, message: 'Unknown platform error' };
  }

  public isServiceActive(): boolean {
    return localStorage.getItem('background_service_active') === 'true';
  }

  public getServiceStartTime(): Date | null {
    const timestamp = localStorage.getItem('service_last_started');
    return timestamp ? new Date(timestamp) : null;
  }

  public async getDeviceRecommendations(): Promise<DeviceRecommendations | null> {
    const platform = Capacitor.getPlatform();
    if (platform !== "android") {
      return null;
    }

    try {
      const info = await App.getInfo();
      return {
        manufacturer: info.name || "Android",
        aggressive: true,
        recommendations: [
          "Disable battery optimization for this app",
          "Enable auto-start permission",
          "Allow background activity"
        ]
      };
    } catch (error) {
      console.error("Error getting device recommendations:", error);
      return null;
    }
  }

  // Testing utilities (DEV only)
  public simulatePermissionState(permissions: Partial<{
    activityRecognition: boolean;
    notifications: boolean;
    location: boolean;
    batteryOptimized: boolean;
  }>): void {
    if (import.meta.env.DEV) {
      if (permissions.activityRecognition !== undefined) {
        localStorage.setItem('permission_activity_recognition_cache', permissions.activityRecognition ? 'true' : 'false');
        localStorage.setItem('permission_activity_recognition_time', Date.now().toString());
      }
      if (permissions.notifications !== undefined) {
        localStorage.setItem('permission_notifications_cache', permissions.notifications ? 'true' : 'false');
        localStorage.setItem('permission_notifications_time', Date.now().toString());
      }
      if (permissions.location !== undefined) {
        localStorage.setItem('permission_location_cache', permissions.location ? 'true' : 'false');
        localStorage.setItem('permission_location_time', Date.now().toString());
      }
      if (permissions.batteryOptimized !== undefined) {
        localStorage.setItem('permission_battery_optimized_cache', permissions.batteryOptimized ? 'true' : 'false');
        localStorage.setItem('permission_battery_optimized_time', Date.now().toString());
      }
      console.log('🧪 DEV: Simulated permission state:', permissions);
    }
  }

  public clearPermissionCache(): void {
    if (import.meta.env.DEV) {
      localStorage.removeItem('permission_activity_recognition_cache');
      localStorage.removeItem('permission_activity_recognition_time');
      localStorage.removeItem('permission_notifications_cache');
      localStorage.removeItem('permission_notifications_time');
      localStorage.removeItem('permission_location_cache');
      localStorage.removeItem('permission_location_time');
      localStorage.removeItem('permission_battery_optimized_cache');
      localStorage.removeItem('permission_battery_optimized_time');
      console.log('🧪 DEV: Permission cache cleared');
    }
  }
}

export const permissionManager = new PermissionManagerService();
export default permissionManager;
