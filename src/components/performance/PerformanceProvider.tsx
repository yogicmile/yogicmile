import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { PerformanceErrorBoundary, setupGlobalErrorHandlers } from './ErrorBoundary';
import { usePerformanceMonitoring, useBatteryOptimization } from '@/hooks/use-performance-monitoring';
import { cacheManager, initializeCache } from '@/services/CacheManager';
import { backgroundSyncManager } from '@/services/BackgroundSyncManager';
import { useAuth } from '@/contexts/AuthContext';

interface PerformanceContextType {
  cacheManager: typeof cacheManager;
  syncManager: typeof backgroundSyncManager;
  batterOptimization: ReturnType<typeof useBatteryOptimization>;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const batteryOptimization = useBatteryOptimization();
  
  // Initialize performance monitoring for the root level
  usePerformanceMonitoring('app');

  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers();
    
    // Initialize cache manager
    initializeCache(user?.id);
    
    // Initialize sync manager
    backgroundSyncManager.setUserId(user?.id || null);
    
    console.log('Performance optimization system initialized');
  }, [user?.id]);

  // Performance monitoring setup
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navigationEntry = entry as PerformanceNavigationTiming;
          console.log('Navigation timing:', {
            domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
            loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
            totalTime: navigationEntry.loadEventEnd - navigationEntry.fetchStart
          });
        }
        
        if (entry.entryType === 'paint') {
          console.log(`${entry.name}: ${entry.startTime}ms`);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['navigation', 'paint'] });
    } catch (e) {
      console.log('Performance Observer not supported');
    }

    return () => observer.disconnect();
  }, []);

  // Memory monitoring
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576)
        };

        // Warn if memory usage is high
        if (memoryUsage.used > 100) { // More than 100MB
          console.warn('High memory usage detected:', memoryUsage);
        }

        // Trigger cache cleanup if memory is very high
        if (memoryUsage.used > 200) { // More than 200MB
          console.log('Triggering cache cleanup due to high memory usage');
          cacheManager.performMaintenance();
        }
      }
    };

    // Check memory usage every 5 minutes
    const interval = setInterval(checkMemoryUsage, 5 * 60 * 1000);
    
    // Initial check
    checkMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  const contextValue: PerformanceContextType = {
    cacheManager,
    syncManager: backgroundSyncManager,
    batterOptimization: batteryOptimization
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      <PerformanceErrorBoundary>
        {children}
      </PerformanceErrorBoundary>
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Hook for page-level performance monitoring
export const usePagePerformance = (pageName: string) => {
  const performanceMonitoring = usePerformanceMonitoring(pageName);
  const { cacheManager, syncManager } = usePerformance();

  useEffect(() => {
    // Record page visit
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const visitDuration = endTime - startTime;
      
      // Log page visit duration if significant
      if (visitDuration > 100) { // More than 100ms
        console.log(`Page ${pageName} visit duration: ${Math.round(visitDuration)}ms`);
      }
    };
  }, [pageName]);

  return {
    ...performanceMonitoring,
    cacheManager,
    syncManager
  };
};

// Component wrapper for automatic performance monitoring
export const withPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  pageName: string
) => {
  return (props: P) => {
    usePagePerformance(pageName);
    
    return <Component {...props} />;
  };
};