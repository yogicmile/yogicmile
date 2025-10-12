import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Smartphone,
  Battery,
  Bell,
  MapPin,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useNativeStepTracking } from '@/hooks/use-native-step-tracking';

interface ValidationCheck {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  icon: React.ReactNode;
}

export const StepTrackingValidator: React.FC = () => {
  const { stepData, isTracking, permissions, syncWithGoogleFit } = useNativeStepTracking();
  const [checks, setChecks] = useState<ValidationCheck[]>([]);
  const [validationScore, setValidationScore] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    performValidation();
  }, [stepData, isTracking, permissions]);

  const performValidation = () => {
    const newChecks: ValidationCheck[] = [];
    let score = 0;
    const maxScore = 8;

    // Check 1: Platform Detection
    const platform = Capacitor.getPlatform();
    if (platform === 'android') {
      newChecks.push({
        name: 'Platform',
        status: 'success',
        message: `Running on Android device`,
        icon: <Smartphone className="h-4 w-4" />
      });
      score++;
    } else if (platform === 'ios') {
      newChecks.push({
        name: 'Platform',
        status: 'success',
        message: `Running on iOS device`,
        icon: <Smartphone className="h-4 w-4" />
      });
      score++;
    } else {
      newChecks.push({
        name: 'Platform',
        status: 'warning',
        message: 'Running in web browser - native features unavailable',
        icon: <Smartphone className="h-4 w-4" />
      });
    }

    // Check 2: Step Tracking Active
    if (isTracking) {
      newChecks.push({
        name: 'Step Tracking',
        status: 'success',
        message: 'Background tracking is active',
        icon: <Activity className="h-4 w-4" />
      });
      score++;
    } else {
      newChecks.push({
        name: 'Step Tracking',
        status: 'error',
        message: 'Step tracking is not active',
        icon: <Activity className="h-4 w-4" />
      });
    }

    // Check 3: Permissions
    const allPermissionsGranted = permissions.location && permissions.notifications && permissions.motion;
    if (allPermissionsGranted) {
      newChecks.push({
        name: 'Permissions',
        status: 'success',
        message: 'All required permissions granted',
        icon: <CheckCircle2 className="h-4 w-4" />
      });
      score++;
    } else {
      const missing = [];
      if (!permissions.location) missing.push('Location');
      if (!permissions.notifications) missing.push('Notifications');
      if (!permissions.motion) missing.push('Motion');
      
      newChecks.push({
        name: 'Permissions',
        status: 'error',
        message: `Missing: ${missing.join(', ')}`,
        icon: <XCircle className="h-4 w-4" />
      });
    }

    // Check 4: GPS Accuracy
    if (stepData.gpsAccuracy > 0 && stepData.gpsAccuracy < 50) {
      newChecks.push({
        name: 'GPS',
        status: 'success',
        message: `High accuracy (${stepData.gpsAccuracy.toFixed(0)}m)`,
        icon: <MapPin className="h-4 w-4" />
      });
      score++;
    } else if (stepData.gpsAccuracy >= 50) {
      newChecks.push({
        name: 'GPS',
        status: 'warning',
        message: `Low accuracy (${stepData.gpsAccuracy.toFixed(0)}m)`,
        icon: <MapPin className="h-4 w-4" />
      });
    } else {
      newChecks.push({
        name: 'GPS',
        status: 'pending',
        message: 'Waiting for GPS signal',
        icon: <MapPin className="h-4 w-4" />
      });
    }

    // Check 5: Speed Validation
    if (stepData.isValidSpeed) {
      newChecks.push({
        name: 'Speed',
        status: 'success',
        message: `Valid (${stepData.currentSpeed.toFixed(1)} km/h)`,
        icon: <Zap className="h-4 w-4" />
      });
      score++;
    } else {
      newChecks.push({
        name: 'Speed',
        status: 'warning',
        message: `Too high (${stepData.currentSpeed.toFixed(1)} km/h)`,
        icon: <Zap className="h-4 w-4" />
      });
    }

    // Check 6: Battery Optimization
    if (stepData.batteryOptimized) {
      newChecks.push({
        name: 'Battery',
        status: 'success',
        message: 'Battery optimization configured',
        icon: <Battery className="h-4 w-4" />
      });
      score++;
    } else {
      newChecks.push({
        name: 'Battery',
        status: 'error',
        message: 'Battery optimization not configured',
        icon: <Battery className="h-4 w-4" />
      });
    }

    // Check 7: Data Sync
    const timeSinceSync = Date.now() - stepData.lastSyncTime.getTime();
    const minutesSinceSync = Math.floor(timeSinceSync / 60000);
    
    if (minutesSinceSync < 2) {
      newChecks.push({
        name: 'Data Sync',
        status: 'success',
        message: `Last sync: ${minutesSinceSync < 1 ? 'Just now' : `${minutesSinceSync}m ago`}`,
        icon: <RefreshCw className="h-4 w-4" />
      });
      score++;
    } else if (minutesSinceSync < 5) {
      newChecks.push({
        name: 'Data Sync',
        status: 'warning',
        message: `Last sync: ${minutesSinceSync}m ago`,
        icon: <RefreshCw className="h-4 w-4" />
      });
    } else {
      newChecks.push({
        name: 'Data Sync',
        status: 'error',
        message: `Last sync: ${minutesSinceSync}m ago`,
        icon: <RefreshCw className="h-4 w-4" />
      });
    }

    // Check 8: Google Fit (Android only)
    if (platform === 'android') {
      if (stepData.googleFitConnected) {
        newChecks.push({
          name: 'Google Fit',
          status: 'success',
          message: `Connected - ${stepData.googleFitSteps} steps`,
          icon: <Activity className="h-4 w-4" />
        });
        score++;
      } else {
        newChecks.push({
          name: 'Google Fit',
          status: 'warning',
          message: 'Not connected (optional)',
          icon: <Activity className="h-4 w-4" />
        });
      }
    }

    setChecks(newChecks);
    setValidationScore((score / maxScore) * 100);
  };

  const handleRefresh = async () => {
    setIsValidating(true);
    
    // Trigger manual sync if available
    if (syncWithGoogleFit) {
      await syncWithGoogleFit();
    }
    
    // Wait a bit for data to update
    setTimeout(() => {
      performValidation();
      setIsValidating(false);
    }, 1000);
  };

  const getStatusColor = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Step Tracking Validation
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isValidating}
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription>
          System health check for accurate step counting
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Health</span>
            <span className="text-sm font-bold">{Math.round(validationScore)}%</span>
          </div>
          <Progress value={validationScore} className="h-2" />
          {validationScore === 100 && (
            <Alert className="border-green-500 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-500">All Systems Operational</AlertTitle>
              <AlertDescription className="text-green-600">
                Step tracking is configured correctly and working optimally!
              </AlertDescription>
            </Alert>
          )}
          {validationScore < 100 && validationScore >= 60 && (
            <Alert className="border-yellow-500 bg-yellow-500/10">
              <AlertTitle className="text-yellow-600">Mostly Operational</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Some issues detected. Check details below.
              </AlertDescription>
            </Alert>
          )}
          {validationScore < 60 && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Critical Issues Detected</AlertTitle>
              <AlertDescription>
                Multiple issues preventing accurate step tracking. Review and fix below.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Validation Checks */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">System Checks</h4>
          {checks.map((check, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className={getStatusColor(check.status)}>
                {check.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{check.name}</span>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Current Stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Current Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground">Today's Steps</p>
              <p className="text-2xl font-bold">{stepData.dailySteps.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground">Lifetime Steps</p>
              <p className="text-2xl font-bold">{stepData.lifetimeSteps.toLocaleString()}</p>
            </div>
            {stepData.googleFitConnected && (
              <>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">Google Fit Steps</p>
                  <p className="text-2xl font-bold">{stepData.googleFitSteps.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">Last Fit Sync</p>
                  <p className="text-sm font-medium">
                    {stepData.lastGoogleFitSync 
                      ? new Date(stepData.lastGoogleFitSync).toLocaleTimeString()
                      : 'Never'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Instructions for Web Users */}
        {Capacitor.getPlatform() === 'web' && (
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertTitle>Testing on Web Browser</AlertTitle>
            <AlertDescription>
              Native step tracking features are only available on physical Android/iOS devices. 
              Build the APK and test on a real device to validate all functionality.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};