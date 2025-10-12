import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Google Fit Integration Service
 * Handles automatic step syncing with Google Fit
 * Falls back to hardware sensors if unavailable
 */

export interface GoogleFitStepData {
  steps: number;
  startTime: number;
  endTime: number;
  source: string;
  dataStreamId: string;
}

export interface GoogleFitSyncResult {
  success: boolean;
  steps: number;
  lastSyncTime: number;
  source: 'google_fit' | 'sensor' | 'merged';
  error?: string;
}

export interface GoogleFitPermissions {
  granted: boolean;
  accountConnected: boolean;
  canReadSteps: boolean;
  canReadDistance: boolean;
}

const STORAGE_KEYS = {
  GOOGLE_FIT_ENABLED: 'google_fit_enabled',
  LAST_SYNC_TIME: 'google_fit_last_sync',
  GOOGLE_FIT_STEPS: 'google_fit_steps',
  SYNC_PREFERENCES: 'google_fit_sync_prefs',
};

export class GoogleFitService {
  private static instance: GoogleFitService;
  private isConnected = false;
  private autoSyncEnabled = true;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncListeners: Array<(data: GoogleFitSyncResult) => void> = [];

  static getInstance(): GoogleFitService {
    if (!GoogleFitService.instance) {
      GoogleFitService.instance = new GoogleFitService();
    }
    return GoogleFitService.instance;
  }

  /**
   * Initialize Google Fit and request permissions
   */
  async initialize(): Promise<{ success: boolean; message: string }> {
    if (Capacitor.getPlatform() !== 'android') {
      return {
        success: false,
        message: 'Google Fit only available on Android',
      };
    }

    try {
      // Check if Google Play Services available
      const available = await this.isGoogleFitAvailable();
      if (!available) {
        return {
          success: false,
          message: 'Google Play Services not available',
        };
      }

      // Request permissions
      const permissions = await this.requestPermissions();
      if (!permissions.granted) {
        return {
          success: false,
          message: 'Google Fit permissions not granted',
        };
      }

      // Connect to Google Fit
      const connected = await this.connectToGoogleFit();
      if (!connected) {
        return {
          success: false,
          message: 'Failed to connect to Google Fit',
        };
      }

      this.isConnected = true;

      // Load sync preferences
      await this.loadSyncPreferences();

      // Start auto-sync if enabled
      if (this.autoSyncEnabled) {
        this.startAutoSync();
      }

      return {
        success: true,
        message: 'Google Fit connected successfully',
      };
    } catch (error) {
      console.error('Google Fit initialization failed:', error);
      return {
        success: false,
        message: `Error: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Check if Google Fit is available on device
   */
  async isGoogleFitAvailable(): Promise<boolean> {
    if (Capacitor.getPlatform() !== 'android') {
      return false;
    }

    try {
      // In production, this would check for Google Play Services
      // For now, return true on Android
      return true;
    } catch (error) {
      console.error('Failed to check Google Fit availability:', error);
      return false;
    }
  }

  /**
   * Request Google Fit permissions
   */
  async requestPermissions(): Promise<GoogleFitPermissions> {
    if (Capacitor.getPlatform() !== 'android') {
      return {
        granted: false,
        accountConnected: false,
        canReadSteps: false,
        canReadDistance: false,
      };
    }

    try {
      // In production, this would request actual Google Fit permissions
      // Required scopes:
      // - FITNESS_OPTIONS_READ_STEPS_HISTORY
      // - FITNESS_OPTIONS_READ_DISTANCE_HISTORY
      // - FITNESS_OPTIONS_READ_ACTIVITY_HISTORY

      // For now, simulate permission grant
      const permissions: GoogleFitPermissions = {
        granted: true,
        accountConnected: true,
        canReadSteps: true,
        canReadDistance: true,
      };

      await Preferences.set({
        key: STORAGE_KEYS.GOOGLE_FIT_ENABLED,
        value: 'true',
      });

      return permissions;
    } catch (error) {
      console.error('Permission request failed:', error);
      return {
        granted: false,
        accountConnected: false,
        canReadSteps: false,
        canReadDistance: false,
      };
    }
  }

  /**
   * Connect to Google Fit API
   */
  private async connectToGoogleFit(): Promise<boolean> {
    try {
      // In production, this would:
      // 1. Sign in with Google account
      // 2. Request Fitness API access
      // 3. Establish connection

      // Simulate successful connection
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Failed to connect to Google Fit:', error);
      return false;
    }
  }

  /**
   * Sync steps from Google Fit
   */
  async syncSteps(): Promise<GoogleFitSyncResult> {
    if (!this.isConnected) {
      return {
        success: false,
        steps: 0,
        lastSyncTime: Date.now(),
        source: 'sensor',
        error: 'Not connected to Google Fit',
      };
    }

    try {
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      // Fetch steps from Google Fit for today
      const googleFitSteps = await this.fetchStepsFromGoogleFit(
        startOfDay.getTime(),
        now
      );

      // Get local sensor steps
      const localSteps = await this.getLocalSensorSteps();

      // Merge data intelligently
      const mergedSteps = this.mergeStepData(googleFitSteps, localSteps);

      // Save sync time
      await Preferences.set({
        key: STORAGE_KEYS.LAST_SYNC_TIME,
        value: now.toString(),
      });

      // Save Google Fit steps
      await Preferences.set({
        key: STORAGE_KEYS.GOOGLE_FIT_STEPS,
        value: mergedSteps.toString(),
      });

      const result: GoogleFitSyncResult = {
        success: true,
        steps: mergedSteps,
        lastSyncTime: now,
        source: googleFitSteps > 0 ? 'merged' : 'sensor',
      };

      // Notify listeners
      this.notifyListeners(result);

      return result;
    } catch (error) {
      console.error('Google Fit sync failed:', error);
      return {
        success: false,
        steps: 0,
        lastSyncTime: Date.now(),
        source: 'sensor',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Fetch steps from Google Fit API
   */
  private async fetchStepsFromGoogleFit(
    startTime: number,
    endTime: number
  ): Promise<number> {
    try {
      // In production, this would call Google Fitness REST API:
      // GET https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate
      //
      // Request body:
      // {
      //   "aggregateBy": [{
      //     "dataTypeName": "com.google.step_count.delta",
      //     "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
      //   }],
      //   "bucketByTime": { "durationMillis": 86400000 },
      //   "startTimeMillis": startTime,
      //   "endTimeMillis": endTime
      // }

      // For now, simulate fetching steps
      // In real implementation, parse the response and sum up step counts
      const simulatedSteps = Math.floor(Math.random() * 2000) + 1000;
      return simulatedSteps;
    } catch (error) {
      console.error('Failed to fetch from Google Fit:', error);
      return 0;
    }
  }

  /**
   * Get steps from local hardware sensor
   */
  private async getLocalSensorSteps(): Promise<number> {
    try {
      const { value } = await Preferences.get({ key: 'android_daily_steps' });
      if (value) {
        const data = JSON.parse(value);
        return data.steps || 0;
      }
      return 0;
    } catch (error) {
      console.error('Failed to get local sensor steps:', error);
      return 0;
    }
  }

  /**
   * Merge Google Fit and sensor data intelligently
   */
  private mergeStepData(googleFitSteps: number, sensorSteps: number): number {
    // Strategy: Use the higher value, as it's more likely to be accurate
    // Google Fit aggregates from multiple sources (phone, watch, etc.)
    // But sensor is more real-time

    if (googleFitSteps === 0) {
      // Google Fit unavailable, use sensor
      return sensorSteps;
    }

    if (sensorSteps === 0) {
      // Sensor unavailable, use Google Fit
      return googleFitSteps;
    }

    // Both available - use maximum
    // This accounts for steps taken on connected devices
    return Math.max(googleFitSteps, sensorSteps);
  }

  /**
   * Start automatic background sync
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      return; // Already running
    }

    // Sync every 2 minutes
    this.syncInterval = setInterval(async () => {
      if (this.isConnected && this.autoSyncEnabled) {
        await this.syncSteps();
      }
    }, 120000); // 2 minutes

    console.log('Google Fit auto-sync started');
  }

  /**
   * Stop automatic background sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('Google Fit auto-sync stopped');
  }

  /**
   * Sync on app lifecycle events
   */
  async syncOnAppResume(): Promise<GoogleFitSyncResult> {
    console.log('Syncing Google Fit on app resume...');
    return await this.syncSteps();
  }

  async syncOnAppLaunch(): Promise<GoogleFitSyncResult> {
    console.log('Syncing Google Fit on app launch...');
    return await this.syncSteps();
  }

  /**
   * Subscribe to sync updates
   */
  addSyncListener(callback: (data: GoogleFitSyncResult) => void): string {
    const listenerId = `listener_${Date.now()}`;
    this.syncListeners.push(callback);
    return listenerId;
  }

  /**
   * Unsubscribe from sync updates
   */
  removeSyncListener(callback: (data: GoogleFitSyncResult) => void): void {
    this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners of sync result
   */
  private notifyListeners(result: GoogleFitSyncResult): void {
    this.syncListeners.forEach(callback => callback(result));
  }

  /**
   * Load sync preferences
   */
  private async loadSyncPreferences(): Promise<void> {
    try {
      const { value } = await Preferences.get({
        key: STORAGE_KEYS.SYNC_PREFERENCES,
      });

      if (value) {
        const prefs = JSON.parse(value);
        this.autoSyncEnabled = prefs.autoSyncEnabled ?? true;
      }
    } catch (error) {
      console.error('Failed to load sync preferences:', error);
    }
  }

  /**
   * Save sync preferences
   */
  async setSyncPreferences(autoSync: boolean): Promise<void> {
    this.autoSyncEnabled = autoSync;

    await Preferences.set({
      key: STORAGE_KEYS.SYNC_PREFERENCES,
      value: JSON.stringify({ autoSyncEnabled: autoSync }),
    });

    if (autoSync) {
      this.startAutoSync();
    } else {
      this.stopAutoSync();
    }
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(): Promise<number> {
    try {
      const { value } = await Preferences.get({
        key: STORAGE_KEYS.LAST_SYNC_TIME,
      });
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get connection status
   */
  isGoogleFitConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from Google Fit
   */
  async disconnect(): Promise<void> {
    this.stopAutoSync();
    this.isConnected = false;
    this.syncListeners = [];

    await Preferences.remove({ key: STORAGE_KEYS.GOOGLE_FIT_ENABLED });
    await Preferences.remove({ key: STORAGE_KEYS.LAST_SYNC_TIME });
    await Preferences.remove({ key: STORAGE_KEYS.GOOGLE_FIT_STEPS });
  }
}

export const googleFitService = GoogleFitService.getInstance();
