import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { CapacitorHealthkit, QueryOutput, ActivityData } from '@perfood/capacitor-healthkit';

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
      // For iOS HealthKit and Android Health Connect
      await CapacitorHealthkit.requestAuthorization({
        all: [],
        read: ['steps', 'distance', 'calories', 'activity'],
        write: []
      });
      
      this.permissions = {
        granted: true,
        steps: true,
        distance: true,
        workouts: true,
      };

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
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const result: QueryOutput<ActivityData> = await CapacitorHealthkit.queryHKitSampleType<ActivityData>({
          sampleName: 'steps',
          startDate: startOfDay.toISOString(),
          endDate: now.toISOString(),
          limit: 1000
        });

        if (result.resultData && result.resultData.length > 0) {
          const totalSteps = result.resultData.reduce((sum, sample: any) => {
            // Extract numeric value from the sample data
            const stepValue = sample.count || sample.value || sample.qty || 0;
            return sum + (parseFloat(stepValue.toString()) || 0);
          }, 0);
          return Math.floor(totalSteps);
        }
        
        return 0;
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
      if (!Capacitor.isNativePlatform()) {
        // Web fallback
        const history: HealthData[] = [];
        const today = new Date();
        
        for (let i = 0; i < days; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const steps = await this.getStepsForDate(date);
          history.push({
            steps,
            distance: steps * 0.0008,
            activeEnergyBurned: steps * 0.04,
            timestamp: date,
          });
        }
        return history.reverse();
      }

      const history: HealthData[] = [];
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - days);
      
      const result: QueryOutput<ActivityData> = await CapacitorHealthkit.queryHKitSampleType<ActivityData>({
        sampleName: 'steps',
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        limit: 10000
      });

      // Group by day
      const dailySteps = new Map<string, number>();
      if (result.resultData) {
        result.resultData.forEach((sample: any) => {
          const date = new Date(sample.startDate).toISOString().split('T')[0];
          const stepValue = sample.count || sample.value || sample.qty || 0;
          const steps = parseFloat(stepValue.toString() || '0');
          dailySteps.set(date, (dailySteps.get(date) || 0) + steps);
        });
      }

      // Create history array
      for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const steps = Math.floor(dailySteps.get(dateKey) || 0);
        
        history.push({
          steps,
          distance: steps * 0.0008,
          activeEnergyBurned: steps * 0.04,
          timestamp: date,
        });
      }

      return history.reverse();
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
    return await this.getTodaySteps();
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
    // Return stored steps only - no automatic simulation
    return 0;
  }

  private async getStoredSteps(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { value } = await Preferences.get({ key: `steps_${today}` });
    return value ? parseInt(value, 10) : 0;
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
      return 'Health Connect';
    }
    
    return 'Unknown';
  }
}
