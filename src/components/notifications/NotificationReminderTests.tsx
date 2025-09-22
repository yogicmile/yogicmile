import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Activity, Bell, BellOff, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface ActivitySession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  inactivityMinutes: number;
  isActive: boolean;
  remindersSent: number;
}

const reminderMessages = [
  "Time for a mindful walk! 🚶‍♀️",
  "Your body needs movement! Step outside 🌿", 
  "Take a walking break - you've earned it! ⭐",
  "Fresh air is calling! Time to walk 🌤️",
  "Let's get those steps in! 👟",
];

export function NotificationReminderTests() {
  const [session, setSession] = useState<ActivitySession>({
    id: "test_session",
    startTime: new Date(),
    lastActivity: new Date(),
    inactivityMinutes: 0,
    isActive: true,
    remindersSent: 0,
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    timestamp: Date;
    type: "reminder" | "urgent";
  }>>([]);

  const [simulationSpeed, setSimulationSpeed] = useState(1); // 1x = real time
  const reminderThreshold = 2; // 2 hours in production, 2 minutes in simulation

  useEffect(() => {
    if (!session.isActive) return;

    const interval = setInterval(() => {
      setSession(prev => {
        const now = new Date();
        const inactivityMs = now.getTime() - prev.lastActivity.getTime();
        const inactivityMinutes = Math.floor(inactivityMs / (60000 / simulationSpeed));
        
        let newRemindersSent = prev.remindersSent;
        
        // Check if we should send a reminder (every 2 hours of inactivity)
        const remindersDue = Math.floor(inactivityMinutes / (reminderThreshold * 60));
        
        if (remindersDue > prev.remindersSent) {
          const message = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
          
          setNotifications(prevNotifs => [...prevNotifs, {
            id: Date.now().toString(),
            message,
            timestamp: now,
            type: remindersDue >= 3 ? "urgent" : "reminder",
          }]);

          toast({
            title: "Walking Reminder 🚶‍♀️",
            description: message,
          });

          newRemindersSent = remindersDue;
        }

        return {
          ...prev,
          inactivityMinutes,
          remindersSent: newRemindersSent,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session.isActive, session.lastActivity, simulationSpeed]);

  const simulateActivity = () => {
    setSession(prev => ({
      ...prev,
      lastActivity: new Date(),
      inactivityMinutes: 0,
      remindersSent: 0,
    }));

    toast({
      title: "Activity Detected! 🎯",
      description: "Inactivity timer reset",
    });
  };

  const fastForward = (minutes: number) => {
    setSession(prev => {
      const newLastActivity = new Date(prev.lastActivity.getTime() - (minutes * 60000));
      return {
        ...prev,
        lastActivity: newLastActivity,
      };
    });
  };

  const toggleSession = () => {
    setSession(prev => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetSession = () => {
    setSession({
      id: "test_session",
      startTime: new Date(),
      lastActivity: new Date(),
      inactivityMinutes: 0,
      isActive: true,
      remindersSent: 0,
    });
    setNotifications([]);
  };

  const getActivityStatus = () => {
    if (session.inactivityMinutes < 30) return { color: "text-green-500", status: "Active" };
    if (session.inactivityMinutes < 120) return { color: "text-yellow-500", status: "Idle" };
    return { color: "text-red-500", status: "Inactive" };
  };

  const activityStatus = getActivityStatus();
  const nextReminderIn = (reminderThreshold * 60) - (session.inactivityMinutes % (reminderThreshold * 60));
  const progressToNextReminder = ((session.inactivityMinutes % (reminderThreshold * 60)) / (reminderThreshold * 60)) * 100;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge className={activityStatus.color.replace('text-', 'bg-').replace('-500', '-500/10')}>
            {activityStatus.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Simulation Speed: {simulationSpeed}x
          </span>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSession}
            className="flex items-center gap-1"
          >
            {session.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {session.isActive ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm" onClick={resetSession}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity Tracker */}
        <div className="space-y-4">
          <div className="p-4 bg-card rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Activity className={`w-5 h-5 ${activityStatus.color}`} />
              <h3 className="font-semibold">Activity Monitor</h3>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Inactive For</div>
                  <div className="font-semibold">{session.inactivityMinutes} min</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Reminders Sent</div>
                  <div className="font-semibold">{session.remindersSent}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next reminder in: {nextReminderIn} min</span>
                </div>
                <Progress value={progressToNextReminder} className="h-2" />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={simulateActivity}
                  className="flex-1"
                >
                  Log Activity
                </Button>
                <select 
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value={1}>1x</option>
                  <option value={60}>60x</option>
                  <option value={120}>120x</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Quick Fast Forward</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fastForward(30)}
              >
                +30 min
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fastForward(60)}
              >
                +1 hr
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fastForward(120)}
              >
                +2 hr
              </Button>
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications ({notifications.length})
            </h3>
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearNotifications}
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`p-3 rounded-lg border ${
                    notification.type === "urgent"
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-blue-500/10 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notification.type === "urgent" ? (
                      <BellOff className="w-4 h-4 text-red-500 mt-0.5" />
                    ) : (
                      <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge 
                      variant={notification.type === "urgent" ? "destructive" : "default"}
                      className="text-xs"
                    >
                      {notification.type}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {notifications.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>No reminders sent yet</p>
              <p className="text-sm">Notifications will appear after 2+ hours of inactivity</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Walking Reminder System:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Detection Logic:</h4>
            <ul className="space-y-1">
              <li>✅ Inactivity time tracking</li>
              <li>✅ 2-hour reminder threshold</li>
              <li>✅ Progressive urgency levels</li>
              <li>✅ Activity reset mechanism</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Notification Features:</h4>
            <ul className="space-y-1">
              <li>✅ Varied reminder messages</li>
              <li>✅ Escalation to urgent after 6hrs</li>
              <li>✅ Time-based delivery control</li>
              <li>✅ Activity acknowledgment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}