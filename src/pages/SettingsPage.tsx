import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Palette, Mail, Shield, Bell, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmailPreferencesSettings } from '@/components/features/EmailPreferencesSettings';
import { useThemeCustomization } from '@/hooks/use-theme-customization';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BetaFeedbackSystem } from '@/components/beta-testing/BetaFeedbackSystem';
import { VersionManager } from '@/components/app-info/VersionManager';

export function SettingsPage() {
  const navigate = useNavigate();
  const { 
    preferences, 
    themeOptions,
    updatePreferences,
    applyTheme,
    isLoading 
  } = useThemeCustomization();

  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    milestoneAlerts: true,
    achievementCelebrations: true,
    weeklyReports: true,
    marketingEmails: false
  });

  const handleThemeChange = async (themeName: string) => {
    await updatePreferences({
      themeSettings: {
        ...preferences.themeSettings,
        themeName: themeName as any
      }
    });
    applyTheme();
  };

  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground">Customize your Yogic Mile experience</p>
          </div>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appearance" className="flex items-center gap-1">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  App Themes
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color theme - all themes are free for everyone!
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {themeOptions.map((theme) => (
                    <div
                      key={theme.name}
                      className={`
                        relative p-4 border-2 rounded-xl cursor-pointer transition-all
                        ${preferences.themeSettings.themeName === theme.name 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                        }
                      `}
                      onClick={() => handleThemeChange(theme.name)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <div>
                            <h3 className="font-semibold">{theme.displayName}</h3>
                            <p className="text-xs text-muted-foreground">{theme.description}</p>
                          </div>
                        </div>
                        {preferences.themeSettings.themeName === theme.name && (
                          <Badge variant="default">Active</Badge>
                        )}
                      </div>
                      
                      {/* Theme Preview */}
                      <div className="flex gap-2">
                        <div 
                          className="w-4 h-4 rounded-sm border"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-sm border"
                          style={{ backgroundColor: theme.secondaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-sm border"
                          style={{ backgroundColor: '#FFD700' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={preferences.layoutPreferences.compactMode}
                    onCheckedChange={(checked) => 
                      updatePreferences({
                        layoutPreferences: {
                          ...preferences.layoutPreferences,
                          compactMode: checked
                        }
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <Select 
                    value={preferences.layoutPreferences.cardLayout}
                    onValueChange={(value) => 
                      updatePreferences({
                        layoutPreferences: {
                          ...preferences.layoutPreferences,
                          cardLayout: value as 'grid' | 'list'
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries({
                  pushNotifications: { title: 'Push Notifications', desc: 'Receive app notifications on your device' },
                  milestoneAlerts: { title: 'Milestone Alerts', desc: 'Get notified when you reach step goals' },
                  achievementCelebrations: { title: 'Achievement Celebrations', desc: 'Celebrate when you unlock achievements' },
                  weeklyReports: { title: 'Weekly Reports', desc: 'Receive your weekly progress summary' },
                }).map(([key, info]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <Label>{info.title}</Label>
                      <p className="text-sm text-muted-foreground">{info.desc}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[key as keyof typeof notificationSettings]}
                      onCheckedChange={() => handleNotificationToggle(key as keyof typeof notificationSettings)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Set times when you don't want to receive notifications
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select defaultValue="22:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select defaultValue="07:00">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email">
            <EmailPreferencesSettings />
          </TabsContent>

          {/* About & Version Info */}
          <TabsContent value="about">
            <VersionManager />
          </TabsContent>
        </Tabs>

        {/* Beta Feedback System */}
        <BetaFeedbackSystem />
      </div>
    </div>
  );
}