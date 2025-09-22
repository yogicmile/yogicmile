import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, Bell, BellOff, Clock, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface QueuedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  queuedAt: Date;
  priority: "low" | "normal" | "high" | "urgent";
  deliveredAt?: Date;
}

interface DNDSettings {
  enabled: boolean;
  mode: "scheduled" | "manual" | "system_detect";
  schedule: {
    start: string;
    end: string;
  };
  allowUrgent: boolean;
  allowCalls: boolean;
  queueNonUrgent: boolean;
}

const defaultDNDSettings: DNDSettings = {
  enabled: false,
  mode: "scheduled",
  schedule: {
    start: "22:00",
    end: "07:00",
  },
  allowUrgent: true,
  allowCalls: false,
  queueNonUrgent: true,
};

const notificationTypes = [
  { type: "reminder", title: "Walking Reminder", message: "Time for your daily walk!", priority: "normal" as const },
  { type: "achievement", title: "Achievement Unlocked", message: "You've earned a new badge!", priority: "high" as const },
  { type: "social", title: "Friend Request", message: "Alice sent you a friend request", priority: "normal" as const },
  { type: "urgent", title: "Safety Alert", message: "Emergency: Check your health data", priority: "urgent" as const },
  { type: "system", title: "App Update", message: "New features are available", priority: "low" as const },
];

export function NotificationDNDTests() {
  const [dndSettings, setDNDSettings] = useState<DNDSettings>(defaultDNDSettings);
  const [queuedNotifications, setQueuedNotifications] = useState<QueuedNotification[]>([]);
  const [deliveredNotifications, setDeliveredNotifications] = useState<QueuedNotification[]>([]);
  const [systemDNDActive, setSystemDNDActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isInDNDPeriod = () => {
    if (!dndSettings.enabled) return false;
    
    if (dndSettings.mode === "manual") return true;
    if (dndSettings.mode === "system_detect") return systemDNDActive;
    
    // Scheduled mode
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = dndSettings.schedule.start.split(':').map(Number);
    const [endHour, endMin] = dndSettings.schedule.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const shouldDeliverNotification = (priority: string) => {
    if (!isInDNDPeriod()) return true;
    
    if (priority === "urgent") return dndSettings.allowUrgent;
    
    return false; // Block all non-urgent during DND
  };

  const sendNotification = (template: typeof notificationTypes[0]) => {
    const notification: QueuedNotification = {
      id: Date.now().toString(),
      type: template.type,
      title: template.title,
      message: template.message,
      queuedAt: new Date(),
      priority: template.priority,
    };

    if (shouldDeliverNotification(template.priority)) {
      // Deliver immediately
      notification.deliveredAt = new Date();
      setDeliveredNotifications(prev => [notification, ...prev]);
      
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.priority === "urgent" ? "destructive" : "default",
      });
    } else {
      // Queue for later
      if (dndSettings.queueNonUrgent) {
        setQueuedNotifications(prev => [notification, ...prev]);
        
        toast({
          title: "Notification Queued",
          description: `${notification.title} queued due to Do Not Disturb`,
        });
      } else {
        toast({
          title: "Notification Blocked",
          description: `${notification.title} blocked by Do Not Disturb`,
          variant: "destructive",
        });
      }
    }
  };

  const deliverQueuedNotifications = () => {
    if (queuedNotifications.length === 0) return;

    const now = new Date();
    const delivered = queuedNotifications.map(notification => ({
      ...notification,
      deliveredAt: now,
    }));

    setDeliveredNotifications(prev => [...delivered, ...prev]);
    setQueuedNotifications([]);

    toast({
      title: "Queued Notifications Delivered",
      description: `${delivered.length} notifications delivered`,
    });
  };

  const updateDNDSetting = (key: string, value: any) => {
    setDNDSettings(prev => {
      const keys = key.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const toggleManualDND = () => {
    setDNDSettings(prev => ({
      ...prev,
      enabled: !prev.enabled,
      mode: "manual",
    }));
  };

  const clearQueued = () => {
    setQueuedNotifications([]);
  };

  const clearDelivered = () => {
    setDeliveredNotifications([]);
  };

  const resetAll = () => {
    setDNDSettings(defaultDNDSettings);
    setQueuedNotifications([]);
    setDeliveredNotifications([]);
    setSystemDNDActive(false);
  };

  // Check if DND should auto-disable (end of schedule)
  useEffect(() => {
    if (dndSettings.mode === "scheduled" && dndSettings.enabled && !isInDNDPeriod()) {
      // Auto-deliver queued notifications when DND period ends
      if (queuedNotifications.length > 0) {
        setTimeout(() => {
          deliverQueuedNotifications();
        }, 1000);
      }
    }
  }, [currentTime, dndSettings]);

  const isDNDActive = isInDNDPeriod();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isDNDActive ? (
            <Moon className="w-5 h-5 text-blue-500" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-500" />
          )}
          <span className="font-medium">
            Do Not Disturb {isDNDActive ? "Active" : "Inactive"}
          </span>
          {queuedNotifications.length > 0 && (
            <Badge variant="secondary">
              {queuedNotifications.length} Queued
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={isDNDActive ? "default" : "outline"}
            size="sm"
            onClick={toggleManualDND}
          >
            {isDNDActive ? <Moon className="w-4 h-4 mr-1" /> : <Sun className="w-4 h-4 mr-1" />}
            Toggle DND
          </Button>
          <Button variant="outline" size="sm" onClick={resetAll}>
            Reset All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DND Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDNDActive ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                Do Not Disturb Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dnd-enabled">Enable Do Not Disturb</Label>
                <Switch
                  id="dnd-enabled"
                  checked={dndSettings.enabled}
                  onCheckedChange={(checked) => updateDNDSetting('enabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>DND Mode</Label>
                <select
                  value={dndSettings.mode}
                  onChange={(e) => updateDNDSetting('mode', e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={!dndSettings.enabled}
                >
                  <option value="scheduled">Scheduled (Time-based)</option>
                  <option value="manual">Manual Control</option>
                  <option value="system_detect">System Detection</option>
                </select>
              </div>

              {dndSettings.mode === "scheduled" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dnd-start">Start Time</Label>
                    <input
                      id="dnd-start"
                      type="time"
                      value={dndSettings.schedule.start}
                      onChange={(e) => updateDNDSetting('schedule.start', e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={!dndSettings.enabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dnd-end">End Time</Label>
                    <input
                      id="dnd-end"
                      type="time"
                      value={dndSettings.schedule.end}
                      onChange={(e) => updateDNDSetting('schedule.end', e.target.value)}
                      className="w-full p-2 border rounded"
                      disabled={!dndSettings.enabled}
                    />
                  </div>
                </div>
              )}

              {dndSettings.mode === "system_detect" && (
                <div className="p-3 bg-muted rounded">
                  <div className="flex items-center justify-between">
                    <Label>Simulate System DND</Label>
                    <Switch
                      checked={systemDNDActive}
                      onCheckedChange={setSystemDNDActive}
                      disabled={!dndSettings.enabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    In production, this would detect OS-level DND settings
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-urgent">Allow Urgent Notifications</Label>
                  <Switch
                    id="allow-urgent"
                    checked={dndSettings.allowUrgent}
                    onCheckedChange={(checked) => updateDNDSetting('allowUrgent', checked)}
                    disabled={!dndSettings.enabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="queue-nonurgent">Queue Non-Urgent</Label>
                  <Switch
                    id="queue-nonurgent"
                    checked={dndSettings.queueNonUrgent}
                    onCheckedChange={(checked) => updateDNDSetting('queueNonUrgent', checked)}
                    disabled={!dndSettings.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>Send notifications to test DND behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {notificationTypes.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendNotification(template)}
                    className="justify-start"
                  >
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          template.priority === "urgent" ? "destructive" :
                          template.priority === "high" ? "default" :
                          template.priority === "low" ? "secondary" : "outline"
                        }
                        className="text-xs"
                      >
                        {template.priority}
                      </Badge>
                      <span>{template.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Queues */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pause className="w-5 h-5" />
                Queued Notifications ({queuedNotifications.length})
              </CardTitle>
              <div className="flex gap-2">
                {queuedNotifications.length > 0 && (
                  <>
                    <Button 
                      size="sm"
                      onClick={deliverQueuedNotifications}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Deliver All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearQueued}>
                      Clear Queue
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2">
                <AnimatePresence>
                  {queuedNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="p-3 bg-yellow-50 border border-yellow-200 rounded"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-sm text-muted-foreground">{notification.message}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Queued: {notification.queuedAt.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {queuedNotifications.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <Pause className="w-8 h-8 mx-auto mb-2" />
                  <p>No queued notifications</p>
                  <p className="text-sm">Send notifications during DND to see queueing</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Delivered Notifications ({deliveredNotifications.length})
              </CardTitle>
              {deliveredNotifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearDelivered}>
                  Clear History
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {deliveredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 bg-green-50 border border-green-200 rounded"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-sm text-muted-foreground">{notification.message}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.priority}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Delivered: {notification.deliveredAt?.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <Bell className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>

              {deliveredNotifications.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2" />
                  <p>No delivered notifications</p>
                  <p className="text-sm">Send notifications to see delivery history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Do Not Disturb Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">DND Modes:</h4>
            <ul className="space-y-1">
              <li>✅ Scheduled time periods</li>
              <li>✅ Manual toggle control</li>
              <li>✅ System DND detection</li>
              <li>✅ Urgent notification bypass</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Queue Management:</h4>
            <ul className="space-y-1">
              <li>✅ Non-urgent notification queueing</li>
              <li>✅ Automatic delivery on DND end</li>
              <li>✅ Manual queue management</li>
              <li>✅ Priority-based filtering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}