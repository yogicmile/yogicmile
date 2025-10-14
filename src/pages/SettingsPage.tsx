import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, Palette, Mail, Shield, Bell, Info, FileText, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmailPreferencesSettings } from '@/components/features/EmailPreferencesSettings';
import { useThemeCustomization } from '@/hooks/use-theme-customization';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BetaFeedbackSystem } from '@/components/beta-testing/BetaFeedbackSystem';
import { VersionManager } from '@/components/app-info/VersionManager';
import { LegalPolicyModal } from '@/components/LegalPolicyModal';
import { ConsentManager } from '@/components/ConsentManager';
import { BackgroundTrackingStatus } from '@/components/BackgroundTrackingStatus';
import { Capacitor } from '@capacitor/core';
import { androidBackgroundService } from '@/services/AndroidBackgroundService';
import { useToast } from '@/hooks/use-toast';

export function SettingsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Settings | Yogic Mile';
  }, []);
  const { 
    preferences, 
    themeOptions,
    savePreferences,
    updateTheme,
    updateLayout,
    updateNotifications,
    updateAccessibility,
    applyTheme,
    isLoading 
  } = useThemeCustomization();

  const { toast } = useToast();
  const [backgroundTracking, setBackgroundTracking] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    milestoneAlerts: true,
    achievementCelebrations: true,
    weeklyReports: true,
    marketingEmails: false
  });

  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'privacy' | 'terms'>('privacy');

  // Check background tracking status on mount
  useEffect(() => {
    checkBackgroundTracking();
  }, []);

  const checkBackgroundTracking = async () => {
    if (Capacitor.getPlatform() === 'android') {
      try {
        const isRunning = await androidBackgroundService.isRunning();
        setBackgroundTracking(isRunning);
      } catch (error) {
        console.error('Failed to check background tracking status:', error);
      }
    }
  };

  const handleBackgroundTrackingToggle = async (enabled: boolean) => {
    setCheckingStatus(true);
    try {
      if (enabled) {
        const result = await androidBackgroundService.startTracking();
        if (result.success) {
          setBackgroundTracking(true);
          toast({
            title: 'Background Tracking Started',
            description: 'Your steps are now being tracked continuously',
          });
        } else {
          toast({
            title: 'Failed to Start Tracking',
            description: result.message,
            variant: 'destructive',
          });
        }
      } else {
        await androidBackgroundService.stopTracking();
        setBackgroundTracking(false);
        toast({
          title: 'Background Tracking Stopped',
          description: 'Step tracking has been paused',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle background tracking',
        variant: 'destructive',
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const openLegalModal = (tab: 'privacy' | 'terms') => {
    setLegalModalTab(tab);
    setShowLegalModal(true);
  };

  const handleThemeChange = async (themeName: string) => {
    console.log('Changing theme to:', themeName);
    const isDark = themeName === 'dark_mode';

    await updateTheme({
      themeName: themeName as any,
      darkMode: isDark,
    });

    console.log('Theme changed successfully');
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

        <Tabs defaultValue="tracking" className="w-full">
          <TabsList className="grid w-full grid-cols-6 gap-1">
            <TabsTrigger value="tracking" className="flex items-center gap-1">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Track</span>
            </TabsTrigger>
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
            <TabsTrigger value="privacy" className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Legal</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">About</span>
            </TabsTrigger>
          </TabsList>

          {/* Background Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Background Step Tracking
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enable continuous step tracking even when the app is closed
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div>
                    <Label className="font-semibold">Enable Background Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Track steps continuously with a persistent notification
                    </p>
                  </div>
                  <Switch
                    checked={backgroundTracking}
                    onCheckedChange={handleBackgroundTrackingToggle}
                    disabled={checkingStatus || Capacitor.getPlatform() !== 'android'}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            {Capacitor.getPlatform() === 'android' && <BackgroundTrackingStatus />}

            {Capacitor.getPlatform() !== 'android' && (
              <Card className="border-muted">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Background tracking is currently only available on Android devices
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

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
        updateLayout({
                        compactMode: checked
                      })
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <Select 
                    value={preferences.layoutPreferences.cardLayout}
                    onValueChange={(value) => 
        updateLayout({
                        cardLayout: value as 'grid' | 'list'
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

          {/* Privacy & Legal */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Privacy & Legal Documents
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Access our Privacy Policy and Terms & Conditions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    onClick={() => openLegalModal('privacy')}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">Privacy Policy</div>
                        <div className="text-sm text-muted-foreground">
                          Learn how we protect and use your data
                        </div>
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => openLegalModal('terms')}
                    className="justify-start h-auto p-4"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-secondary" />
                      <div className="text-left">
                        <div className="font-medium">Terms & Conditions</div>
                        <div className="text-sm text-muted-foreground">
                          Review our usage terms and conditions
                        </div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ConsentManager 
              mode="settings"
              className="animate-fade-in"
            />
          </TabsContent>

          {/* About & Version Info */}
          <TabsContent value="about">
            <VersionManager />
          </TabsContent>
        </Tabs>

        {/* Beta Feedback System */}
        <BetaFeedbackSystem />
      </div>

      <LegalPolicyModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}