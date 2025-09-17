import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Activity,
  Database
} from 'lucide-react';
import { backgroundSyncManager } from '@/services/BackgroundSyncManager';
import { cacheManager } from '@/services/CacheManager';

interface SyncStatus {
  pending: number;
  failed: number;
  isOnline: boolean;
  isSyncing: boolean;
}

interface CacheStats {
  size: number;
  maxSize: number;
  utilizationPercentage: number;
}

export const SyncStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pending: 0,
    failed: 0,
    isOnline: navigator.onLine,
    isSyncing: false
  });
  const [cacheStats, setCacheStats] = useState<CacheStats>({
    size: 0,
    maxSize: 50 * 1024 * 1024,
    utilizationPercentage: 0
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const updateStatus = async () => {
      const status = await backgroundSyncManager.getQueueStatus();
      setSyncStatus(status);
      
      const stats = await cacheManager.getCacheStats();
      setCacheStats(stats);
    };

    // Initial load
    updateStatus();

    // Update every 30 seconds
    const interval = setInterval(updateStatus, 30000);

    // Listen for online/offline events
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleForceSync = async () => {
    setLastSyncTime(new Date());
    await backgroundSyncManager.forcSync();
    
    // Update status after sync
    setTimeout(async () => {
      const status = await backgroundSyncManager.getQueueStatus();
      setSyncStatus(status);
    }, 2000);
  };

  const handleClearCache = async () => {
    await cacheManager.performMaintenance();
    const stats = await cacheManager.getCacheStats();
    setCacheStats(stats);
  };

  const getConnectionIcon = () => {
    if (!syncStatus.isOnline) {
      return <WifiOff className="w-4 h-4 text-red-500" />;
    }
    
    if (syncStatus.isSyncing) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    if (syncStatus.pending > 0) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    
    if (syncStatus.failed > 0) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.pending > 0) return `${syncStatus.pending} pending`;
    if (syncStatus.failed > 0) return `${syncStatus.failed} failed`;
    return 'Up to date';
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline || syncStatus.failed > 0) return 'destructive';
    if (syncStatus.pending > 0 || syncStatus.isSyncing) return 'secondary';
    return 'default';
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact Status Indicator */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(!expanded)}
        className="bg-background/95 backdrop-blur-sm border shadow-lg"
      >
        {getConnectionIcon()}
        <span className="ml-2">{getStatusText()}</span>
      </Button>

      {/* Expanded Status Panel */}
      {expanded && (
        <Card className="absolute bottom-12 right-0 w-80 bg-background/95 backdrop-blur-sm border shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sync & Performance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection</span>
              <Badge variant={syncStatus.isOnline ? 'default' : 'destructive'}>
                {syncStatus.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {/* Sync Queue Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sync Queue</span>
                <Badge variant={getStatusColor()}>
                  {getStatusText()}
                </Badge>
              </div>
              
              {syncStatus.pending > 0 && (
                <div className="text-xs text-muted-foreground">
                  {syncStatus.pending} items waiting to sync
                </div>
              )}
              
              {syncStatus.failed > 0 && (
                <div className="text-xs text-red-500">
                  {syncStatus.failed} items failed to sync
                </div>
              )}
            </div>

            {/* Cache Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cache Usage</span>
                <span className="text-xs text-muted-foreground">
                  {(cacheStats.size / 1024 / 1024).toFixed(1)}MB / 
                  {(cacheStats.maxSize / 1024 / 1024).toFixed(0)}MB
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    cacheStats.utilizationPercentage > 80 ? 'bg-red-500' :
                    cacheStats.utilizationPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(cacheStats.utilizationPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Last Sync Time */}
            {lastSyncTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-xs text-muted-foreground">
                  {lastSyncTime.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleForceSync}
                disabled={!syncStatus.isOnline || syncStatus.isSyncing}
                className="flex-1"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync Now
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleClearCache}
                className="flex-1"
              >
                <Database className="w-3 h-3 mr-1" />
                Clear Cache
              </Button>
            </div>

            {/* Data Freshness Indicators */}
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
              <div className="flex justify-between">
                <span>Profile Data:</span>
                <span className="text-green-500">Fresh</span>
              </div>
              <div className="flex justify-between">
                <span>Step Data:</span>
                <span className="text-green-500">Fresh</span>
              </div>
              <div className="flex justify-between">
                <span>Wallet Balance:</span>
                <span className="text-yellow-500">2 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Mini sync status for header/nav bars
export const MiniSyncStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update pending count periodically
    const updatePendingCount = async () => {
      const status = await backgroundSyncManager.getQueueStatus();
      setPendingCount(status.pending);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 60000); // Every minute

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (!isOnline) {
    return (
      <Badge variant="destructive" className="text-xs">
        <WifiOff className="w-3 h-3 mr-1" />
        Offline
      </Badge>
    );
  }

  if (pendingCount > 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Clock className="w-3 h-3 mr-1" />
        {pendingCount}
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="text-xs bg-green-500">
      <Wifi className="w-3 h-3 mr-1" />
      Synced
    </Badge>
  );
};