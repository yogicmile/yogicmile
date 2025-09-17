import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

interface NetworkInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export const usePerformanceMonitoring = (pageName: string) => {
  const { user } = useAuth();
  const metricsReported = useRef(false);
  const startTime = useRef(performance.now());

  const getNetworkInfo = useCallback((): NetworkInfo => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection?.effectiveType,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
        saveData: connection?.saveData
      };
    }
    return {};
  }, []);

  const getDeviceType = useCallback((): string => {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    
    return 'desktop';
  }, []);

  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const metrics: PerformanceMetrics = {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    };

    // Get paint metrics
    paint.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Get Core Web Vitals if available
    if ('web-vitals' in window) {
      // These would be set by web-vitals library if included
      const webVitals = (window as any)['web-vitals'];
      if (webVitals) {
        metrics.largestContentfulPaint = webVitals.lcp;
        metrics.cumulativeLayoutShift = webVitals.cls;
        metrics.firstInputDelay = webVitals.fid;
      }
    }

    return metrics;
  }, []);

  const logLoadTime = useCallback(async (loadTimeMs: number) => {
    if (!user || metricsReported.current) return;

    try {
      const networkInfo = getNetworkInfo();
      const deviceType = getDeviceType();

      await supabase.from('load_time_analytics').insert({
        user_id: user.id,
        page_name: pageName,
        load_time_ms: Math.round(loadTimeMs),
        device_type: deviceType,
        connection_type: networkInfo.effectiveType || 'unknown',
      });

      metricsReported.current = true;
    } catch (error) {
      console.error('Failed to log load time:', error);
    }
  }, [user, pageName, getNetworkInfo, getDeviceType]);

  const measurePageLoad = useCallback(() => {
    // Measure when page is fully loaded
    if (document.readyState === 'complete') {
      const loadTime = performance.now() - startTime.current;
      logLoadTime(loadTime);
    } else {
      window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime.current;
        logLoadTime(loadTime);
      }, { once: true });
    }
  }, [logLoadTime]);

  // Performance observer for Core Web Vitals
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    try {
      // Observe Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Log LCP if it's significant
        if (lastEntry.startTime > 2500) { // LCP > 2.5s is poor
          console.warn(`Poor LCP detected: ${lastEntry.startTime}ms on ${pageName}`);
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe Layout Shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        if (clsValue > 0.1) { // CLS > 0.1 is poor
          console.warn(`Poor CLS detected: ${clsValue} on ${pageName}`);
        }
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    } catch (error) {
      console.error('Performance Observer not supported:', error);
    }
  }, [pageName]);

  // Measure page load time
  useEffect(() => {
    measurePageLoad();
  }, [measurePageLoad]);

  // Resource timing monitoring
  const monitorResourceTiming = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      console.warn('Slow resources detected:', slowResources.map(r => ({
        name: r.name,
        duration: r.duration,
        size: r.transferSize
      })));
    }
  }, []);

  // Memory usage monitoring
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsage = {
        used: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576)
      };

      if (memoryUsage.used > 100) { // More than 100MB
        console.warn('High memory usage detected:', memoryUsage);
      }

      return memoryUsage;
    }
    return null;
  }, []);

  return {
    monitorResourceTiming,
    monitorMemoryUsage,
    getPerformanceMetrics,
    getNetworkInfo,
    getDeviceType
  };
};

// Hook for battery optimization
export const useBatteryOptimization = () => {
  const { user } = useAuth();
  const batteryRef = useRef<any>(null);
  const syncIntervalRef = useRef<number>(300); // Default 5 minutes

  const updateSyncInterval = useCallback(async (batteryLevel: number, isCharging: boolean) => {
    let newInterval = 300; // Default 5 minutes
    let activityLevel = 'normal';

    if (isCharging) {
      newInterval = 60; // 1 minute when charging
      activityLevel = 'high';
    } else if (batteryLevel < 20) {
      newInterval = 600; // 10 minutes when low battery
      activityLevel = 'low';
    } else if (batteryLevel < 50) {
      newInterval = 300; // 5 minutes when medium battery
      activityLevel = 'medium';
    }

    syncIntervalRef.current = newInterval;

    // Log battery usage pattern
    if (user) {
      try {
        await supabase.from('battery_usage_logs').insert({
          user_id: user.id,
          battery_level: batteryLevel,
          charging_status: isCharging,
          background_activity_level: activityLevel,
          sync_interval_seconds: newInterval
        });
      } catch (error) {
        console.error('Failed to log battery usage:', error);
      }
    }

    return newInterval;
  }, [user]);

  useEffect(() => {
    const initBatteryMonitoring = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          batteryRef.current = battery;

          const updateInterval = () => {
            updateSyncInterval(
              Math.round(battery.level * 100),
              battery.charging
            );
          };

          battery.addEventListener('chargingchange', updateInterval);
          battery.addEventListener('levelchange', updateInterval);

          // Initial update
          updateInterval();
        } catch (error) {
          console.error('Battery API not available:', error);
        }
      }
    };

    initBatteryMonitoring();
  }, [updateSyncInterval]);

  return {
    currentSyncInterval: syncIntervalRef.current,
    getBatteryInfo: () => batteryRef.current ? {
      level: Math.round(batteryRef.current.level * 100),
      charging: batteryRef.current.charging
    } : null
  };
};