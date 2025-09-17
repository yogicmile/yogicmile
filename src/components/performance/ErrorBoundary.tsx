import React, { Component, ErrorInfo, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface DeviceInfo {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  availableMemory?: number;
  connectionType?: string;
  batteryLevel?: number;
}

export class PerformanceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error to Supabase
    await this.logCrashReport(error, errorInfo);
    
    // Log to console for development
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    const deviceInfo: DeviceInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
    };

    // Get memory info if available
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      deviceInfo.availableMemory = memory.usedJSHeapSize;
    }

    // Get connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      deviceInfo.connectionType = connection?.effectiveType || 'unknown';
    }

    // Get battery info if available
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        deviceInfo.batteryLevel = Math.round(battery.level * 100);
      }
    } catch (e) {
      // Battery API not available
    }

    return deviceInfo;
  }

  private async logCrashReport(error: Error, errorInfo: ErrorInfo) {
    try {
      const deviceInfo = await this.getDeviceInfo();
      
      await supabase.from('app_crashes').insert({
        error_message: error.message,
        stack_trace: error.stack || 'No stack trace available',
        device_info: deviceInfo as any, // Cast to any for JSON compatibility
        error_context: {
          componentStack: errorInfo.componentStack,
          errorBoundary: 'PerformanceErrorBoundary',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        } as any, // Cast to any for JSON compatibility
        url: window.location.href,
        user_agent: navigator.userAgent,
        severity: this.determineSeverity(error),
        app_version: '1.0.0' // This should come from package.json or environment
      });
    } catch (logError) {
      console.error('Failed to log crash report:', logError);
    }
  }

  private determineSeverity(error: Error): string {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'low';
    }
    
    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return 'medium';
    }
    
    if (errorMessage.includes('typeerror') || errorMessage.includes('reference')) {
      return 'high';
    }
    
    return 'medium';
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl">⚠️</div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-4">
                We've encountered an unexpected error. The issue has been automatically reported to our team.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reload App
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-secondary text-secondary-foreground py-2 px-4 rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Go Back
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted p-4 rounded-lg text-sm">
                <summary className="cursor-pointer font-medium">Error Details (Dev Mode)</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handlers
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', async (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    try {
      await supabase.from('app_crashes').insert({
        error_message: `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
        stack_trace: event.reason?.stack || 'No stack trace available',
        device_info: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString()
        } as any, // Cast to any for JSON compatibility
        error_context: {
          type: 'unhandledRejection',
          reason: String(event.reason)
        } as any, // Cast to any for JSON compatibility
        url: window.location.href,
        user_agent: navigator.userAgent,
        severity: 'medium',
        app_version: '1.0.0'
      });
    } catch (logError) {
      console.error('Failed to log promise rejection:', logError);
    }
  });

  // Handle global JavaScript errors
  window.addEventListener('error', async (event) => {
    console.error('Global error:', event.error);
    
    try {
      await supabase.from('app_crashes').insert({
        error_message: event.message,
        stack_trace: event.error?.stack || 'No stack trace available',
        device_info: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          filename: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno,
          timestamp: new Date().toISOString()
        } as any, // Cast to any for JSON compatibility
        error_context: {
          type: 'globalError',
          filename: event.filename,
          lineNumber: event.lineno,
          columnNumber: event.colno
        } as any, // Cast to any for JSON compatibility
        url: window.location.href,
        user_agent: navigator.userAgent,
        severity: 'high',
        app_version: '1.0.0'
      });
    } catch (logError) {
      console.error('Failed to log global error:', logError);
    }
  });
};