import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Volume2, VolumeX, Vibrate, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NotificationPreferences {
  enabled: boolean;
  frequency: "all" | "important" | "none";
  types: {
    reminders: boolean;
    achievements: boolean;
    social: boolean;
    challenges: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  sound: {
    enabled: boolean;
    reminders: boolean;
    achievements: boolean;
    social: boolean;
    challenges: boolean;
  };
  vibration: {
    enabled: boolean;
    reminders: boolean;
    achievements: boolean;
    social: boolean;
    challenges: boolean;
  };
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  frequency: "all",
  types: {
    reminders: true,
    achievements: true,
    social: true,
    challenges: true,
    system: true,
  },
  quietHours: {
    enabled: true,
    start: "22:00",
    end: "07:00",
  },
  sound: {
    enabled: true,
    reminders: true,
    achievements: true,
    social: false,
    challenges: true,
  },
  vibration: {
    enabled: true,
    reminders: true,
    achievements: true,
    social: true,
    challenges: false,
  },
};

export function NotificationPreferenceTests() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    test: string;
    type: string;
    allowed: boolean;
    reason: string;
    timestamp: Date;
  }>>([]);

  const updatePreference = (path: string, value: any) => {
    setPreferences(prev => {
      const keys = path.split('.');
      const newPrefs = { ...prev };
      let current: any = newPrefs;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });

    toast({
      title: "Preference Updated ✅",
      description: "Notification settings have been saved",
    });
  };

  const isInQuietHours = () => {
    if (!preferences.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  const shouldAllowNotification = (type: keyof typeof preferences.types, priority: "normal" | "important" = "normal") => {
    // Check global enable
    if (!preferences.enabled) {
      return { allowed: false, reason: "Notifications disabled globally" };
    }

    // Check frequency filter
    if (preferences.frequency === "none") {
      return { allowed: false, reason: "Frequency set to 'none'" };
    }

    if (preferences.frequency === "important" && priority === "normal") {
      return { allowed: false, reason: "Only important notifications allowed" };
    }

    // Check type-specific setting
    if (!preferences.types[type]) {
      return { allowed: false, reason: `${type} notifications disabled` };
    }

    // Check quiet hours
    if (isInQuietHours()) {
      return { allowed: false, reason: "Currently in quiet hours" };
    }

    return { allowed: true, reason: "All checks passed" };
  };

  const testNotification = (type: keyof typeof preferences.types, priority: "normal" | "important" = "normal") => {
    const result = shouldAllowNotification(type, priority);
    
    const testResult = {
      id: Date.now().toString(),
      test: `${type} notification`,
      type: `${type} (${priority})`,
      allowed: result.allowed,
      reason: result.reason,
      timestamp: new Date(),
    };

    setTestResults(prev => [testResult, ...prev]);

    if (result.allowed) {
      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
        description: "This notification would be delivered",
      });
    } else {
      toast({
        title: "Notification Blocked",
        description: result.reason,
        variant: "destructive",
      });
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    setTestResults([]);
  };

  const notificationTypes = [
    { key: "reminders" as const, label: "Walking Reminders", description: "Inactivity alerts" },
    { key: "achievements" as const, label: "Achievement Unlocks", description: "Badge & milestone alerts" },
    { key: "social" as const, label: "Social Updates", description: "Friend requests & interactions" },
    { key: "challenges" as const, label: "Challenge Alerts", description: "New challenges & updates" },
    { key: "system" as const, label: "System Messages", description: "App updates & maintenance" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bell className={`w-5 h-5 ${preferences.enabled ? "text-primary" : "text-muted-foreground"}`} />
          <span className="font-medium">
            Notifications {preferences.enabled ? "Enabled" : "Disabled"}
          </span>
          {isInQuietHours() && (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              Quiet Hours
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearTestResults}>
            Clear Tests
          </Button>
          <Button variant="outline" size="sm" onClick={resetPreferences}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preferences Panel */}
        <div className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {preferences.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                Global Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Enable Notifications</Label>
                <Switch
                  id="enabled"
                  checked={preferences.enabled}
                  onCheckedChange={(checked) => updatePreference('enabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notification Frequency</Label>
                <select
                  value={preferences.frequency}
                  onChange={(e) => updatePreference('frequency', e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={!preferences.enabled}
                >
                  <option value="all">All Notifications</option>
                  <option value="important">Important Only</option>
                  <option value="none">None</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
              <CardDescription>Choose which types of notifications to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between">
                  <div>
                    <Label htmlFor={type.key}>{type.label}</Label>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                  <Switch
                    id={type.key}
                    checked={preferences.types[type.key]}
                    onCheckedChange={(checked) => updatePreference(`types.${type.key}`, checked)}
                    disabled={!preferences.enabled}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quiet-enabled">Enable Quiet Hours</Label>
                <Switch
                  id="quiet-enabled"
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => updatePreference('quietHours.enabled', checked)}
                  disabled={!preferences.enabled}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start">Start Time</Label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) => updatePreference('quietHours.start', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!preferences.enabled || !preferences.quietHours.enabled}
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">End Time</Label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) => updatePreference('quietHours.end', e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={!preferences.enabled || !preferences.quietHours.enabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sound & Vibration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Sound & Vibration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Sound</Label>
                    <Switch
                      checked={preferences.sound.enabled}
                      onCheckedChange={(checked) => updatePreference('sound.enabled', checked)}
                      disabled={!preferences.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {notificationTypes.slice(0, 4).map((type) => (
                      <div key={`sound-${type.key}`} className="flex items-center justify-between">
                        <span className="text-sm">{type.label}</span>
                        <Switch
                          checked={preferences.sound[type.key]}
                          onCheckedChange={(checked) => updatePreference(`sound.${type.key}`, checked)}
                          disabled={!preferences.enabled || !preferences.sound.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Vibration</Label>
                    <Switch
                      checked={preferences.vibration.enabled}
                      onCheckedChange={(checked) => updatePreference('vibration.enabled', checked)}
                      disabled={!preferences.enabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {notificationTypes.slice(0, 4).map((type) => (
                      <div key={`vibration-${type.key}`} className="flex items-center justify-between">
                        <span className="text-sm">{type.label}</span>
                        <Switch
                          checked={preferences.vibration[type.key]}
                          onCheckedChange={(checked) => updatePreference(`vibration.${type.key}`, checked)}
                          disabled={!preferences.enabled || !preferences.vibration.enabled}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>Test different notification types with current settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {notificationTypes.map((type) => (
                  <Button
                    key={type.key}
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification(type.key)}
                    className="justify-start"
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => testNotification("achievements", "important")}
                >
                  Important Alert
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => testNotification("reminders", "normal")}
                >
                  Normal Alert
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results ({testResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {testResults.map((result) => (
                  <div
                    key={result.id}
                    className={`p-3 rounded border ${
                      result.allowed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{result.test}</span>
                      <Badge variant={result.allowed ? "default" : "destructive"}>
                        {result.allowed ? "Allowed" : "Blocked"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>

              {testResults.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2" />
                  <p>No tests run yet</p>
                  <p className="text-sm">Click buttons above to test notification delivery</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Preference System Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Settings:</h4>
            <ul className="space-y-1">
              <li>✅ Global enable/disable toggle</li>
              <li>✅ Frequency filtering</li>
              <li>✅ Type-specific controls</li>
              <li>✅ Quiet hours scheduling</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Per-Type Controls:</h4>
            <ul className="space-y-1">
              <li>✅ Individual sound settings</li>
              <li>✅ Individual vibration settings</li>
              <li>✅ Priority-based filtering</li>
              <li>✅ Real-time preference testing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}