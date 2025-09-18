import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { Geolocation } from '@capacitor/geolocation';
import { useToast } from '@/hooks/use-toast';

export interface StepData {
  steps: number;
  timestamp: Date;
  speed: number; // km/h
  accuracy: number; // GPS accuracy in meters
  source: 'HealthKit' | 'Google Fit' | 'Manual' | 'Wearable' | 'Web';
  deviceId: string;
  validated: boolean;
  fraudScore: number; // 0-100, higher = more suspicious
}

export interface HealthPermissions {
  granted: boolean;
  steps: boolean;
  distance: boolean;
  heartRate: boolean;
  location: boolean;
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: 'iPhone' | 'Apple Watch' | 'Android Phone' | 'Wear OS' | 'Fitbit' | 'Garmin';
  isPrimary: boolean;
  lastSync: Date;
  batteryLevel?: number;
}

export interface FraudDetectionResult {
  isSuspicious: boolean;
  score: number;
  reasons: string[];
  action: 'allow' | 'limit' | 'block';
}

export class EnhancedHealthService {
  private static instance: EnhancedHealthService;
  private permissions: HealthPermissions = {
    granted: false,
    steps: false,
    distance: false,
    heartRate: false,
    location: false,
  };
  
  private connectedDevices: DeviceInfo[] = [];
  private stepHistory: StepData[] = [];
  private lastSpeedCheck = new Date();
  private suspiciousActivityCount = 0;

  static getInstance(): EnhancedHealthService {
    if (!EnhancedHealthService.instance) {
      EnhancedHealthService.instance = new EnhancedHealthService();
    }
    return EnhancedHealthService.instance;
  }

  // TC010: Health API Sync Test
  async simulateHealthKitSync(steps: number): Promise<{ success: boolean; actualSteps: number; message: string }> {
    if (!this.permissions.granted) {
      return {
        success: false,
        actualSteps: 0,
        message: "Health permissions not granted. Please enable in settings."
      };
    }

    // Simulate realistic sync behavior
    const variance = Math.floor(Math.random() * 20) - 10; // ±10 step variance
    const actualSteps = Math.max(0, steps + variance);
    
    const stepData: StepData = {
      steps: actualSteps,
      timestamp: new Date(),
      speed: await this.getCurrentSpeed(),
      accuracy: await this.getGPSAccuracy(),
      source: Capacitor.getPlatform() === 'ios' ? 'HealthKit' : 'Google Fit',
      deviceId: this.getPrimaryDevice()?.id || 'default',
      validated: true,
      fraudScore: this.calculateFraudScore(actualSteps)
    };

    this.stepHistory.push(stepData);
    await this.saveStepData(stepData);

    return {
      success: true,
      actualSteps,
      message: `✅ Synced ${actualSteps} steps from ${stepData.source}`
    };
  }

  // TC011: Step-to-Coin Conversion Test
  calculateCoinsFromSteps(steps: number, userPhase: number = 1): { coins: number; breakdown: any } {
    const STEPS_PER_COIN = 25;
    const phaseMultipliers = {
      1: 1.0,   // Beginner
      2: 1.2,   // Intermediate  
      3: 1.5,   // Advanced
      4: 2.0,   // Expert
      5: 2.5    // Master
    };

    const baseCoins = Math.floor(steps / STEPS_PER_COIN);
    const multiplier = phaseMultipliers[userPhase as keyof typeof phaseMultipliers] || 1.0;
    const finalCoins = Math.floor(baseCoins * multiplier);

    return {
      coins: finalCoins,
      breakdown: {
        steps,
        baseCoins,
        phase: userPhase,
        multiplier,
        finalCoins
      }
    };
  }

  // TC012: Daily Goal Achievement Test
  async checkGoalAchievement(currentSteps: number, goalSteps: number): Promise<{ achieved: boolean; milestone?: string }> {
    if (currentSteps >= goalSteps) {
      await this.triggerAchievementNotification(currentSteps, goalSteps);
      return {
        achieved: true,
        milestone: this.getMilestoneMessage(currentSteps)
      };
    }

    return { achieved: false };
  }

  // TC013: Multi-Device Sync Test
  async syncMultipleDevices(): Promise<{ primarySteps: number; devices: DeviceInfo[]; conflicts: any[] }> {
    const conflicts: any[] = [];
    let primarySteps = 0;
    
    // Simulate multiple devices reporting steps
    this.connectedDevices.forEach(device => {
      const deviceSteps = this.getDeviceSteps(device.id);
      
      if (device.isPrimary) {
        primarySteps = deviceSteps;
      } else if (Math.abs(deviceSteps - primarySteps) > 500) {
        conflicts.push({
          device: device.name,
          steps: deviceSteps,
          difference: deviceSteps - primarySteps
        });
      }
    });

    return {
      primarySteps,
      devices: this.connectedDevices,
      conflicts
    };
  }

  // TC014: GPS Validation Test
  async validateGPSData(): Promise<{ valid: boolean; speed: number; accuracy: number; reason?: string }> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const speed = (position.coords.speed || 0) * 3.6; // m/s to km/h
      const accuracy = position.coords.accuracy || 999;

      if (speed > 25) {
        return {
          valid: false,
          speed,
          accuracy,
          reason: "Speed too high for walking/running"
        };
      }

      if (accuracy > 100) {
        return {
          valid: false,
          speed,
          accuracy,
          reason: "GPS accuracy too low"
        };
      }

      return { valid: true, speed, accuracy };
    } catch (error) {
      return {
        valid: false,
        speed: 0,
        accuracy: 999,
        reason: "GPS not available"
      };
    }
  }

  // TC015: Excessive Steps Test
  validateStepCount(steps: number, timeframe: 'hourly' | 'daily'): { valid: boolean; limit: number; reason?: string } {
    const limits = {
      hourly: 8000,
      daily: 50000
    };

    const limit = limits[timeframe];
    
    if (steps > limit) {
      return {
        valid: false,
        limit,
        reason: `Exceeds realistic ${timeframe} limit of ${limit.toLocaleString()} steps`
      };
    }

    if (steps > 60000) {
      return {
        valid: false,
        limit: 60000,
        reason: "Unrealistic step count detected - possible fraud"
      };
    }

    return { valid: true, limit };
  }

  // TC016: Speed Validation Test
  async validateWalkingSpeed(): Promise<{ valid: boolean; currentSpeed: number; maxAllowed: number }> {
    const currentSpeed = await this.getCurrentSpeed();
    const maxWalkingSpeed = 12; // km/h

    return {
      valid: currentSpeed <= maxWalkingSpeed,
      currentSpeed,
      maxAllowed: maxWalkingSpeed
    };
  }

  // TC017: Health App Disconnect Test
  async simulateHealthAppDisconnect(): Promise<{ error: string; fallbackActive: boolean; manualEntry: boolean }> {
    this.permissions.granted = false;
    this.permissions.steps = false;

    return {
      error: "Health app connection lost. Please reconnect in Settings.",
      fallbackActive: true,
      manualEntry: true
    };
  }

  // TC018: Fraud Detection Test
  detectFraud(stepData: StepData[]): FraudDetectionResult {
    let score = 0;
    const reasons: string[] = [];

    // Check for impossible step patterns
    const recentSteps = stepData.slice(-10);
    const avgSteps = recentSteps.reduce((sum, data) => sum + data.steps, 0) / recentSteps.length;

    if (avgSteps > 2000) {
      score += 30;
      reasons.push("Unusually high step frequency");
    }

    // Check for speed inconsistencies
    const speedViolations = recentSteps.filter(data => data.speed > 25).length;
    if (speedViolations > 3) {
      score += 40;
      reasons.push("Multiple high-speed violations");
    }

    // Check for round numbers (often manual entries)
    const roundNumbers = recentSteps.filter(data => data.steps % 1000 === 0).length;
    if (roundNumbers > 2) {
      score += 20;
      reasons.push("Suspicious round number pattern");
    }

    // Check for timing patterns
    const timeGaps = recentSteps.map((data, i) => {
      if (i === 0) return 0;
      return data.timestamp.getTime() - recentSteps[i-1].timestamp.getTime();
    }).filter(gap => gap < 1000); // Less than 1 second apart

    if (timeGaps.length > 3) {
      score += 25;
      reasons.push("Suspiciously rapid step entries");
    }

    let action: 'allow' | 'limit' | 'block' = 'allow';
    if (score > 70) action = 'block';
    else if (score > 40) action = 'limit';

    return {
      isSuspicious: score > 40,
      score,
      reasons,
      action
    };
  }

  // TC019: Midnight Rollover Test
  async testMidnightRollover(steps: number): Promise<{ date: string; stepsAssigned: number; newDay: boolean }> {
    const now = new Date();
    const isNearMidnight = now.getHours() === 23 && now.getMinutes() >= 59;
    const isJustAfterMidnight = now.getHours() === 0 && now.getMinutes() <= 1;

    let assignedDate: Date;
    let newDay = false;

    if (isNearMidnight) {
      // Assign to current day
      assignedDate = now;
    } else if (isJustAfterMidnight) {
      // Assign to new day
      assignedDate = now;
      newDay = true;
    } else {
      assignedDate = now;
    }

    const dateString = assignedDate.toISOString().split('T')[0];
    
    await this.saveStepsForDate(dateString, steps);

    return {
      date: dateString,
      stepsAssigned: steps,
      newDay
    };
  }

  // TC020: Multiple Wearables Test
  async manageMultipleWearables(): Promise<{ devices: DeviceInfo[]; primary: DeviceInfo | null; conflicts: any[] }> {
    // Simulate connected devices
    const simulatedDevices: DeviceInfo[] = [
      {
        id: 'iphone-1',
        name: 'iPhone 14 Pro',
        type: 'iPhone',
        isPrimary: true,
        lastSync: new Date(),
        batteryLevel: 85
      },
      {
        id: 'watch-1',
        name: 'Apple Watch Series 8',
        type: 'Apple Watch',
        isPrimary: false,
        lastSync: new Date(Date.now() - 300000), // 5 min ago
        batteryLevel: 65
      },
      {
        id: 'fitbit-1',
        name: 'Fitbit Charge 5',
        type: 'Fitbit',
        isPrimary: false,
        lastSync: new Date(Date.now() - 600000), // 10 min ago
        batteryLevel: 45
      }
    ];

    this.connectedDevices = simulatedDevices;
    const primary = simulatedDevices.find(d => d.isPrimary) || null;
    
    // Check for step count conflicts
    const conflicts = simulatedDevices.map(device => ({
      device: device.name,
      steps: this.getDeviceSteps(device.id),
      lastSync: device.lastSync,
      batteryLevel: device.batteryLevel
    }));

    return {
      devices: simulatedDevices,
      primary,
      conflicts
    };
  }

  // Helper methods
  private async getCurrentSpeed(): Promise<number> {
    try {
      const position = await Geolocation.getCurrentPosition({ timeout: 5000 });
      return (position.coords.speed || 0) * 3.6;
    } catch {
      return 0;
    }
  }

  private async getGPSAccuracy(): Promise<number> {
    try {
      const position = await Geolocation.getCurrentPosition({ timeout: 5000 });
      return position.coords.accuracy || 999;
    } catch {
      return 999;
    }
  }

  private calculateFraudScore(steps: number): number {
    let score = 0;
    if (steps > 20000) score += 30;
    if (steps % 1000 === 0) score += 15;
    return Math.min(score, 100);
  }

  private getPrimaryDevice(): DeviceInfo | undefined {
    return this.connectedDevices.find(d => d.isPrimary);
  }

  private getDeviceSteps(deviceId: string): number {
    // Simulate device-specific step counts with some variance
    const baseSteps = Math.floor(Math.random() * 8000) + 2000;
    const deviceVariance = deviceId.includes('watch') ? 200 : 50;
    return baseSteps + Math.floor(Math.random() * deviceVariance);
  }

  private async triggerAchievementNotification(currentSteps: number, goalSteps: number): Promise<void> {
    // Implementation would trigger native notifications
    console.log(`🎉 Goal achieved! ${currentSteps}/${goalSteps} steps`);
  }

  private getMilestoneMessage(steps: number): string {
    if (steps >= 20000) return "🏆 Ultra Walker!";
    if (steps >= 15000) return "⭐ Super Achiever!";
    if (steps >= 10000) return "🎯 Goal Crusher!";
    return "🎉 Great Job!";
  }

  private async saveStepData(stepData: StepData): Promise<void> {
    const key = `steps_${new Date().toISOString().split('T')[0]}`;
    await Preferences.set({
      key,
      value: JSON.stringify(stepData)
    });
  }

  private async saveStepsForDate(date: string, steps: number): Promise<void> {
    await Preferences.set({
      key: `steps_${date}`,
      value: steps.toString()
    });
  }

  // Public API for testing
  async requestPermissions(): Promise<HealthPermissions> {
    // Simulate permission request
    this.permissions = {
      granted: true,
      steps: true,
      distance: true,
      heartRate: true,
      location: true,
    };
    return this.permissions;
  }

  getPermissionStatus(): HealthPermissions {
    return { ...this.permissions };
  }

  getConnectedDevices(): DeviceInfo[] {
    return [...this.connectedDevices];
  }

  getStepHistory(): StepData[] {
    return [...this.stepHistory];
  }
}