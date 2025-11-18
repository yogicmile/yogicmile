import { WebPlugin } from '@capacitor/core';
import type { BackgroundStepTrackingPlugin } from './AndroidBackgroundService';

/**
 * Web implementation (mock for development/testing)
 */
export class BackgroundStepTrackingWeb extends WebPlugin implements BackgroundStepTrackingPlugin {
  async requestAllPermissions(): Promise<{ activityRecognition: boolean; notifications: boolean; allGranted: boolean }> {
    console.log('Web: requestAllPermissions called');
    return {
      activityRecognition: false,
      notifications: false,
      allGranted: false,
    };
  }

  async startForegroundService(options: {
    notificationTitle: string;
    notificationText: string;
    icon?: string;
  }): Promise<{ success: boolean; message: string }> {
    console.log('Web: startForegroundService called', options);
    return {
      success: false,
      message: 'Foreground service not available on web',
    };
  }

  async stopForegroundService(): Promise<{ success: boolean }> {
    console.log('Web: stopForegroundService called');
    return { success: false };
  }

  async isServiceRunning(): Promise<{ running: boolean }> {
    return { running: false };
  }

  async requestBatteryOptimizationExemption(): Promise<{
    granted: boolean;
    message: string;
  }> {
    return {
      granted: false,
      message: 'Not available on web',
    };
  }

  async isBatteryOptimizationDisabled(): Promise<{ disabled: boolean }> {
    return { disabled: true };
  }

  async openManufacturerBatterySettings(): Promise<{ opened: boolean }> {
    return { opened: false };
  }

  async openAppSettings(): Promise<void> {
    console.log('Web: openAppSettings called - not available on web');
  }

  async getStepCount(): Promise<{ steps: number; timestamp: number }> {
    return { steps: 0, timestamp: Date.now() };
  }

  async addStepListener(
    callback: (data: { steps: number; timestamp: number }) => void
  ): Promise<string> {
    console.log('Web: addStepListener called');
    return 'web_listener_1';
  }

  async removeStepListener(options: { id: string }): Promise<void> {
    console.log('Web: removeStepListener called', options);
  }

  async syncWithGoogleFit(): Promise<{ success: boolean; steps: number }> {
    return { success: false, steps: 0 };
  }

  async isGoogleFitAvailable(): Promise<{ available: boolean }> {
    return { available: false };
  }

  async requestGoogleFitPermission(): Promise<{ granted: boolean }> {
    return { granted: false };
  }

  async getDeviceInfo(): Promise<{
    manufacturer: string;
    model: string;
    androidVersion: string;
    apiLevel: number;
  }> {
    return {
      manufacturer: 'Web Browser',
      model: navigator.userAgent,
      androidVersion: 'N/A',
      apiLevel: 0,
    };
  }

  async hasAggressiveBatteryOptimization(): Promise<{
    aggressive: boolean;
    manufacturer: string;
    recommendations: string;
  }> {
    return {
      aggressive: false,
      manufacturer: 'Web',
      recommendations: '',
    };
  }
}
