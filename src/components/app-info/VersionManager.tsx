import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  Smartphone, 
  Monitor, 
  Wifi, 
  Battery, 
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Globe
} from 'lucide-react';

interface AppVersion {
  version: string;
  build: string;
  environment: 'development' | 'staging' | 'production';
  buildDate: string;
  commitHash?: string;
  features: string[];
}

interface SystemInfo {
  platform: string;
  userAgent: string;
  language: string;
  screenResolution: string;
  viewport: string;
  colorScheme: string;
  connection: string;
  memory: string;
  storage: {
    used: string;
    available: string;
  };
}

// Mock version data - in production this would come from build process
const APP_VERSION: AppVersion = {
  version: "2.1.0",
  build: "2024091801",
  environment: "production",
  buildDate: "2024-09-18T12:00:00Z",
  commitHash: "a7b3c9d",
  features: [
    "Unlimited Step Tracking",
    "Enhanced Wearable Integration", 
    "Advanced Achievement System",
    "Social Sharing & Community",
    "Email Preferences Management",
    "Multi-theme Customization",
    "Beta Feedback System",
    "Enhanced Security Dashboard"
  ]
};

const RELEASE_NOTES = [
  {
    version: "2.1.0",
    date: "2024-09-18",
    type: "major" as const,
    title: "Launch Ready Release 🚀",
    changes: [
      "🎉 Removed daily step cap - unlimited walking rewards!",
      "📱 Enhanced wearable device integration (Fitbit, Apple Watch, Garmin)",
      "🏆 150+ new achievements across all categories",
      "🎨 5 beautiful app themes available to all users",
      "🔔 Comprehensive email notification system",
      "🛡️ Enhanced security with device session management",
      "🧪 Beta testing feedback system for continuous improvement",
      "⚡ Performance optimizations and bug fixes"
    ]
  },
  {
    version: "2.0.5",
    date: "2024-09-15",
    type: "patch" as const,
    title: "Stability Improvements",
    changes: [
      "🔧 Fixed step counter synchronization issues",
      "💰 Improved wallet balance calculations", 
      "🎯 Enhanced achievement progress tracking",
      "📊 Better analytics and performance monitoring"
    ]
  },
  {
    version: "2.0.0",
    date: "2024-09-10",
    type: "major" as const,
    title: "Major Update - Enhanced Experience",
    changes: [
      "🎨 Complete UI/UX redesign with sky blue theme",
      "🏃‍♂️ Advanced step tracking with health API integration",
      "💎 New tier progression system (9 phases)",
      "👥 Community features and social challenges",
      "🎁 Local deals and merchant partnerships"
    ]
  }
];

export function VersionManager() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);

  useEffect(() => {
    collectSystemInfo();
  }, []);

  const collectSystemInfo = async () => {
    try {
      // Collect comprehensive system information
      const info: SystemInfo = {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenResolution: `${screen.width}×${screen.height}`,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory}GB` : 'unknown',
        storage: await getStorageInfo()
      };

      setSystemInfo(info);
    } catch (error) {
      console.warn('Failed to collect system info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStorageInfo = async (): Promise<{ used: string; available: string }> => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage ? formatBytes(estimate.usage) : 'unknown';
        const available = estimate.quota ? formatBytes(estimate.quota - (estimate.usage || 0)) : 'unknown';
        return { used, available };
      }
    } catch (error) {
      console.warn('Storage API not available');
    }
    return { used: 'unknown', available: 'unknown' };
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEnvironmentBadge = (env: string) => {
    const variants = {
      production: 'default',
      staging: 'secondary', 
      development: 'destructive'
    };
    return variants[env as keyof typeof variants] || 'secondary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'major': return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'minor': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'patch': return <Info className="w-4 h-4 text-primary" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* App Version Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            App Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-primary">Yogic Mile</h3>
              <p className="text-sm text-muted-foreground">Walk. Earn. Stay Healthy.</p>
            </div>
            <Badge variant={getEnvironmentBadge(APP_VERSION.environment)} className="uppercase">
              {APP_VERSION.environment}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-lg font-bold">{APP_VERSION.version}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Build</p>
              <p className="text-lg font-mono">{APP_VERSION.build}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Build Date</p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDate(APP_VERSION.buildDate)}
            </p>
          </div>

          {APP_VERSION.commitHash && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Commit</p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                {APP_VERSION.commitHash}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Features in this version</p>
            <div className="flex flex-wrap gap-2">
              {APP_VERSION.features.map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      {systemInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Device Information
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedInfo(!showDetailedInfo)}
              >
                {showDetailedInfo ? 'Hide Details' : 'Show Details'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Platform</p>
                    <p className="text-sm text-muted-foreground">{systemInfo.platform}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Language</p>
                    <p className="text-sm text-muted-foreground">{systemInfo.language}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Screen</p>
                    <p className="text-sm text-muted-foreground">
                      {systemInfo.screenResolution} ({systemInfo.viewport})
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Connection</p>
                    <p className="text-sm text-muted-foreground">{systemInfo.connection}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Memory</p>
                    <p className="text-sm text-muted-foreground">{systemInfo.memory}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">{systemInfo.colorScheme}</p>
                  </div>
                </div>
              </div>
            </div>

            {showDetailedInfo && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">User Agent</p>
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    {systemInfo.userAgent}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Storage Used</p>
                    <p className="text-sm text-muted-foreground">{systemInfo.storage.used}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Storage Available</p>
                    <p className="text-sm text-muted-foreground">{systemInfo.storage.available}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => collectSystemInfo()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Info
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Release Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Release Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {RELEASE_NOTES.map((release) => (
            <div key={release.version} className="space-y-3">
              <div className="flex items-center gap-3">
                {getVersionIcon(release.type)}
                <div className="flex-1">
                  <h4 className="font-semibold">{release.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Version {release.version} • {release.date}
                  </p>
                </div>
                <Badge variant={release.version === APP_VERSION.version ? 'default' : 'secondary'}>
                  {release.version === APP_VERSION.version ? 'Current' : release.type}
                </Badge>
              </div>
              
              <ul className="space-y-1 ml-7">
                {release.changes.map((change, index) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {change}
                  </li>
                ))}
              </ul>
              
              {release !== RELEASE_NOTES[RELEASE_NOTES.length - 1] && (
                <div className="border-t pt-3" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}