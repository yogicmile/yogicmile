import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

export interface HealthData {
  steps: number;
  distance: number;
  activeEnergyBurned: number;
  timestamp: Date;
}

export interface HealthPermissions {
  granted: boolean;
  steps: boolean;
  distance: boolean;
  workouts: boolean;
}

export class HealthKitService {
  private static instance: HealthKitService;
  private permissions: HealthPermissions = {
    granted: false,
    steps: false,
    distance: false,
    workouts: false,
  };

  static getInstance(): HealthKitService {
    if (!HealthKitService.instance) {
      HealthKitService.instance = new HealthKitService();
    }
    return HealthKitService.instance;
  }

  async requestPermissions(): Promise<HealthPermissions> {
    if (!Capacitor.isNativePlatform()) {
      // Web fallback - simulate permissions for development
      this.permissions = {
        granted: true,
        steps: true,
        distance: true,
        workouts: true,
      };
      return this.permissions;
    }

    try {
      // For iOS HealthKit integration
      if (Capacitor.getPlatform() === 'ios') {
        // This would use @capacitor-community/health-kit in production
        // For now, simulate the permission request
        const granted = await this.simulatePermissionRequest();
        this.permissions = {
          granted,
          steps: granted,
          distance: granted,
          workouts: granted,
        };
      }
      
      // For Android Google Fit integration
      if (Capacitor.getPlatform() === 'android') {
        // This would use Google Fit API in production
        const granted = await this.simulatePermissionRequest();
        this.permissions = {
          granted,
          steps: granted,
          distance: granted,
          workouts: granted,
        };
      }

      await this.savePermissionsToStorage();
      return this.permissions;
    } catch (error) {
      console.error('Health permissions request failed:', error);
      return this.permissions;
    }
  }

  async getTodaySteps(): Promise<number> {
    if (!this.permissions.granted || !this.permissions.steps) {
      return 0;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        return await this.getNativeSteps();
      } else {
        // Web fallback - return simulated data
        return await this.getStoredSteps();
      }
    } catch (error) {
      console.error('Failed to get today steps:', error);
      return 0;
    }
  }

  async getStepHistory(days: number = 7): Promise<HealthData[]> {
    if (!this.permissions.granted) {
      return [];
    }

    try {
      const history: HealthData[] = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const steps = await this.getStepsForDate(date);
        history.push({
          steps,
          distance: steps * 0.0008, // Approximate distance in km
          activeEnergyBurned: steps * 0.04, // Approximate calories
          timestamp: date,
        });
      }

      return history.reverse(); // Return oldest to newest
    } catch (error) {
      console.error('Failed to get step history:', error);
      return [];
    }
  }

  async subscribeToStepUpdates(callback: (steps: number) => void): Promise<() => void> {
    if (!this.permissions.granted) {
      return () => {};
    }

    let interval: NodeJS.Timeout;

    if (Capacitor.isNativePlatform()) {
      // Native step updates would be implemented here
      interval = setInterval(async () => {
        const steps = await this.getNativeSteps();
        callback(steps);
      }, 60000); // Check every minute
    } else {
      // Web fallback - simulate step updates
      interval = setInterval(() => {
        const currentSteps = this.getSimulatedSteps();
        callback(currentSteps);
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }

  async validateStepCount(steps: number, timeframe: number): Promise<boolean> {
    const maxStepsPerHour = 8000;
    const maxStepsPerDay = 50000;
    const minStepsPerHour = 0;

    if (timeframe <= 1) {
      // Hourly validation
      return steps >= minStepsPerHour && steps <= maxStepsPerHour;
    } else {
      // Daily validation
      return steps >= 0 && steps <= maxStepsPerDay;
    }
  }

  private async getNativeSteps(): Promise<number> {
    // This would integrate with actual HealthKit/Google Fit APIs
    // For development, return stored or simulated data
    const stored = await this.getStoredSteps();
    return stored > 0 ? stored : this.getSimulatedSteps();
  }

  private async getStepsForDate(date: Date): Promise<number> {
    // This would query HealthKit/Google Fit for specific date
    const key = `steps_${date.toISOString().split('T')[0]}`;
    const { value } = await Preferences.get({ key });
    
    if (value) {
      return parseInt(value, 10);
    }

    // Generate realistic step data for demo
    return Math.floor(Math.random() * 8000) + 2000;
  }

  private getSimulatedSteps(): number {
    const hour = new Date().getHours();
    const baseSteps = hour * 300; // 300 steps per hour on average
    const variance = Math.floor(Math.random() * 500) - 250;
    return Math.max(0, baseSteps + variance);
  }

  private async getStoredSteps(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { value } = await Preferences.get({ key: `steps_${today}` });
    return value ? parseInt(value, 10) : 0;
  }

  private async simulatePermissionRequest(): Promise<boolean> {
    // Simulate user permission dialog
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  private async savePermissionsToStorage(): Promise<void> {
    await Preferences.set({
      key: 'health_permissions',
      value: JSON.stringify(this.permissions),
    });
  }

  async loadPermissionsFromStorage(): Promise<void> {
    const { value } = await Preferences.get({ key: 'health_permissions' });
    if (value) {
      this.permissions = JSON.parse(value);
    }
  }

  getPermissionStatus(): HealthPermissions {
    return { ...this.permissions };
  }

  getHealthDataSource(): string {
    if (!Capacitor.isNativePlatform()) {
      return 'Web Simulation';
    }
    
    if (Capacitor.getPlatform() === 'ios') {
      return 'Apple Health';
    }
    
    if (Capacitor.getPlatform() === 'android') {
      return 'Google Fit';
    }
    
    return 'Unknown';
  }
}