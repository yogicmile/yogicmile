import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useNotificationSettings } from '@/hooks/use-notification-settings';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Trophy, 
  MapPin, 
  Coins,
  TestTube,
  RotateCcw,
  Loader2
} from 'lucide-react';
import footprintIcon from '@/assets/footprint-icon.png';

export const NotificationSettings: React.FC = () => {
  const {
    settings,
    isLoading,
    isSaving,
    toggleSetting,
    updateQuietHours,
    updateReminderFrequency,
    testNotification,
    resetToDefaults,
  } = useNotificationSettings();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading notification settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Notification settings not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Customize when and how you receive notifications
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              <Bell className="h-3 w-3 mr-1" />
              Push Ready
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Walking Reminders */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <img src={footprintIcon} alt="steps" className="h-4 w-4" />
                <Label className="text-base font-medium">Walking Reminders</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get reminded to take walks after periods of inactivity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.walking_reminders_enabled}
                onCheckedChange={(checked) => toggleSetting('walking_reminders_enabled', checked)}
                disabled={isSaving}
              />
              {settings.walking_reminders_enabled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testNotification('reminder')}
                  disabled={isSaving}
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Coin Expiry Alerts */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                <Label className="text-base font-medium">Coin Expiry Alerts</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Get notified when your earned coins are about to expire
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.coin_expiry_alerts}
                onCheckedChange={(checked) => toggleSetting('coin_expiry_alerts', checked)}
                disabled={isSaving}
              />
              {settings.coin_expiry_alerts && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testNotification('coin_expiry')}
                  disabled={isSaving}
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Achievement Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-orange-500" />
                <Label className="text-base font-medium">Achievement Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Celebrate your milestones and unlock notifications
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.achievement_notifications}
                onCheckedChange={(checked) => toggleSetting('achievement_notifications', checked)}
                disabled={isSaving}
              />
              {settings.achievement_notifications && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testNotification('achievement')}
                  disabled={isSaving}
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Location Deals */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500" />
                <Label className="text-base font-medium">Location-Based Deals</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Discover offers and coupons available in your area
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={settings.location_deals_enabled}
                onCheckedChange={(checked) => toggleSetting('location_deals_enabled', checked)}
                disabled={isSaving}
              />
              {settings.location_deals_enabled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testNotification('deal')}
                  disabled={isSaving}
                >
                  <TestTube className="h-3 w-3 mr-1" />
                  Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timing Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Timing & Frequency</CardTitle>
          <CardDescription>
            Control when and how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reminder Frequency */}
          <div className="space-y-2">
            <Label>Reminder Frequency</Label>
            <Select
              value={settings.reminder_frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'custom') => 
                updateReminderFrequency(value)
              }
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Reminders</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="custom">Custom Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label className="text-base font-medium">Quiet Hours</Label>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Set times when you don't want to receive notifications
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={settings.quiet_hours_start.substring(0, 5)}
                  onChange={(e) => {
                    const newStart = e.target.value + ':00';
                    updateQuietHours(newStart, settings.quiet_hours_end);
                  }}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={settings.quiet_hours_end.substring(0, 5)}
                  onChange={(e) => {
                    const newEnd = e.target.value + ':00';
                    updateQuietHours(settings.quiet_hours_start, newEnd);
                  }}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          {/* Timezone Display */}
          <div className="space-y-2">
            <Label>Timezone</Label>
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
              {settings.timezone}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reset Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Reset Settings</CardTitle>
          <CardDescription>
            Restore notification preferences to default values
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-2" />
            )}
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};