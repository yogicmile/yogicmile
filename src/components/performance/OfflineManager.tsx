import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload, 
  Database,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineData {
  stepHistory: any[];
  walletBalance: number;
  achievements: any[];
  cachedAt: string;
}

interface PendingSync {
  id: string;
  type: 'steps' | 'transaction' | 'achievement';
  data: any;
  timestamp: string;
}

export const OfflineManager: React.FC = () => {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [pendingSync, setPendingSync] = useState<PendingSync[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Connection restored. Syncing pending data...",
        variant: "default"
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You're now offline. Data will be cached locally.",
        variant: "default"
      });
      cacheCurrentData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data and pending sync items
    loadOfflineData();
    loadPendingSync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    const cached = localStorage.getItem('offline_data');
    if (cached) {
      setOfflineData(JSON.parse(cached));
    }

    const lastSync = localStorage.getItem('last_sync_time');
    if (lastSync) {
      setLastSyncTime(lastSync);
    }
  };

  const loadPendingSync = () => {
    const pending = localStorage.getItem('pending_sync');
    if (pending) {
      setPendingSync(JSON.parse(pending));
    }
  };

  const cacheCurrentData = async () => {
    try {
      // Simulate caching current app data
      const dataToCache: OfflineData = {
        stepHistory: JSON.parse(localStorage.getItem('step_history') || '[]'),
        walletBalance: parseFloat(localStorage.getItem('wallet_balance') || '0'),
        achievements: JSON.parse(localStorage.getItem('achievements') || '[]'),
        cachedAt: new Date().toISOString()
      };

      localStorage.setItem('offline_data', JSON.stringify(dataToCache));
      setOfflineData(dataToCache);

      toast({
        title: "Data Cached",
        description: "Current data has been saved for offline access",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const addPendingSync = (type: PendingSync['type'], data: any) => {
    const newSyncItem: PendingSync = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      data,
      timestamp: new Date().toISOString()
    };

    const updated = [...pendingSync, newSyncItem];
    setPendingSync(updated);
    localStorage.setItem('pending_sync', JSON.stringify(updated));
  };

  const syncPendingData = async () => {
    if (!isOnline || pendingSync.length === 0) return;

    try {
      // Simulate syncing pending data
      for (const item of pendingSync) {
        console.log(`Syncing ${item.type}:`, item.data);
        // In a real app, this would make API calls to sync data
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Clear pending sync after successful sync
      setPendingSync([]);
      localStorage.removeItem('pending_sync');
      
      const syncTime = new Date().toISOString();
      setLastSyncTime(syncTime);
      localStorage.setItem('last_sync_time', syncTime);

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${pendingSync.length} items`,
        variant: "default"
      });
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Some items could not be synced. Will retry later.",
        variant: "destructive"
      });
    }
  };

  const clearOfflineData = () => {
    localStorage.removeItem('offline_data');
    localStorage.removeItem('pending_sync');
    localStorage.removeItem('last_sync_time');
    setOfflineData(null);
    setPendingSync([]);
    setLastSyncTime(null);

    toast({
      title: "Cache Cleared",
      description: "All offline data has been cleared",
      variant: "default"
    });
  };

  const simulateOfflineAction = () => {
    // Simulate adding steps while offline
    addPendingSync('steps', {
      steps: 1000,
      date: new Date().toISOString().split('T')[0],
      coins_earned: 40
    });

    toast({
      title: "Action Queued",
      description: "Step data added to sync queue",
      variant: "default"
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            Offline Manager
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="font-medium">Cached Data</p>
              <p className="text-sm text-muted-foreground">
                {offlineData ? 'Available' : 'No cache'}
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Upload className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <p className="font-medium">Pending Sync</p>
              <p className="text-sm text-muted-foreground">
                {pendingSync.length} items
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="font-medium">Last Sync</p>
              <p className="text-sm text-muted-foreground">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={cacheCurrentData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Cache Data
            </Button>
            
            <Button 
              onClick={syncPendingData}
              disabled={!isOnline || pendingSync.length === 0}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Sync Now
            </Button>

            <Button 
              onClick={simulateOfflineAction}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Test Offline Action
            </Button>

            <Button 
              onClick={clearOfflineData}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {offlineData && (
        <Card>
          <CardHeader>
            <CardTitle>Cached Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Step History:</strong> {offlineData.stepHistory.length} entries</p>
              <p><strong>Wallet Balance:</strong> ₹{offlineData.walletBalance.toFixed(2)}</p>
              <p><strong>Achievements:</strong> {offlineData.achievements.length} items</p>
              <p className="text-muted-foreground">
                Cached at: {new Date(offlineData.cachedAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {pendingSync.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Sync Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingSync.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <Badge variant="outline">{item.type}</Badge>
                    <p className="text-sm text-muted-foreground ml-2">
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          <strong>Offline Features:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>View cached step history and achievements</li>
            <li>Access saved wallet balance</li>
            <li>Continue using basic app features</li>
            <li>Queue actions for automatic sync when online</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};