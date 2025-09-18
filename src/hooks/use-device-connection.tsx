import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ConnectedDevice {
  id: string;
  deviceType: string;
  deviceBrand: string;
  deviceName?: string;
  connectionStatus: 'connected' | 'disconnected' | 'syncing' | 'error';
  syncSettings: {
    frequency: 'real_time' | '15min' | '30min' | '1hour';
    dataTypes: string[];
    autoSync: boolean;
  };
  lastSyncTime: string;
  batteryLevel?: number;
  syncError?: string;
}

export interface DeviceOption {
  type: string;
  brand: string;
  name: string;
  logo: string;
  features: string[];
  isSupported: boolean;
}

const SUPPORTED_DEVICES: DeviceOption[] = [
  {
    type: 'fitbit',
    brand: 'Fitbit',
    name: 'Fitbit Devices',
    logo: '⌚',
    features: ['Steps', 'Heart Rate', 'Sleep', 'Calories'],
    isSupported: true,
  },
  {
    type: 'apple_watch',
    brand: 'Apple',
    name: 'Apple Watch',
    logo: '🍎',
    features: ['Steps', 'Heart Rate', 'Workouts', 'Health Data'],
    isSupported: true,
  },
  {
    type: 'garmin',
    brand: 'Garmin',
    name: 'Garmin Watches',
    logo: '🏃',
    features: ['GPS', 'Steps', 'Heart Rate', 'Training'],
    isSupported: true,
  },
  {
    type: 'samsung',
    brand: 'Samsung',
    name: 'Galaxy Watch',
    logo: '⚡',
    features: ['Steps', 'Health', 'Samsung Health'],
    isSupported: true,
  },
  {
    type: 'mi_band',
    brand: 'Xiaomi',
    name: 'Mi Band / Amazfit',
    logo: '🔋',
    features: ['Steps', 'Heart Rate', 'Sleep', 'Long Battery'],
    isSupported: true,
  },
  {
    type: 'amazfit',
    brand: 'Amazfit',
    name: 'Amazfit Watches',
    logo: '🏋️',
    features: ['Fitness', 'GPS', 'Health Monitoring'],
    isSupported: true,
  },
];

export const useDeviceConnection = () => {
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  // Load connected devices
  const loadConnectedDevices = useCallback(async () => {
    if (isGuest || !user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('connected_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const devices = data?.map((device): ConnectedDevice => ({
        id: device.id,
        deviceType: device.device_type,
        deviceBrand: device.device_brand,
        deviceName: device.device_name || undefined,
        connectionStatus: device.connection_status as ConnectedDevice['connectionStatus'],
        syncSettings: (device.sync_settings as any) || {
          frequency: 'real_time',
          dataTypes: ['steps'],
          autoSync: true,
        },
        lastSyncTime: device.last_sync_time,
        batteryLevel: device.battery_level || undefined,
        syncError: device.sync_error || undefined,
      })) || [];

      setConnectedDevices(devices);
    } catch (error) {
      console.error('Error loading connected devices:', error);
      toast({
        title: "Error",
        description: "Failed to load connected devices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest, toast]);

  // Connect a new device (placeholder for OAuth integration)
  const connectDevice = useCallback(async (deviceOption: DeviceOption) => {
    if (isGuest) {
      toast({
        title: "Sign Up Required",
        description: "Please sign up to connect wearable devices",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    try {
      setIsLoading(true);
      setSyncStatus('syncing');

      // In a real implementation, this would trigger OAuth flow
      // For now, we'll simulate the connection
      toast({
        title: "🔗 Connection Started",
        description: `Connecting to your ${deviceOption.name}...`,
      });

      // Simulate OAuth delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data, error } = await supabase
        .from('connected_devices')
        .insert({
          user_id: user.id,
          device_type: deviceOption.type,
          device_brand: deviceOption.brand,
          device_name: deviceOption.name,
          connection_status: 'connected',
          sync_settings: {
            frequency: 'real_time',
            dataTypes: ['steps', 'heart_rate'],
            autoSync: true,
          },
          battery_level: Math.floor(Math.random() * 40) + 60, // Random battery 60-100%
        })
        .select()
        .single();

      if (error) throw error;

      setSyncStatus('success');
      toast({
        title: "✅ Device Connected!",
        description: `${deviceOption.name} is now syncing with Yogic Mile`,
      });

      await loadConnectedDevices();
    } catch (error) {
      console.error('Error connecting device:', error);
      setSyncStatus('error');
      toast({
        title: "Connection Failed",
        description: "Failed to connect device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isGuest, toast, loadConnectedDevices]);

  // Disconnect a device
  const disconnectDevice = useCallback(async (deviceId: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('connected_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Device Disconnected",
        description: "Device has been removed from your account",
      });

      await loadConnectedDevices();
    } catch (error) {
      console.error('Error disconnecting device:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect device",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, loadConnectedDevices]);

  // Manual sync
  const manualSync = useCallback(async (deviceId: string) => {
    if (!user) return;

    try {
      setSyncStatus('syncing');
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 1500));

      const { error } = await supabase
        .from('connected_devices')
        .update({
          last_sync_time: new Date().toISOString(),
          connection_status: 'connected',
          sync_error: null,
        })
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSyncStatus('success');
      toast({
        title: "🔄 Sync Complete",
        description: "Latest data has been synchronized",
      });

      await loadConnectedDevices();
    } catch (error) {
      console.error('Error syncing device:', error);
      setSyncStatus('error');
      toast({
        title: "Sync Failed",
        description: "Unable to sync device data",
        variant: "destructive",
      });
    }
  }, [user, toast, loadConnectedDevices]);

  // Update device settings
  const updateDeviceSettings = useCallback(async (deviceId: string, settings: Partial<ConnectedDevice['syncSettings']>) => {
    if (!user) return;

    try {
      const device = connectedDevices.find(d => d.id === deviceId);
      if (!device) return;

      const updatedSettings = { ...device.syncSettings, ...settings };

      const { error } = await supabase
        .from('connected_devices')
        .update({
          sync_settings: updatedSettings,
        })
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Device sync settings have been saved",
      });

      await loadConnectedDevices();
    } catch (error) {
      console.error('Error updating device settings:', error);
      toast({
        title: "Error",
        description: "Failed to update device settings",
        variant: "destructive",
      });
    }
  }, [user, connectedDevices, toast, loadConnectedDevices]);

  // Load devices on mount
  useEffect(() => {
    loadConnectedDevices();
  }, [loadConnectedDevices]);

  // Get connection status summary
  const getConnectionSummary = useCallback(() => {
    const total = connectedDevices.length;
    const connected = connectedDevices.filter(d => d.connectionStatus === 'connected').length;
    const syncing = connectedDevices.filter(d => d.connectionStatus === 'syncing').length;
    const errors = connectedDevices.filter(d => d.connectionStatus === 'error').length;

    return {
      total,
      connected,
      syncing,
      errors,
      allConnected: total > 0 && connected === total,
    };
  }, [connectedDevices]);

  return {
    // State
    connectedDevices,
    supportedDevices: SUPPORTED_DEVICES,
    isLoading,
    syncStatus,
    
    // Actions
    connectDevice,
    disconnectDevice,
    manualSync,
    updateDeviceSettings,
    loadConnectedDevices,
    
    // Computed
    connectionSummary: getConnectionSummary(),
  };
};