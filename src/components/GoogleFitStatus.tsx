import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { googleFitService } from '@/services/GoogleFitService';
import { formatDistanceToNow } from 'date-fns';

interface GoogleFitStatusProps {
  googleFitSteps: number;
  lastSyncTime: Date | null;
  isConnected: boolean;
  onManualSync?: () => void;
}

export const GoogleFitStatus: React.FC<GoogleFitStatusProps> = ({
  googleFitSteps,
  lastSyncTime,
  isConnected,
  onManualSync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  if (Capacitor.getPlatform() !== 'android') {
    return null; // Only show on Android
  }

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      if (onManualSync) {
        await onManualSync();
      } else {
        await googleFitService.syncSteps();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-muted-foreground';
    if (isSyncing) return 'text-primary animate-pulse';
    return 'text-primary';
  };

  const getLastSyncText = () => {
    if (!lastSyncTime) return 'Never';
    try {
      return formatDistanceToNow(new Date(lastSyncTime), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className={`h-4 w-4 ${getStatusColor()}`} />
            <CardTitle className="text-sm font-medium">Google Fit</CardTitle>
          </div>
          {isConnected ? (
            <Badge variant="default" className="gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-xs">
              <XCircle className="h-3 w-3" />
              Disconnected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground">Google Fit Steps</span>
            <span className="text-lg font-semibold text-primary">
              {isConnected ? googleFitSteps.toLocaleString() : '—'}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Sync
            </span>
            <span className="text-xs font-medium">
              {isConnected ? getLastSyncText() : '—'}
            </span>
          </div>
        </div>

        {/* Manual Sync Button */}
        {isConnected && (
          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        )}

        {/* Info Text */}
        <p className="text-xs text-muted-foreground text-center">
          {isConnected
            ? 'Auto-syncing every 2 minutes when app is active'
            : 'Connect Google Fit for multi-device step tracking'}
        </p>
      </CardContent>
    </Card>
  );
};
