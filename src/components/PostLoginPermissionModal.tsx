import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Settings, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { permissionManager } from '@/services/PermissionManager';

interface PermissionModalProps {
  open: boolean;
  onClose: () => void;
  permissionStatus: {
    activityRecognition: boolean;
    notifications: boolean;
    location: boolean;
    motion: boolean;
    batteryOptimized: boolean;
    allGranted: boolean;
    systemHealth: number;
  };
}

export const PostLoginPermissionModal = ({ open, onClose, permissionStatus: initialStatus }: PermissionModalProps) => {
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState(initialStatus);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);
  const platform = Capacitor.getPlatform();

  useEffect(() => {
    if (!open) return;

    // Listen for app coming back to foreground (user returned from settings)
    const setupListener = async () => {
      const listener = await App.addListener('appStateChange', async (state) => {
        if (state.isActive) {
          console.log('📱 App resumed - checking permissions...');
          setIsCheckingPermissions(true);
          
          // Re-check permissions
          const newStatus = await permissionManager.checkRealTimePermissionStatus();
          setPermissionStatus(newStatus);
          setIsCheckingPermissions(false);
          
          if (newStatus.allGranted) {
            toast({
              title: "All Set! ✅",
              description: "All permissions granted. Step tracking active!",
            });
            
            // Auto-close modal and navigate to dashboard
            setTimeout(() => {
              onClose();
            }, 1500);
          }
        }
      });
      
      return listener;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, [open, onClose, toast]);

  const handleEnablePermissions = async () => {
    try {
      await permissionManager.openSystemSettings();
      
      toast({
        title: "Opening Settings",
        description: "Please enable the required permissions",
      });
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Setup Incomplete ⚠️",
      description: "Some features may not work without permissions",
      variant: "destructive",
    });
    onClose();
  };

  const getPermissionIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle2 className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getPermissionBadge = (granted: boolean) => {
    return granted ? (
      <Badge variant="default" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
        Pass
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20">
        Fail
      </Badge>
    );
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'bg-green-500';
    if (health >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleSkip()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Complete Setup Required
          </DialogTitle>
          <DialogDescription>
            Enable permissions to unlock all features and start tracking your steps
          </DialogDescription>
        </DialogHeader>

        {/* System Health */}
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">System Health</span>
            <span className="text-2xl font-bold">{permissionStatus.systemHealth}%</span>
          </div>
          <Progress value={permissionStatus.systemHealth} className="h-3">
            <div 
              className={`h-full ${getHealthColor(permissionStatus.systemHealth)} transition-all`}
              style={{ width: `${permissionStatus.systemHealth}%` }}
            />
          </Progress>
        </div>

        {/* Warning Alert */}
        {!permissionStatus.allGranted && (
          <Alert variant="destructive" className="bg-yellow-500/10 border-yellow-500/20 text-yellow-900 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Some features won't work without required permissions
            </AlertDescription>
          </Alert>
        )}

        {/* Permission List */}
        <div className="space-y-3">
          {platform === 'android' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {getPermissionIcon(permissionStatus.activityRecognition)}
                <div>
                  <p className="font-medium text-sm">Activity Recognition</p>
                  <p className="text-xs text-muted-foreground">Required for step tracking</p>
                </div>
              </div>
              {getPermissionBadge(permissionStatus.activityRecognition)}
            </div>
          )}

          {platform === 'ios' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {getPermissionIcon(permissionStatus.motion)}
                <div>
                  <p className="font-medium text-sm">Motion & Fitness</p>
                  <p className="text-xs text-muted-foreground">Required for step tracking</p>
                </div>
              </div>
              {getPermissionBadge(permissionStatus.motion)}
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {getPermissionIcon(permissionStatus.location)}
              <div>
                <p className="font-medium text-sm">Location</p>
                <p className="text-xs text-muted-foreground">Required for GPS validation</p>
              </div>
            </div>
            {getPermissionBadge(permissionStatus.location)}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {getPermissionIcon(permissionStatus.notifications)}
              <div>
                <p className="font-medium text-sm">Notifications</p>
                <p className="text-xs text-muted-foreground">Required for daily reminders</p>
              </div>
            </div>
            {getPermissionBadge(permissionStatus.notifications)}
          </div>

          {platform === 'android' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {getPermissionIcon(permissionStatus.batteryOptimized)}
                <div>
                  <p className="font-medium text-sm">Battery Optimization</p>
                  <p className="text-xs text-muted-foreground">Background tracking enabled</p>
                </div>
              </div>
              {getPermissionBadge(permissionStatus.batteryOptimized)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={handleEnablePermissions}
            disabled={isCheckingPermissions}
            className="w-full"
            size="lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Enable Permissions
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button 
            onClick={handleSkip}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={isCheckingPermissions}
          >
            Go to Dashboard
          </Button>
        </div>

        {isCheckingPermissions && (
          <p className="text-xs text-center text-muted-foreground">
            Checking permissions...
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
