import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

/**
 * Android Background Step Tracking Service
 * Handles foreground service, battery optimization, and continuous tracking
 */

export interface BackgroundStepTrackingPlugin {
  /**
   * Request all required permissions at once
   */
  requestAllPermissions(): Promise<{ activityRecognition: boolean; notifications: boolean; allGranted: boolean }>;

  /**
   * Start foreground service with persistent notification
   */
  startForegroundService(options: {
    notificationTitle: string;
    notificationText: string;
    icon?: string;
  }): Promise<{ success: boolean; message: string }>;

  /**
   * Stop foreground service
   */
  stopForegroundService(): Promise<{ success: boolean }>;

  /**
   * Check if service is running
   */
  isServiceRunning(): Promise<{ running: boolean }>;

  /**
   * Request battery optimization exemption
   */
  requestBatteryOptimizationExemption(): Promise<{ granted: boolean; message: string }>;

  /**
   * Check if battery optimization is disabled
   */
  isBatteryOptimizationDisabled(): Promise<{ disabled: boolean }>;

  /**
   * Open manufacturer-specific battery settings
   */
  openManufacturerBatterySettings(): Promise<{ opened: boolean }>;

  /**
   * Get current step count from service
   */
  getStepCount(): Promise<{ steps: number; timestamp: number }>;

  /**
   * Subscribe to step count updates
   */
  addStepListener(callback: (data: { steps: number; timestamp: number }) => void): Promise<string>;

  /**
   * Remove step listener
   */
  removeStepListener(options: { id: string }): Promise<void>;

  /**
   * Sync with Google Fit in background
   */
  syncWithGoogleFit(): Promise<{ success: boolean; steps: number }>;

  /**
   * Check if Google Fit is available
   */
  isGoogleFitAvailable(): Promise<{ available: boolean }>;

  /**
   * Request Google Fit permissions
   */
  requestGoogleFitPermission(): Promise<{ granted: boolean }>;

  /**
   * Detect device manufacturer
   */
  getDeviceInfo(): Promise<{
    manufacturer: string;
    model: string;
    androidVersion: string;
    apiLevel: number;
  }>;

  /**
   * Check if running on problematic manufacturer (aggressive battery optimization)
   */
  hasAggressiveBatteryOptimization(): Promise<{
    aggressive: boolean;
    manufacturer: string;
    recommendations: string;
  }>;
}

const BackgroundStepTracking = registerPlugin<BackgroundStepTrackingPlugin>(
  'BackgroundStepTracking',
  {
    web: () => import('./BackgroundStepTrackingWeb').then(m => new m.BackgroundStepTrackingWeb()),
  }
);

export { BackgroundStepTracking };

export class AndroidBackgroundStepService {
  private static instance: AndroidBackgroundStepService;
  private listeners: Map<string, (data: any) => void> = new Map();
  private isServiceActive = false;

  static getInstance(): AndroidBackgroundStepService {
    if (!AndroidBackgroundStepService.instance) {
      AndroidBackgroundStepService.instance = new AndroidBackgroundStepService();
    }
    return AndroidBackgroundStepService.instance;
  }

  /**
   * Initialize and start background tracking service
   */
  async startTracking(): Promise<{ success: boolean; message: string }> {
    if (Capacitor.getPlatform() !== 'android') {
      return {
        success: false,
        message: 'Background service only available on Android',
      };
    }

    try {
      // Request permissions first
      const permResult = await BackgroundStepTracking.requestAllPermissions();
      
      if (!permResult.allGranted) {
        return {
          success: false,
          message: 'Required permissions not granted',
        };
      }

      // Check device info
      const deviceInfo = await BackgroundStepTracking.getDeviceInfo();
      console.log('Device Info:', deviceInfo);

      // Check if manufacturer has aggressive battery optimization
      const batteryCheck = await BackgroundStepTracking.hasAggressiveBatteryOptimization();
      
      if (batteryCheck.aggressive) {
        console.warn(`Aggressive battery optimization detected: ${batteryCheck.manufacturer}`);
        const recs = typeof batteryCheck.recommendations === 'string' 
          ? batteryCheck.recommendations.split('|') 
          : batteryCheck.recommendations;
        console.log('Recommendations:', recs);
      }

      // Check if battery optimization is disabled
      const batteryStatus = await BackgroundStepTracking.isBatteryOptimizationDisabled();
      
      if (!batteryStatus.disabled) {
        // Request exemption
        const exemptionResult = await BackgroundStepTracking.requestBatteryOptimizationExemption();
        
        if (!exemptionResult.granted) {
          console.log('Battery optimization exemption not granted, opening settings');
        }
      }

      // Start foreground service
      const serviceResult = await BackgroundStepTracking.startForegroundService({
        notificationTitle: 'Yogic Mile',
        notificationText: 'Tracking steps in background',
      });

      if (!serviceResult.success) {
        return {
          success: false,
          message: serviceResult.message,
        };
      }

      this.isServiceActive = true;

      return {
        success: true,
        message: 'Background step tracking started successfully',
      };
    } catch (error) {
      console.error('Failed to start background tracking:', error);
      return {
        success: false,
        message: `Error: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Stop background tracking service
   */
  async stopTracking(): Promise<{ success: boolean }> {
    if (Capacitor.getPlatform() !== 'android') {
      return { success: false };
    }

    try {
      await BackgroundStepTracking.stopForegroundService();
      this.isServiceActive = false;
      this.listeners.clear();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to stop background tracking:', error);
      return { success: false };
    }
  }

  /**
   * Subscribe to step count updates from background service
   */
  async subscribeToStepUpdates(
    callback: (data: { steps: number; timestamp: number }) => void
  ): Promise<string> {
    const listenerId = `listener_${Date.now()}`;
    this.listeners.set(listenerId, callback);

    await BackgroundStepTracking.addStepListener(callback);

    return listenerId;
  }

  /**
   * Unsubscribe from step updates
   */
  async unsubscribeFromStepUpdates(listenerId: string): Promise<void> {
    if (this.listeners.has(listenerId)) {
      await BackgroundStepTracking.removeStepListener({ id: listenerId });
      this.listeners.delete(listenerId);
    }
  }

  /**
   * Get current step count
   */
  async getCurrentSteps(): Promise<number> {
    if (Capacitor.getPlatform() !== 'android') {
      return 0;
    }

    try {
      const result = await BackgroundStepTracking.getStepCount();
      return result.steps;
    } catch (error) {
      console.error('Failed to get step count:', error);
      return 0;
    }
  }

  /**
   * Sync with Google Fit in background
   */
  async syncGoogleFit(): Promise<{ success: boolean; steps: number }> {
    if (Capacitor.getPlatform() !== 'android') {
      return { success: false, steps: 0 };
    }

    try {
      const result = await BackgroundStepTracking.syncWithGoogleFit();
      return result;
    } catch (error) {
      console.error('Failed to sync with Google Fit:', error);
      return { success: false, steps: 0 };
    }
  }

  /**
   * Check if service is currently running
   */
  async isRunning(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') {
      return false;
    }

    try {
      const result = await BackgroundStepTracking.isServiceRunning();
      return result.running;
    } catch (error) {
      console.error('Failed to check service status:', error);
      return false;
    }
  }

  /**
   * Open manufacturer-specific battery optimization settings
   */
  async openBatterySettings(): Promise<void> {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    await BackgroundStepTracking.openManufacturerBatterySettings();
  }

  /**
   * Get device-specific recommendations
   */
  async getDeviceRecommendations(): Promise<string[]> {
    if (Capacitor.getPlatform() !== 'android') {
      return [];
    }

    try {
      const result = await BackgroundStepTracking.hasAggressiveBatteryOptimization();
      const recs = result.recommendations || '';
      const recsArray = typeof recs === 'string' ? recs.split('|') : recs;
      return recsArray.filter(r => r.trim().length > 0);
    } catch (error) {
      return [];
    }
  }
}

export const androidBackgroundService = AndroidBackgroundStepService.getInstance();
