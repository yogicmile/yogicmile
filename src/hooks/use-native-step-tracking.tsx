import { useState, useEffect, useCallback, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { HealthKitService } from '@/services/HealthKitService';
import { androidBackgroundService } from '@/services/AndroidBackgroundService';
import { googleFitService } from '@/services/GoogleFitService';
import { PHASE_DEFINITIONS, MAX_DAILY_STEPS, STEPS_PER_UNIT } from '@/constants/phases';
import { useGamification } from '@/hooks/use-gamification';

export interface NativeStepData {
  dailySteps: number;
  lifetimeSteps: number;
  currentSpeed: number; // km/h
  isValidSpeed: boolean;
  batteryOptimized: boolean;
  lastSyncTime: Date;
  pendingSteps: number; // Steps waiting to sync
  gpsAccuracy: number;
  googleFitSteps: number; // Steps from Google Fit
  googleFitConnected: boolean;
  lastGoogleFitSync: Date | null;
}

export interface StepEvent {
  steps: number;
  timestamp: Date;
  speed: number;
  accuracy: number;
  validated: boolean;
}

const MAX_WALKING_SPEED = 12; // km/h
const STORAGE_KEY = 'native-step-data';
const TRACKING_SETUP_KEY = 'native-tracking-setup-shown';
const SYNC_INTERVAL = 60000; // 1 minute
const GPS_UPDATE_INTERVAL = 10000; // 10 seconds

// Safe wrappers for Capacitor plugins to avoid breaking web builds
const safeHapticImpact = async (style: ImpactStyle) => {
  try {
    await Haptics.impact({ style });
  } catch (e) {
    console.warn('Haptics not available:', (e as any)?.message || e);
  }
};

const safeScheduleNotification = async (payload: any) => {
  try {
    await LocalNotifications.schedule(payload);
  } catch (e) {
    console.warn('LocalNotifications not available:', (e as any)?.message || e);
  }
};

export const useNativeStepTracking = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const { updateChallengeProgress } = useGamification();
  const [stepData, setStepData] = useState<NativeStepData>({
    dailySteps: 0,
    lifetimeSteps: 0,
    currentSpeed: 0,
    isValidSpeed: true,
    batteryOptimized: true,
    lastSyncTime: new Date(),
    pendingSteps: 0,
    gpsAccuracy: 0,
    googleFitSteps: 0,
    googleFitConnected: false,
    lastGoogleFitSync: null,
  });

  const [isTracking, setIsTracking] = useState(false);
  const [permissions, setPermissions] = useState({
    location: false,
    notifications: false,
    motion: false,
  });

  const gpsWatchId = useRef<string | null>(null);
  const syncInterval = useRef<NodeJS.Timeout | null>(null);
  const stepQueue = useRef<StepEvent[]>([]);
  const healthKit = useRef(HealthKitService.getInstance());
  const lastStepCount = useRef(0);
  const stepCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize native step tracking
  useEffect(() => {
    initializeNativeTracking();
    return () => {
      cleanup();
    };
  }, []);

  // Auto-sync with backend
  useEffect(() => {
    if (user && !isGuest) {
      startAutoSync();
    }
    return () => {
      if (syncInterval.current) {
        clearInterval(syncInterval.current);
      }
    };
  }, [user, isGuest]);

  const initializeNativeTracking = async () => {
    try {
      const platform = Capacitor.getPlatform();
      
      if (platform === 'android') {
        // Initialize Google Fit first
        const googleFitResult = await googleFitService.initialize();
        const googleFitConnected = googleFitResult.success;
        
        if (googleFitConnected) {
          // Subscribe to Google Fit sync updates
          googleFitService.addSyncListener(async (syncResult) => {
            if (syncResult.success) {
              await saveToStorage({
                dailySteps: Math.min(syncResult.steps, MAX_DAILY_STEPS),
                googleFitSteps: syncResult.steps,
                googleFitConnected: true,
                lastGoogleFitSync: new Date(syncResult.lastSyncTime),
              });
              
              // Sync to database
              await syncStepsToDatabase(syncResult.steps);
            }
          });
          
          // Perform initial sync
          const initialSync = await googleFitService.syncSteps();
          if (initialSync.success) {
            await saveToStorage({
              dailySteps: Math.min(initialSync.steps, MAX_DAILY_STEPS),
              googleFitSteps: initialSync.steps,
              googleFitConnected: true,
              lastGoogleFitSync: new Date(initialSync.lastSyncTime),
            });
          }
          
          toast({
            title: "Google Fit Connected",
            description: "Auto-sync enabled for accurate step tracking",
          });
        }
        
        // Start Android background service
        const bgServiceResult = await androidBackgroundService.startTracking();
        
        if (!bgServiceResult.success) {
          toast({
            title: "Background Tracking",
            description: bgServiceResult.message,
            variant: "destructive",
          });
          
          // Get device-specific recommendations
          const recommendations = await androidBackgroundService.getDeviceRecommendations();
          if (recommendations.length > 0) {
            console.log('Device recommendations:', recommendations);
            toast({
              title: "Setup Required",
              description: recommendations[0],
              duration: 8000,
            });
          }
          return;
        }
        
        // Subscribe to step updates from background service
        await androidBackgroundService.subscribeToStepUpdates(
          async (data) => {
            // Merge with Google Fit data if available
            let finalSteps = data.steps;
            if (googleFitConnected) {
              const googleFitSteps = stepData.googleFitSteps;
              finalSteps = Math.max(data.steps, googleFitSteps);
            }
            
            const capped = Math.min(finalSteps, MAX_DAILY_STEPS);
            await saveToStorage({
              dailySteps: capped,
              lifetimeSteps: stepData.lifetimeSteps + (capped - stepData.dailySteps),
              lastSyncTime: new Date(data.timestamp),
            });
            
            // Sync to database
            await syncStepsToDatabase(finalSteps);
            
            // Milestone notifications
            if (capped % 1000 === 0 && capped > stepData.dailySteps) {
              await safeHapticImpact(ImpactStyle.Medium);
              
              if (permissions.notifications) {
                await safeScheduleNotification({
                  notifications: [{
                    id: Date.now(),
                    title: "🎉 Milestone Achieved!",
                    body: `${capped} steps completed`,
                    schedule: { at: new Date(Date.now() + 100) },
                  }]
                });
              }
            }
          }
        );
        
        // Load initial step count (prefer Google Fit if available)
        const currentSteps = googleFitConnected 
          ? (await googleFitService.syncSteps()).steps
          : await androidBackgroundService.getCurrentSteps();
        await saveToStorage({ 
          dailySteps: Math.min(currentSteps, MAX_DAILY_STEPS),
          googleFitConnected,
        });
        
        setIsTracking(true);
        
        toast({
          title: "Background Tracking Active",
          description: googleFitConnected 
            ? "Steps syncing with Google Fit + hardware sensor"
            : "Steps tracking in background with persistent notification",
        });
        
        
        if (!result.success) {
          toast({
            title: "Background Tracking",
            description: result.message,
            variant: "destructive",
          });
          
          // Get device-specific recommendations
          const recommendations = await androidBackgroundService.getDeviceRecommendations();
          if (recommendations.length > 0) {
            console.log('Device recommendations:', recommendations);
            toast({
              title: "Setup Required",
              description: recommendations[0],
              duration: 8000,
            });
          }
          return;
        }
        
        // Subscribe to step updates from background service
        const listenerId = await androidBackgroundService.subscribeToStepUpdates(
          async (data) => {
            const capped = Math.min(data.steps, MAX_DAILY_STEPS);
            await saveToStorage({
              dailySteps: capped,
              lifetimeSteps: stepData.lifetimeSteps + (capped - stepData.dailySteps),
              lastSyncTime: new Date(data.timestamp),
            });
            
            // Sync to database
            await syncStepsToDatabase(data.steps);
            
            // Milestone notifications
            if (capped % 1000 === 0 && capped > stepData.dailySteps) {
              await safeHapticImpact(ImpactStyle.Medium);
              
              if (permissions.notifications) {
                await safeScheduleNotification({
                  notifications: [{
                    id: Date.now(),
                    title: "🎉 Milestone Achieved!",
                    body: `${capped} steps completed`,
                    schedule: { at: new Date(Date.now() + 100) },
                  }]
                });
              }
            }
          }
        );
        
        // Load initial step count
        const todaySteps = await androidBackgroundService.getCurrentSteps();
        await saveToStorage({ dailySteps: Math.min(todaySteps, MAX_DAILY_STEPS) });
        
        setIsTracking(true);
        
        toast({
          title: "Background Tracking Active",
          description: "Steps tracking in background with persistent notification",
        });
        
      } else if (platform === 'ios') {
        // iOS HealthKit tracking (keep existing logic unchanged)
        await requestPermissions();
        const healthPerms = await healthKit.current.requestPermissions();
        await loadStoredData();
        await startGPSTracking();
        startStepPolling();
        setupAppStateListeners();
        setIsTracking(true);
        
        const { value: hasShownSetup } = await Preferences.get({ key: TRACKING_SETUP_KEY });
        if (!hasShownSetup) {
          const source = healthKit.current.getHealthDataSource();
          toast({
            title: "Native Tracking Active",
            description: `Connected to ${source}`,
          });
          await Preferences.set({ key: TRACKING_SETUP_KEY, value: 'true' });
        }
      } else {
        // Web platform - show info message
        toast({
          title: "Step Tracking Unavailable",
          description: "Native step tracking requires iOS or Android device",
        });
      }
    } catch (error) {
      console.error('Failed to initialize native tracking:', error);
      toast({
        title: "Tracking Error",
        description: "Could not start native step tracking",
        variant: "destructive",
      });
    }
  };

  const requestPermissions = async () => {
    try {
      // Location permissions
      const locationResult = await Geolocation.requestPermissions();
      
      // Notification permissions  
      const notificationResult = await LocalNotifications.requestPermissions();
      
      setPermissions({
        location: locationResult.location === 'granted',
        notifications: notificationResult.display === 'granted',
        motion: true, // Assume granted for web testing
      });

      if (locationResult.location !== 'granted') {
        toast({
          title: "Location Access Required",
          description: "Enable location for speed validation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Permission request failed:', error);
    }
  };

  const loadStoredData = async () => {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value) {
        const stored = JSON.parse(value);
        setStepData(prev => ({
          ...prev,
          ...stored,
          lastSyncTime: new Date(stored.lastSyncTime),
        }));
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  };

  const saveToStorage = async (data: Partial<NativeStepData>) => {
    try {
      const updated = { ...stepData, ...data };
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify(updated),
      });
      setStepData(updated);
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  };

  const startGPSTracking = async () => {
    if (!permissions.location) return;

    try {
      gpsWatchId.current = await Geolocation.watchPosition({
        enableHighAccuracy: false, // Battery optimization
        timeout: 10000,
        maximumAge: 30000,
      }, (position) => {
        if (position) {
          const speed = (position.coords.speed || 0) * 3.6; // m/s to km/h
          const accuracy = position.coords.accuracy || 999;
          
          setStepData(prev => ({
            ...prev,
            currentSpeed: speed,
            isValidSpeed: speed <= MAX_WALKING_SPEED,
            gpsAccuracy: accuracy,
          }));
        }
      });
    } catch (error) {
      console.error('GPS tracking failed:', error);
    }
  };

  // Use centralized phase definitions

  // Sync steps to database
  const syncStepsToDatabase = useCallback(async (steps: number) => {
    if (isGuest || !user) return;

    try {
      const cappedSteps = Math.min(steps, MAX_DAILY_STEPS);
      const units = Math.floor(cappedSteps / 25);
      
      // Get current phase from database
      const { data: userPhaseData } = await supabase
        .from('user_phases')
        .select('current_phase')
        .eq('user_id', user.id)
        .single();
      
      const currentPhase = userPhaseData?.current_phase || 1;
      
      // Get phase rate from centralized definitions
      const phaseRate = PHASE_DEFINITIONS.find(p => p.id === currentPhase)?.rate || 1;
      const paisaEarned = units * phaseRate;

      const today = new Date().toISOString().split('T')[0];

      // Get previous step count for the day
      const { data: previousData } = await supabase
        .from('daily_steps')
        .select('steps')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      const previousSteps = previousData?.steps || 0;
      const stepsAdded = steps - previousSteps;

      // Update or insert today's steps
      await supabase
        .from('daily_steps')
        .upsert({
          user_id: user.id,
          date: today,
          steps: steps,
          capped_steps: cappedSteps,
          units_earned: units,
          paisa_earned: paisaEarned,
          phase_id: currentPhase,
          phase_rate: phaseRate,
        });

      // Update challenge progress if there are new steps
      if (stepsAdded > 0 && updateChallengeProgress) {
        await updateChallengeProgress(stepsAdded);
      }
    } catch (error) {
      console.error('Error syncing steps to database:', error);
    }
  }, [user, isGuest, updateChallengeProgress]);

  const startStepPolling = useCallback(() => {
    // Only poll on native platforms (iOS/Android)
    if (!Capacitor.isNativePlatform()) {
      return; // Don't poll in web mode
    }
    
    // Poll step data every 30 seconds
    stepCheckInterval.current = setInterval(async () => {
      try {
        const currentSteps = await healthKit.current.getTodaySteps();
        
        if (currentSteps > lastStepCount.current) {
          const newSteps = currentSteps - lastStepCount.current;
          lastStepCount.current = currentSteps;
          
          // Update step data with new steps from health app
          const capped = Math.min(currentSteps, MAX_DAILY_STEPS);
          await saveToStorage({
            dailySteps: capped,
            lifetimeSteps: stepData.lifetimeSteps + newSteps,
            pendingSteps: stepData.pendingSteps + newSteps,
          });

          // Sync to database
          await syncStepsToDatabase(currentSteps);

          // Milestone notifications
          if (capped % 1000 === 0 && newSteps > 0) {
            await Haptics.impact({ style: ImpactStyle.Medium });
            
            if (permissions.notifications) {
              await LocalNotifications.schedule({
                notifications: [{
                  id: Date.now(),
                  title: "🎉 Milestone Achieved!",
                  body: `${capped} steps completed`,
                  schedule: { at: new Date(Date.now() + 100) },
                }]
              });
            }
          }
        }
      } catch (error) {
        console.error('Step polling error:', error);
      }
    }, 30000); // Check every 30 seconds
  }, [stepData, permissions, syncStepsToDatabase]);

  const setupAppStateListeners = () => {
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App became active - sync any pending data
        syncPendingSteps();
        // Refresh step count immediately
        if (stepCheckInterval.current) {
          clearInterval(stepCheckInterval.current);
          startStepPolling();
        }
      } else {
        // App backgrounded - save current state
        saveToStorage(stepData);
      }
    });
  };

  const addStepEvent = useCallback(async (steps: number) => {
    if (!stepData.isValidSpeed && stepData.currentSpeed > MAX_WALKING_SPEED) {
      toast({
        title: "Speed Too High",
        description: `Slow down! Current: ${stepData.currentSpeed.toFixed(1)} km/h`,
        variant: "destructive",
      });
      return;
    }

    if (stepData.dailySteps >= MAX_DAILY_STEPS) {
      toast({
        title: "Daily Limit Reached",
        description: "12,000 steps achieved for today!",
      });
      return;
    }

    const stepEvent: StepEvent = {
      steps,
      timestamp: new Date(),
      speed: stepData.currentSpeed,
      accuracy: stepData.gpsAccuracy,
      validated: stepData.isValidSpeed,
    };

    stepQueue.current.push(stepEvent);

    const newDailySteps = Math.min(stepData.dailySteps + steps, MAX_DAILY_STEPS);
    const actualStepsAdded = newDailySteps - stepData.dailySteps;
    
    await saveToStorage({
      dailySteps: newDailySteps,
      lifetimeSteps: stepData.lifetimeSteps + actualStepsAdded,
      pendingSteps: stepData.pendingSteps + actualStepsAdded,
    });

    // Haptic feedback for milestones
    if (newDailySteps % 1000 === 0 && actualStepsAdded > 0) {
      await Haptics.impact({ style: ImpactStyle.Medium });
      
      if (permissions.notifications) {
        await LocalNotifications.schedule({
          notifications: [{
            id: Date.now(),
            title: "🎉 Milestone Achieved!",
            body: `${newDailySteps} steps completed`,
            schedule: { at: new Date(Date.now() + 100) },
          }]
        });
      }
    }
  }, [stepData, permissions, toast]);

  const startAutoSync = () => {
    if (syncInterval.current) return;
    
    const SYNC_INTERVAL = 60000; // 1 minute
    syncInterval.current = setInterval(() => {
      syncPendingSteps();
    }, SYNC_INTERVAL);
  };

  const syncPendingSteps = async () => {
    if (!user || isGuest || stepData.pendingSteps === 0) return;

    try {
      const { error } = await supabase.rpc('earn_steps', {
        p_user_id: user.id,
        p_steps: stepData.pendingSteps,
      });

      if (error) {
        console.error('Sync failed:', error);
        return;
      }

      await saveToStorage({
        pendingSteps: 0,
        lastSyncTime: new Date(),
      });

      const coinsEarned = Math.floor(stepData.pendingSteps / STEPS_PER_UNIT);
      if (coinsEarned > 0) {
        toast({
          title: "Steps Synced!",
          description: `${stepData.pendingSteps} steps → ${coinsEarned} paisa earned`,
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const resetDaily = useCallback(async () => {
    await saveToStorage({
      dailySteps: 0,
      pendingSteps: 0,
    });
    stepQueue.current = [];
    
    toast({
      title: "Daily Reset",
      description: "Step counter reset for new day",
    });
  }, []);

  const cleanup = () => {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'android') {
      androidBackgroundService.stopTracking();
      googleFitService.stopAutoSync();
    }
    
    if (gpsWatchId.current) {
      Geolocation.clearWatch({ id: gpsWatchId.current });
    }
    if (syncInterval.current) {
      clearInterval(syncInterval.current);
    }
    if (stepCheckInterval.current) {
      clearInterval(stepCheckInterval.current);
    }
    setIsTracking(false);
  };

  const openBatterySettings = async () => {
    if (Capacitor.getPlatform() === 'android') {
      await androidBackgroundService.openBatterySettings();
    }
  };

  const syncWithGoogleFit = async () => {
    if (Capacitor.getPlatform() === 'android') {
      const result = await googleFitService.syncSteps();
      if (result.success) {
        await saveToStorage({
          dailySteps: Math.min(result.steps, MAX_DAILY_STEPS),
          googleFitSteps: result.steps,
          lastGoogleFitSync: new Date(result.lastSyncTime),
        });
        
        toast({
          title: "Google Fit Synced",
          description: `${result.steps} steps updated`,
        });
      }
      return result;
    }
    return { success: false, steps: 0, lastSyncTime: 0, source: 'sensor' as const };
  };

  const simulateSteps = useCallback((count: number = 50) => {
    // For testing purposes
    addStepEvent(count);
  }, [addStepEvent]);

  return {
    stepData,
    isTracking,
    permissions,
    addStepEvent,
    resetDaily,
    syncPendingSteps,
    simulateSteps, // For testing
    cleanup,
    openBatterySettings, // Open manufacturer-specific battery settings
    syncWithGoogleFit, // Manual Google Fit sync
  };
};