import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationReminderTests } from "@/components/notifications/NotificationReminderTests";
import { NotificationAchievementTests } from "@/components/notifications/NotificationAchievementTests";
import { NotificationPreferenceTests } from "@/components/notifications/NotificationPreferenceTests";
import { NotificationDeepLinkTests } from "@/components/notifications/NotificationDeepLinkTests";
import { NotificationDNDTests } from "@/components/notifications/NotificationDNDTests";
import { NotificationScheduleTests } from "@/components/notifications/NotificationScheduleTests";

export default function NotificationTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Notification System Testing</h1>
        <p className="text-muted-foreground">Test all notification types, preferences, and delivery scenarios</p>
      </div>

      <Tabs defaultValue="reminders" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="deeplink">Deep Links</TabsTrigger>
          <TabsTrigger value="dnd">Do Not Disturb</TabsTrigger>
          <TabsTrigger value="schedule">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Walking Reminder Tests (TC084)</CardTitle>
              <CardDescription>Test inactivity detection and reminder notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationReminderTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Alert Tests (TC085)</CardTitle>
              <CardDescription>Test immediate achievement notification delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationAchievementTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preference Tests (TC086-TC088)</CardTitle>
              <CardDescription>Test notification settings and disabled notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferenceTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deeplink">
          <Card>
            <CardHeader>
              <CardTitle>Deep Link Tests (TC087)</CardTitle>
              <CardDescription>Test notification tapping and app navigation</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationDeepLinkTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dnd">
          <Card>
            <CardHeader>
              <CardTitle>Do Not Disturb Tests (TC089)</CardTitle>
              <CardDescription>Test DND mode detection and notification queuing</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationDNDTests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Notification Scheduling Tests</CardTitle>
              <CardDescription>Test timing accuracy and quiet hours functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationScheduleTests />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}