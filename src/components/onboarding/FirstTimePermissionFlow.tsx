import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  Bell, 
  Battery, 
  CheckCircle,
  Shield,
  ChevronRight,
  Smartphone,
  Heart,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { permissionManager } from '@/services/PermissionManager';
import { useToast } from '@/hooks/use-toast';

interface FirstTimePermissionFlowProps {
  onComplete: () => void;
}

type PermissionStep = 'welcome' | 'activity' | 'notifications' | 'battery' | 'complete';

export const FirstTimePermissionFlow: React.FC<FirstTimePermissionFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<PermissionStep>('welcome');
  const [completedSteps, setCompletedSteps] = useState<Set<PermissionStep>>(new Set());
  const [deviceInfo, setDeviceInfo] = useState<{ manufacturer: string; aggressive: boolean; recommendations: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    if (platform === 'android') {
      const info = await permissionManager.getDeviceRecommendations();
      setDeviceInfo(info);
    }
  };

  const markStepComplete = (step: PermissionStep) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  };

  const handleNext = (nextStep: PermissionStep) => {
    markStepComplete(currentStep);
    setCurrentStep(nextStep);
  };

  const handleWelcome = () => {
    handleNext(platform === 'ios' ? 'activity' : 'activity');
  };

  const handleActivityPermission = async () => {
    setIsLoading(true);
    try {
      if (platform === 'android') {
        const granted = await permissionManager.requestActivityRecognition();
        if (granted) {
          toast({ title: 'Permission Granted', description: 'Activity recognition enabled' });
          handleNext('notifications');
        } else {
          toast({ 
            title: 'Permission Denied', 
            description: 'You can enable this later in Settings',
            variant: 'destructive'
          });
        }
      } else if (platform === 'ios') {
        const granted = await permissionManager.requestMotionPermission();
        if (granted) {
          toast({ title: 'Permission Granted', description: 'Motion & Fitness enabled' });
          handleNext('complete');
        } else {
          toast({ 
            title: 'Permission Denied', 
            description: 'You can enable this later in iOS Settings',
            variant: 'destructive'
          });
        }
      }
    } catch (error) {
      console.error('Activity permission error:', error);
      toast({ title: 'Error', description: 'Failed to request permission', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await permissionManager.requestNotifications();
      if (granted) {
        toast({ title: 'Notifications Enabled', description: 'You\'ll receive step tracking updates' });
      }
      handleNext('battery');
    } catch (error) {
      console.error('Notification permission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatteryOptimization = async () => {
    setIsLoading(true);
    try {
      const result = await permissionManager.requestBatteryOptimization();
      if (result.granted) {
        toast({ title: 'Battery Optimization Disabled', description: 'Background tracking is now reliable' });
        handleNext('complete');
      } else {
        // Open manufacturer-specific settings
        await permissionManager.openBatterySettings();
        toast({ 
          title: `${deviceInfo?.manufacturer || 'Device'} Settings Opened`, 
          description: 'Please disable battery optimization manually',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Battery optimization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Start foreground service
      const result = await permissionManager.startForegroundService();
      
      if (result.success) {
        toast({ title: 'Tracking Started!', description: 'Your steps are being counted' });
        await permissionManager.markOnboardingComplete();
        onComplete();
      } else {
        toast({ title: 'Setup Complete', description: 'You can enable tracking in Settings', variant: 'default' });
        await permissionManager.markOnboardingComplete();
        onComplete();
      }
    } catch (error) {
      console.error('Complete error:', error);
      await permissionManager.markOnboardingComplete();
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    await permissionManager.markOnboardingComplete();
    onComplete();
  };

  const steps: PermissionStep[] = platform === 'ios' 
    ? ['welcome', 'activity', 'complete']
    : ['welcome', 'activity', 'notifications', 'battery', 'complete'];
  
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
              <Heart className="h-12 w-12 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Welcome to Yogic Mile!</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Transform your daily walks into rewards. We need a few permissions to track your steps accurately.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="text-center">
                <Activity className="h-10 w-10 mx-auto text-success mb-2" strokeWidth={2.5} />
                <p className="text-sm font-semibold text-foreground">Track Steps</p>
              </div>
              <div className="text-center">
                <Shield className="h-10 w-10 mx-auto text-primary mb-2" strokeWidth={2.5} />
                <p className="text-sm font-semibold text-foreground">Privacy First</p>
              </div>
              <div className="text-center">
                <Battery className="h-10 w-10 mx-auto text-warning mb-2" strokeWidth={2.5} />
                <p className="text-sm font-semibold text-foreground">Low Battery</p>
              </div>
            </div>
            <Button 
              onClick={handleWelcome} 
              size="lg" 
              className="w-full cta-button"
            >
              Get Started
              <ChevronRight className="h-5 w-5 ml-2" strokeWidth={2.5} />
            </Button>
          </div>
        );

      case 'activity':
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-success/10">
              <Activity className="h-12 w-12 text-success" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-foreground">
                {platform === 'ios' ? 'Enable Motion & Fitness' : 'Enable Step Tracking 👟'}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                {platform === 'ios' 
                  ? 'We need access to your motion data to count your steps accurately'
                  : 'We need access to your phone\'s step counter to track your daily walks'}
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-xl text-left space-y-3 border border-border">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm font-medium text-foreground">Privacy Protected - Data stays on your device</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm font-medium text-foreground">No location tracking required</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <span className="text-sm font-medium text-foreground">Minimal battery impact</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={handleActivityPermission} 
                size="lg" 
                className="w-full cta-button"
                disabled={isLoading}
              >
                {isLoading ? 'Requesting...' : 'Allow Step Tracking'}
                <Activity className="h-5 w-5 ml-2" strokeWidth={2.5} />
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="w-full">
                Set up later
              </Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-primary/10">
              <Bell className="h-12 w-12 text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-foreground">Stay Updated 🔔</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Get notified about your step milestones and reward earnings
              </p>
            </div>
            <div className="bg-primary/5 p-4 rounded-xl text-left space-y-2 border border-primary/20">
              <p className="text-sm font-medium text-foreground">• Milestone achievements</p>
              <p className="text-sm font-medium text-foreground">• Daily goal reminders</p>
              <p className="text-sm font-medium text-foreground">• Reward notifications</p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={handleNotificationPermission} 
                size="lg" 
                className="w-full cta-button"
                disabled={isLoading}
              >
                {isLoading ? 'Enabling...' : 'Enable Notifications'}
                <Bell className="h-5 w-5 ml-2" strokeWidth={2.5} />
              </Button>
              <Button variant="ghost" onClick={() => handleNext('battery')} className="w-full">
                Not now
              </Button>
            </div>
          </div>
        );

      case 'battery':
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-warning/10">
              <Battery className="h-12 w-12 text-warning" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-3 text-foreground">Keep Tracking Active ⚡</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Disable battery optimization so we can count steps in the background
              </p>
            </div>
            
            {deviceInfo?.aggressive && (
              <Alert variant="default" className="border-warning/50 bg-warning/5">
                <AlertTriangle className="h-5 w-5 text-warning" strokeWidth={2.5} />
                <AlertTitle className="text-foreground font-bold">{deviceInfo.manufacturer} Device Detected</AlertTitle>
                <AlertDescription className="text-muted-foreground text-sm">
                  This device has aggressive battery optimization. Please follow the manufacturer-specific settings.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted/30 p-4 rounded-xl text-left space-y-2 border border-border">
              <p className="text-sm font-semibold text-foreground mb-2">Benefits:</p>
              <p className="text-sm text-foreground">✓ Continuous step tracking</p>
              <p className="text-sm text-foreground">✓ Never miss a step</p>
              <p className="text-sm text-foreground">✓ Accurate reward calculation</p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleBatteryOptimization} 
                size="lg" 
                className="w-full cta-button"
                disabled={isLoading}
              >
                {isLoading ? 'Opening Settings...' : 'Optimize Settings'}
                <Battery className="h-5 w-5 ml-2" strokeWidth={2.5} />
              </Button>
              <Button variant="ghost" onClick={() => handleNext('complete')} className="w-full">
                Configure later
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6 py-4">
            <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center bg-success/10 animate-pulse">
              <CheckCircle className="h-12 w-12 text-success" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">You're All Set! 🎉</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Your step tracking is now active. Start walking to earn rewards!
              </p>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
              <Smartphone className="h-12 w-12 mx-auto text-primary mb-3" strokeWidth={2.5} />
              <p className="text-sm font-semibold text-foreground mb-2">Background Tracking Active</p>
              <p className="text-xs text-muted-foreground">
                {platform === 'android' 
                  ? 'You\'ll see a persistent notification while tracking'
                  : 'Your steps are being counted automatically'}
              </p>
            </div>
            <Button 
              onClick={handleComplete} 
              size="lg" 
              className="w-full cta-button"
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Tracking'}
              <ChevronRight className="h-5 w-5 ml-2" strokeWidth={2.5} />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-border shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-lg font-bold text-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </CardTitle>
            {currentStep !== 'complete' && (
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                Skip All
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent>
          {renderStepContent()}

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {steps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentStepIndex 
                    ? "w-8 bg-primary" 
                    : completedSteps.has(step)
                    ? "w-2 bg-success"
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
