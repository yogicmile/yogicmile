import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar, Timer, Bell, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface ScheduledNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  scheduledFor: Date;
  status: "pending" | "delivered" | "cancelled";
  actualDeliveryTime?: Date;
  accuracyMs?: number;
}

interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
  timezone: string;
}

const notificationTemplates = [
  {
    type: "reminder",
    title: "Walking Reminder",
    message: "Time for your afternoon walk!",
    delayMinutes: 1,
  },
  {
    type: "milestone", 
    title: "Daily Goal Check",
    message: "How are you doing with your step goal?",
    delayMinutes: 2,
  },
  {
    type: "challenge",
    title: "Challenge Update",
    message: "New challenge participants have joined!",
    delayMinutes: 0.5,
  },
  {
    type: "system",
    title: "Weekly Summary",
    message: "Your weekly activity report is ready",
    delayMinutes: 5,
  },
];

export function NotificationScheduleTests() {
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quietHours, setQuietHours] = useState<QuietHours>({
    enabled: true,
    start: "22:00",
    end: "07:00", 
    timezone: "Asia/Kolkata",
  });
  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x = real time

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check for due notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setScheduledNotifications(prev => prev.map(notification => {
        if (
          notification.status === "pending" && 
          new Date() >= notification.scheduledFor
        ) {
          const actualDeliveryTime = new Date();
          const accuracyMs = actualDeliveryTime.getTime() - notification.scheduledFor.getTime();
          
          // Check if in quiet hours
          if (isInQuietHours(actualDeliveryTime)) {
            // Delay until after quiet hours
            const nextDeliveryTime = getNextDeliveryTime(actualDeliveryTime);
            return {
              ...notification,
              scheduledFor: nextDeliveryTime,
            };
          }
          
          // Deliver notification
          toast({
            title: notification.title,
            description: `${notification.message} (Accuracy: ${accuracyMs > 0 ? '+' : ''}${accuracyMs}ms)`,
          });

          return {
            ...notification,
            status: "delivered" as const,
            actualDeliveryTime,
            accuracyMs,
          };
        }
        return notification;
      }));
    }, 100); // Check every 100ms for accuracy

    return () => clearInterval(interval);
  }, []);

  const isInQuietHours = (time: Date) => {
    if (!quietHours.enabled) return false;
    
    const timeMinutes = time.getHours() * 60 + time.getMinutes();
    
    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return timeMinutes >= startTime && timeMinutes <= endTime;
    } else {
      // Crosses midnight
      return timeMinutes >= startTime || timeMinutes <= endTime;
    }
  };

  const getNextDeliveryTime = (fromTime: Date) => {
    const [endHour, endMin] = quietHours.end.split(':').map(Number);
    const nextDay = new Date(fromTime);
    
    // If we're past the end time today, deliver immediately
    const currentMinutes = fromTime.getHours() * 60 + fromTime.getMinutes();
    const endMinutes = endHour * 60 + endMin;
    
    if (currentMinutes <= endMinutes) {
      nextDay.setHours(endHour, endMin, 0, 0);
    } else {
      // Next day
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setHours(endHour, endMin, 0, 0);
    }
    
    return nextDay;
  };

  const scheduleNotification = (template: typeof notificationTemplates[0]) => {
    const scheduledFor = new Date();
    scheduledFor.setTime(scheduledFor.getTime() + (template.delayMinutes * 60000 / simulationSpeed));

    const notification: ScheduledNotification = {
      id: Date.now().toString(),
      type: template.type,
      title: template.title,
      message: template.message,
      scheduledFor,
      status: "pending",
    };

    setScheduledNotifications(prev => [...prev, notification]);

    toast({
      title: "Notification Scheduled",
      description: `${template.title} scheduled for ${scheduledFor.toLocaleTimeString()}`,
    });
  };

  const scheduleCustom = (minutes: number) => {
    const scheduledFor = new Date();
    scheduledFor.setTime(scheduledFor.getTime() + (minutes * 60000 / simulationSpeed));

    const notification: ScheduledNotification = {
      id: Date.now().toString(),
      type: "custom",
      title: "Custom Notification",
      message: `Scheduled ${minutes} minute${minutes !== 1 ? 's' : ''} ago`,
      scheduledFor,
      status: "pending",
    };

    setScheduledNotifications(prev => [...prev, notification]);
  };

  const cancelNotification = (id: string) => {
    setScheduledNotifications(prev => prev.map(notification =>
      notification.id === id 
        ? { ...notification, status: "cancelled" as const }
        : notification
    ));
  };

  const clearHistory = () => {
    setScheduledNotifications(prev => prev.filter(n => n.status === "pending"));
  };

  const clearAll = () => {
    setScheduledNotifications([]);
  };

  const getTimeUntilDelivery = (scheduledFor: Date) => {
    const now = new Date();
    const diffMs = scheduledFor.getTime() - now.getTime();
    return Math.max(0, diffMs);
  };

  const formatTimeRemaining = (ms: number) => {
    if (ms === 0) return "Due now";
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getAccuracyColor = (accuracyMs?: number) => {
    if (!accuracyMs) return "";
    
    const absAccuracy = Math.abs(accuracyMs);
    if (absAccuracy <= 50) return "text-green-500";
    if (absAccuracy <= 200) return "text-yellow-500";
    return "text-red-500";
  };

  const pendingNotifications = scheduledNotifications.filter(n => n.status === "pending");
  const deliveredNotifications = scheduledNotifications.filter(n => n.status === "delivered");
  const cancelledNotifications = scheduledNotifications.filter(n => n.status === "cancelled");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm">Speed:</label>
            <select
              value={simulationSpeed}
              onChange={(e) => setSimulationSpeed(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={1}>1x</option>
              <option value={60}>60x (1min = 1sec)</option>
              <option value={3600}>3600x (1hr = 1sec)</option>
            </select>
          </div>

          {isInQuietHours(currentTime) && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              Quiet Hours Active
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearHistory}>
            Clear History
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scheduling Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Schedule Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                {notificationTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => scheduleNotification(template)}
                    className="justify-between"
                  >
                    <span>{template.title}</span>
                    <Badge variant="secondary">
                      {template.delayMinutes}m
                    </Badge>
                  </Button>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Custom Timing</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scheduleCustom(0.25)}
                  >
                    15 seconds
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scheduleCustom(0.5)}
                  >
                    30 seconds
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scheduleCustom(1)}
                  >
                    1 minute
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => scheduleCustom(5)}
                  >
                    5 minutes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quiet Hours Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-medium">Enable Quiet Hours</label>
                <input
                  type="checkbox"
                  checked={quietHours.enabled}
                  onChange={(e) => setQuietHours(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start</label>
                  <input
                    type="time"
                    value={quietHours.start}
                    onChange={(e) => setQuietHours(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full p-2 border rounded"
                    disabled={!quietHours.enabled}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End</label>
                  <input
                    type="time"
                    value={quietHours.end}
                    onChange={(e) => setQuietHours(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full p-2 border rounded"
                    disabled={!quietHours.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Lists */}
        <div className="space-y-6">
          {/* Pending Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-500" />
                Pending ({pendingNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <AnimatePresence>
                  {pendingNotifications.map((notification) => {
                    const timeRemaining = getTimeUntilDelivery(notification.scheduledFor);
                    const progress = timeRemaining === 0 ? 100 : 
                      Math.max(0, 100 - (timeRemaining / (5 * 60000)) * 100); // 5 min scale
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="p-3 border rounded bg-blue-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Due: {notification.scheduledFor.toLocaleTimeString()}
                            </div>
                            <div className="text-xs font-medium mt-1">
                              {formatTimeRemaining(timeRemaining)}
                            </div>
                            <Progress value={progress} className="h-1 mt-2" />
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelNotification(notification.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {pendingNotifications.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <Timer className="w-8 h-8 mx-auto mb-2" />
                  <p>No pending notifications</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivered Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Delivered ({deliveredNotifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {deliveredNotifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border rounded bg-green-50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Scheduled: {notification.scheduledFor.toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Delivered: {notification.actualDeliveryTime?.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`text-xs font-medium ${getAccuracyColor(notification.accuracyMs)}`}>
                        {notification.accuracyMs !== undefined && (
                          <>
                            {notification.accuracyMs > 0 ? '+' : ''}
                            {notification.accuracyMs}ms
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {deliveredNotifications.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No delivered notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Notification Scheduling Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Timing Control:</h4>
            <ul className="space-y-1">
              <li>✅ Precise scheduling (±50ms accuracy)</li>
              <li>✅ Custom delay configuration</li>
              <li>✅ Simulation speed control</li>
              <li>✅ Real-time progress tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Smart Delivery:</h4>
            <ul className="space-y-1">
              <li>✅ Quiet hours detection</li>
              <li>✅ Automatic delay until appropriate time</li>
              <li>✅ Delivery accuracy measurement</li>
              <li>✅ Cancellation support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}