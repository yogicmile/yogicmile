import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Activity, Battery, Bell, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { androidBackgroundService } from '@/services/AndroidBackgroundService';

export const BackgroundTrackingStatus: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    manufacturer: string;
    model: string;
    androidVersion: string;
  } | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    if (Capacitor.getPlatform() !== 'android') return;

    try {
      const running = await androidBackgroundService.isRunning();
      setIsRunning(running);

      const recs = await androidBackgroundService.getDeviceRecommendations();
      setRecommendations(recs);
      
      // Auto-show recommendations if service not running and has recommendations
      if (!running && recs.length > 0) {
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Failed to check service status:', error);
    }
  };

  const handleOpenSettings = async () => {
    await androidBackgroundService.openBatterySettings();
  };

  if (Capacitor.getPlatform() !== 'android') {
    return null; // Only show on Android
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Background Tracking</CardTitle>
          </div>
          {isRunning ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Inactive
            </Badge>
          )}
        </div>
        <CardDescription>
          {isRunning
            ? 'Steps are being tracked in the background with a persistent notification'
            : 'Background tracking is not active. Enable it for continuous step counting.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
            <Bell className={`h-4 w-4 ${isRunning ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs text-center">
              {isRunning ? 'Notification' : 'No Notification'}
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
            <Battery className={`h-4 w-4 ${isRunning ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs text-center">
              {isRunning ? 'Optimized' : 'Check Settings'}
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
            <Activity className={`h-4 w-4 ${isRunning ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs text-center">
              {isRunning ? 'Tracking' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Device-specific recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Device-Specific Setup Required</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p className="text-sm">
                For reliable background tracking on your device, please:
              </p>
              <ul className="text-xs space-y-1 list-disc list-inside">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Button */}
        {!isRunning && (
          <Button
            onClick={handleOpenSettings}
            variant="default"
            className="w-full gap-2"
          >
            <Settings className="h-4 w-4" />
            Open Battery Settings
          </Button>
        )}

        {/* Info Message */}
        <p className="text-xs text-muted-foreground text-center">
          {isRunning
            ? 'Check your notification bar for the tracking indicator'
            : 'Background tracking ensures accurate step counting even when the app is closed'}
        </p>
      </CardContent>
    </Card>
  );
};
