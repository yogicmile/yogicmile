import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDeviceConnection, ConnectedDevice, DeviceOption } from '@/hooks/use-device-connection';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Smartphone, Wifi, WifiOff, RefreshCw, Settings, Battery, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DeviceConnectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();
  const {
    connectedDevices,
    supportedDevices,
    isLoading,
    syncStatus,
    connectDevice,
    disconnectDevice,
    manualSync,
    updateDeviceSettings,
    connectionSummary,
  } = useDeviceConnection();

  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(null);

  const getStatusIcon = (status: ConnectedDevice['connectionStatus']) => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-success" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-warning animate-spin" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-destructive" />;
      default:
        return <WifiOff className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: ConnectedDevice['connectionStatus']) => {
    switch (status) {
      case 'connected':
        return 'bg-success text-success-foreground';
      case 'syncing':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4 p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Connected Devices</h1>
            <p className="text-sm text-muted-foreground">
              Sync with your fitness wearables
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Connection Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {connectionSummary.total === 0 ? 'No Devices Connected' : `${connectionSummary.connected}/${connectionSummary.total} Connected`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {connectionSummary.total === 0 
                      ? 'Connect your first wearable device'
                      : `${connectionSummary.syncing} syncing, ${connectionSummary.errors} errors`
                    }
                  </p>
                </div>
              </div>
              {connectionSummary.allConnected && (
                <Badge className="bg-success text-success-foreground">
                  All Connected
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guest Message */}
        {isGuest && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="font-medium text-warning-foreground">
                  🔐 Sign Up Required
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create an account to connect and sync with your fitness devices
                </p>
                <Button className="mt-3" onClick={() => navigate('/signup')}>
                  Sign Up Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected Devices */}
        {connectedDevices.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your Devices</h2>
            {connectedDevices.map((device) => (
              <Card key={device.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {supportedDevices.find(d => d.type === device.deviceType)?.logo || '⌚'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{device.deviceName || device.deviceBrand}</p>
                          {getStatusIcon(device.connectionStatus)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Last sync: {formatLastSync(device.lastSyncTime)}</span>
                          {device.batteryLevel && (
                            <>
                              <Battery className="w-3 h-3 ml-2" />
                              <span>{device.batteryLevel}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(device.connectionStatus)}>
                        {device.connectionStatus}
                      </Badge>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedDevice(device)}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Device Settings</DialogTitle>
                            <DialogDescription>
                              Configure {device.deviceName || device.deviceBrand} sync preferences
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Sync Frequency</label>
                              <Select 
                                defaultValue={device.syncSettings.frequency}
                                onValueChange={(value) => 
                                  updateDeviceSettings(device.id, { 
                                    frequency: value as ConnectedDevice['syncSettings']['frequency'] 
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="real_time">Real-time</SelectItem>
                                  <SelectItem value="15min">Every 15 minutes</SelectItem>
                                  <SelectItem value="30min">Every 30 minutes</SelectItem>
                                  <SelectItem value="1hour">Every hour</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-3">
                              <label className="text-sm font-medium">Data Types</label>
                              {['steps', 'heart_rate', 'calories', 'sleep'].map((dataType) => (
                                <div key={dataType} className="flex items-center justify-between">
                                  <span className="capitalize">{dataType.replace('_', ' ')}</span>
                                  <Switch 
                                    checked={device.syncSettings.dataTypes.includes(dataType)}
                                    onCheckedChange={(checked) => {
                                      const newDataTypes = checked 
                                        ? [...device.syncSettings.dataTypes, dataType]
                                        : device.syncSettings.dataTypes.filter(t => t !== dataType);
                                      updateDeviceSettings(device.id, { dataTypes: newDataTypes });
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                            
                            <Separator />
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => manualSync(device.id)}
                                disabled={syncStatus === 'syncing'}
                              >
                                {syncStatus === 'syncing' ? (
                                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Manual Sync
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => disconnectDevice(device.id)}
                              >
                                Disconnect
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Available Devices */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Available Devices</h2>
            <Badge variant="secondary">All FREE</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedDevices.map((deviceOption) => {
              const isAlreadyConnected = connectedDevices.some(
                d => d.deviceType === deviceOption.type
              );
              
              return (
                <Card 
                  key={deviceOption.type} 
                  className={`hover:shadow-md transition-all ${isAlreadyConnected ? 'opacity-50' : 'cursor-pointer hover:scale-105'}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{deviceOption.logo}</div>
                        <div>
                          <CardTitle className="text-base">{deviceOption.name}</CardTitle>
                          <CardDescription>by {deviceOption.brand}</CardDescription>
                        </div>
                      </div>
                      {deviceOption.isSupported ? (
                        <Badge className="bg-success text-success-foreground">
                          Supported
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Coming Soon</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1 mb-4">
                      {deviceOption.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button 
                      className="w-full"
                      disabled={!deviceOption.isSupported || isAlreadyConnected || isLoading || isGuest}
                      onClick={() => connectDevice(deviceOption)}
                    >
                      {isAlreadyConnected ? 'Already Connected' : 
                       isGuest ? 'Sign Up to Connect' :
                       isLoading ? 'Connecting...' : 'Connect Device'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Having trouble connecting your device? Check our troubleshooting guide or contact support.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Troubleshooting Guide
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};