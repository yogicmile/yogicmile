import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Target, Users, Trophy, Zap, Gift, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface DeepLinkNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  targetRoute: string;
  targetData?: any;
  timestamp: Date;
  tapped: boolean;
}

const notificationTemplates = [
  {
    type: "achievement",
    title: "Achievement Unlocked! 🏆",
    message: "You've unlocked the 'Step Master' badge!",
    targetRoute: "/achievements",
    targetData: { achievementId: "step_master", tab: "recent" },
    icon: <Trophy className="w-4 h-4" />,
  },
  {
    type: "milestone", 
    title: "Milestone Reached! 🎯",
    message: "Congratulations on reaching 10,000 steps!",
    targetRoute: "/",
    targetData: { highlight: "steps", showCelebration: true },
    icon: <Target className="w-4 h-4" />,
  },
  {
    type: "social",
    title: "Friend Request 👥", 
    message: "Alice sent you a friend request",
    targetRoute: "/community",
    targetData: { tab: "friends", requestId: "req_123" },
    icon: <Users className="w-4 h-4" />,
  },
  {
    type: "challenge",
    title: "New Challenge! 🏃‍♀️",
    message: "Monsoon Miles Challenge is now available",
    targetRoute: "/challenges",
    targetData: { challengeId: "monsoon_miles", action: "join" },
    icon: <Zap className="w-4 h-4" />,
  },
  {
    type: "reward",
    title: "Coins Added 💰",
    message: "25 coins from yesterday have been added",
    targetRoute: "/wallet",
    targetData: { tab: "history", transactionId: "tx_456" },
    icon: <Gift className="w-4 h-4" />,
  },
  {
    type: "spin",
    title: "Free Spin Available! 🎰",
    message: "Your daily spin wheel is ready",
    targetRoute: "/spin-wheel", 
    targetData: { autoStart: false },
    icon: <Gift className="w-4 h-4" />,
  },
  {
    type: "phase",
    title: "Phase Progress 📈",
    message: "You're 80% through Phase 2!",
    targetRoute: "/phase-journey",
    targetData: { phase: 2, showProgress: true },
    icon: <Target className="w-4 h-4" />,
  },
];

export function NotificationDeepLinkTests() {
  const [notifications, setNotifications] = useState<DeepLinkNotification[]>([]);
  const [navigationLog, setNavigationLog] = useState<Array<{
    id: string;
    action: string;
    route: string;
    data?: any;
    timestamp: Date;
  }>>([]);

  const createNotification = (template: typeof notificationTemplates[0]) => {
    const notification: DeepLinkNotification = {
      id: Date.now().toString(),
      type: template.type,
      title: template.title,
      message: template.message,
      targetRoute: template.targetRoute,
      targetData: template.targetData,
      timestamp: new Date(),
      tapped: false,
    };

    setNotifications(prev => [notification, ...prev]);

    toast({
      title: notification.title,
      description: notification.message,
      action: (
        <Button 
          size="sm" 
          onClick={() => handleNotificationTap(notification)}
        >
          Open
        </Button>
      ),
    });
  };

  const handleNotificationTap = (notification: DeepLinkNotification) => {
    // Mark as tapped
    setNotifications(prev => prev.map(n => 
      n.id === notification.id ? { ...n, tapped: true } : n
    ));

    // Log navigation
    const logEntry = {
      id: Date.now().toString(),
      action: "notification_tap",
      route: notification.targetRoute,
      data: notification.targetData,
      timestamp: new Date(),
    };

    setNavigationLog(prev => [logEntry, ...prev]);

    // Simulate navigation
    toast({
      title: "Navigation Triggered 🚀",
      description: `Opening ${notification.targetRoute}${
        notification.targetData ? ` with data: ${JSON.stringify(notification.targetData)}` : ''
      }`,
    });

    // In a real app, this would be:
    // navigate(notification.targetRoute, { state: notification.targetData });
  };

  const simulateDeepLink = (route: string, data?: any) => {
    const logEntry = {
      id: Date.now().toString(),
      action: "deep_link",
      route,
      data,
      timestamp: new Date(),
    };

    setNavigationLog(prev => [logEntry, ...prev]);

    toast({
      title: "Deep Link Opened 🔗",
      description: `Direct navigation to ${route}`,
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearNavigationLog = () => {
    setNavigationLog([]);
  };

  const resetAll = () => {
    setNotifications([]);
    setNavigationLog([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Deep Link Navigation Testing</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearNotifications}>
            Clear Notifications
          </Button>
          <Button variant="outline" size="sm" onClick={resetAll}>
            Reset All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Generators */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Test Notifications</CardTitle>
              <CardDescription>Create notifications with different deep link targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {notificationTemplates.map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => createNotification(template)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {template.icon}
                      <div className="text-left">
                        <div className="font-medium text-sm">{template.title}</div>
                        <div className="text-xs text-muted-foreground">
                          → {template.targetRoute}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Direct Deep Links</CardTitle>
              <CardDescription>Test direct navigation without notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => simulateDeepLink("/achievements", { filter: "recent" })}
                >
                  Achievements
                </Button>
                <Button
                  variant="outline"
                  size="sm" 
                  onClick={() => simulateDeepLink("/community", { tab: "leaderboard" })}
                >
                  Leaderboard
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateDeepLink("/wallet", { tab: "transactions" })}
                >
                  Wallet History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateDeepLink("/spin-wheel", { autoStart: true })}
                >
                  Auto Spin
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification List & Navigation Log */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Active Notifications ({notifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2">
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        notification.tapped 
                          ? "bg-green-50 border-green-200" 
                          : "bg-card border-border hover:bg-muted/50"
                      }`}
                      onClick={() => handleNotificationTap(notification)}
                    >
                      <div className="flex items-start gap-2">
                        <ExternalLink className="w-4 h-4 mt-0.5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{notification.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.targetRoute}
                            </Badge>
                            {notification.tapped && (
                              <Badge className="text-xs bg-green-500 text-white">
                                Tapped
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {notifications.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2" />
                  <p>No notifications</p>
                  <p className="text-sm">Generate notifications to test deep linking</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Navigation Log ({navigationLog.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearNavigationLog}>
                  Clear Log
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {navigationLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-2 bg-muted rounded border text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.action === "notification_tap" ? "default" : "secondary"}>
                          {entry.action}
                        </Badge>
                        <span className="font-mono">{entry.route}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {entry.data && (
                      <div className="mt-1 text-xs text-muted-foreground font-mono bg-background p-1 rounded">
                        {JSON.stringify(entry.data)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {navigationLog.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2" />
                  <p>No navigation events</p>
                  <p className="text-sm">Tap notifications or deep links to see logs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Deep Link System Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Navigation Targets:</h4>
            <ul className="space-y-1">
              <li>✅ Achievement gallery</li>
              <li>✅ Community sections</li>
              <li>✅ Wallet transactions</li>
              <li>✅ Challenge details</li>
              <li>✅ Phase journey</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Link Features:</h4>
            <ul className="space-y-1">
              <li>✅ Route with parameters</li>
              <li>✅ State data passing</li>
              <li>✅ Tap tracking</li>
              <li>✅ Navigation logging</li>
              <li>✅ Direct deep links</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}