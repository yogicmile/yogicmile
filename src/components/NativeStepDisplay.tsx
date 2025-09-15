import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNativeStepTracking } from '@/hooks/use-native-step-tracking';
import { 
  Activity, 
  Zap, 
  MapPin, 
  Smartphone, 
  Signal,
  Play,
  Pause,
  RotateCcw,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NativeStepDisplayProps {
  className?: string;
}

export const NativeStepDisplay: React.FC<NativeStepDisplayProps> = ({ className }) => {
  const {
    stepData,
    isTracking,
    permissions,
    addStepEvent,
    resetDaily,
    syncPendingSteps,
    simulateSteps,
  } = useNativeStepTracking();

  const [animatedSteps, setAnimatedSteps] = useState(stepData.dailySteps);

  // Animate step count changes
  useEffect(() => {
    if (stepData.dailySteps !== animatedSteps) {
      const increment = stepData.dailySteps > animatedSteps ? 1 : -1;
      const timer = setInterval(() => {
        setAnimatedSteps(prev => {
          const next = prev + increment;
          if ((increment > 0 && next >= stepData.dailySteps) || 
              (increment < 0 && next <= stepData.dailySteps)) {
            clearInterval(timer);
            return stepData.dailySteps;
          }
          return next;
        });
      }, 50);
      return () => clearInterval(timer);
    }
  }, [stepData.dailySteps, animatedSteps]);

  const progressPercentage = (stepData.dailySteps / 12000) * 100;
  const coinsEarned = Math.floor(stepData.dailySteps / 25);
  const pendingCoins = Math.floor(stepData.pendingSteps / 25);

  const getSpeedColor = () => {
    if (stepData.currentSpeed <= 6) return 'text-green-500';
    if (stepData.currentSpeed <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyColor = () => {
    if (stepData.gpsAccuracy <= 10) return 'text-green-500';
    if (stepData.gpsAccuracy <= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Step Counter */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className={cn(
                "h-5 w-5 transition-colors",
                isTracking ? "text-green-500 animate-pulse" : "text-muted-foreground"
              )} />
              Native Step Tracking
            </span>
            <Badge variant={isTracking ? "default" : "secondary"}>
              {isTracking ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Daily Steps */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {animatedSteps.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              of 12,000 daily steps
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Real-time Stats Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                Speed
              </div>
              <div className={cn("text-lg font-semibold", getSpeedColor())}>
                {stepData.currentSpeed.toFixed(1)} km/h
              </div>
              <div className="text-xs">
                {stepData.isValidSpeed ? "✅ Valid" : "⚠️ Too Fast"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Signal className="h-3 w-3" />
                GPS Accuracy
              </div>
              <div className={cn("text-lg font-semibold", getAccuracyColor())}>
                {stepData.gpsAccuracy.toFixed(0)}m
              </div>
              <div className="text-xs">
                {stepData.gpsAccuracy <= 10 ? "🎯 Excellent" : 
                 stepData.gpsAccuracy <= 50 ? "👍 Good" : "📍 Poor"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                Coins Earned
              </div>
              <div className="text-lg font-semibold text-tier-1-paisa">
                {coinsEarned}
              </div>
              <div className="text-xs text-muted-foreground">
                Total today
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                Pending Sync
              </div>
              <div className="text-lg font-semibold text-orange-500">
                {pendingCoins}
              </div>
              <div className="text-xs text-muted-foreground">
                {stepData.pendingSteps} steps
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Permissions & Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center space-y-1">
              <MapPin className={cn(
                "h-4 w-4 mx-auto",
                permissions.location ? "text-green-500" : "text-red-500"
              )} />
              <div>Location</div>
              <Badge variant={permissions.location ? "default" : "destructive"} className="text-xs">
                {permissions.location ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="text-center space-y-1">
              <Smartphone className={cn(
                "h-4 w-4 mx-auto",
                permissions.notifications ? "text-green-500" : "text-red-500"
              )} />
              <div>Notifications</div>
              <Badge variant={permissions.notifications ? "default" : "destructive"} className="text-xs">
                {permissions.notifications ? "✓" : "✗"}
              </Badge>
            </div>
            <div className="text-center space-y-1">
              <Activity className={cn(
                "h-4 w-4 mx-auto",
                permissions.motion ? "text-green-500" : "text-red-500"
              )} />
              <div>Motion</div>
              <Badge variant={permissions.motion ? "default" : "destructive"} className="text-xs">
                {permissions.motion ? "✓" : "✗"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => simulateSteps(50)}
          variant="outline"
          size="sm"
          className="h-auto py-2"
        >
          <Play className="h-3 w-3 mr-1" />
          Test +50 Steps
        </Button>
        <Button
          onClick={syncPendingSteps}
          variant="outline"
          size="sm"
          className="h-auto py-2"
          disabled={stepData.pendingSteps === 0}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Sync Now
        </Button>
      </div>

      {/* Lifetime Stats */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-muted-foreground">
              {stepData.lifetimeSteps.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Lifetime Steps
            </div>
            <div className="text-xs text-tier-1-paisa">
              {Math.floor(stepData.lifetimeSteps / 25)} total coins earned
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Sync Info */}
      <div className="text-xs text-center text-muted-foreground">
        Last sync: {stepData.lastSyncTime.toLocaleTimeString()}
        <br />
        Battery optimized: {stepData.batteryOptimized ? "✅ Yes" : "⚠️ No"}
      </div>
    </div>
  );
};