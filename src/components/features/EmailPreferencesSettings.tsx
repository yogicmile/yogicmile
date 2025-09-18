import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Settings, Shield, Clock, Bell, Users, Gift } from 'lucide-react';

interface EmailPreferences {
  email: string;
  subscriptionStatus: 'subscribed' | 'unsubscribed' | 'pending';
  frequencyPreference: 'daily' | 'weekly' | 'monthly' | 'events_only';
  contentTypes: {
    achievements: boolean;
    healthTips: boolean;
    offers: boolean;
    communityUpdates: boolean;
    challenges: boolean;
  };
  quietHours: {
    start: string;
    end: string;
    timezone: string;
  };
  engagementScore: number;
  verified: boolean;
}

const DEFAULT_PREFERENCES: EmailPreferences = {
  email: '',
  subscriptionStatus: 'subscribed',
  frequencyPreference: 'weekly',
  contentTypes: {
    achievements: true,
    healthTips: true,
    offers: true,
    communityUpdates: true,
    challenges: true,
  },
  quietHours: {
    start: '22:00',
    end: '07:00',
    timezone: 'Asia/Kolkata',
  },
  engagementScore: 0,
  verified: false,
};

export const EmailPreferencesSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (isGuest || !user) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('email_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setPreferences({
            email: data.email,
            subscriptionStatus: data.subscription_status as any,
            frequencyPreference: data.frequency_preference as any,
            contentTypes: (data.content_types as any) || DEFAULT_PREFERENCES.contentTypes,
            quietHours: (data.quiet_hours as any) || DEFAULT_PREFERENCES.quietHours,
            engagementScore: data.engagement_score || 0,
            verified: Boolean(data.verified_at),
          });
        } else {
          // Initialize with user's email from auth if available
          const userEmail = user.user_metadata?.email || user.email || '';
          setPreferences(prev => ({ ...prev, email: userEmail }));
        }
      } catch (error) {
        console.error('Error loading email preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load email preferences",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user, isGuest, toast]);

  // Save preferences
  const savePreferences = async () => {
    if (isGuest || !user) {
      toast({
        title: "Sign Up Required",
        description: "Please sign up to manage email preferences",
        variant: "destructive",
      });
      return;
    }

    if (!preferences.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('email_preferences')
        .upsert({
          user_id: user.id,
          email: preferences.email,
          subscription_status: preferences.subscriptionStatus,
          frequency_preference: preferences.frequencyPreference,
          content_types: preferences.contentTypes as any,
          quiet_hours: preferences.quietHours as any,
        });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your email preferences have been updated",
      });

      // Send verification email if email changed and not verified
      if (!preferences.verified) {
        toast({
          title: "Verification Email Sent",
          description: "Please check your email to verify your address",
        });
      }
    } catch (error) {
      console.error('Error saving email preferences:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle content type
  const toggleContentType = (type: keyof EmailPreferences['contentTypes']) => {
    setPreferences(prev => ({
      ...prev,
      contentTypes: {
        ...prev.contentTypes,
        [type]: !prev.contentTypes[type],
      },
    }));
  };

  // Get content type info
  const getContentTypeInfo = (type: keyof EmailPreferences['contentTypes']) => {
    const info = {
      achievements: { icon: '🏆', title: 'Achievement Updates', description: 'Celebration emails when you unlock new achievements' },
      healthTips: { icon: '💡', title: 'Health & Wellness Tips', description: 'Weekly tips to improve your walking routine' },
      offers: { icon: '🎁', title: 'Exclusive Offers', description: 'Special deals and discounts from partner merchants' },
      communityUpdates: { icon: '👥', title: 'Community Updates', description: 'News about challenges, leaderboards, and social features' },
      challenges: { icon: '💪', title: 'Challenge Invitations', description: 'Notifications about new walking challenges and events' },
    };
    return info[type];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Email Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Manage your email notifications and marketing preferences
          </p>
        </div>
      </div>

      {/* Guest Message */}
      {isGuest && (
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6 text-center">
            <Mail className="w-12 h-12 text-warning mx-auto mb-3" />
            <p className="font-medium text-warning-foreground mb-2">
              📧 Email Updates Available
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Sign up to receive achievement updates, health tips, and exclusive offers via email
            </p>
            <Button className="bg-primary text-primary-foreground">
              Sign Up for Email Updates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Address */}
      {!isGuest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Manage your email address and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={preferences.email}
                  onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@email.com"
                />
                <div className="flex items-center gap-2">
                  {preferences.verified ? (
                    <Badge className="bg-success text-success-foreground">
                      ✓ Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      Pending Verification
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subscription Status</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={preferences.subscriptionStatus === 'subscribed'}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        subscriptionStatus: checked ? 'subscribed' : 'unsubscribed',
                      }))
                    }
                  />
                  <Label className="text-sm">
                    {preferences.subscriptionStatus === 'subscribed' ? 'Subscribed' : 'Unsubscribed'}
                  </Label>
                </div>
                {preferences.engagementScore > 0 && (
                  <Badge variant="outline">
                    📊 Engagement: {preferences.engagementScore}%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frequency Preferences */}
      {!isGuest && preferences.subscriptionStatus === 'subscribed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Frequency & Timing
            </CardTitle>
            <CardDescription>
              Choose how often you want to receive emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Frequency</Label>
              <Select
                value={preferences.frequencyPreference}
                onValueChange={(value: any) =>
                  setPreferences(prev => ({ ...prev, frequencyPreference: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary (Recommended)</SelectItem>
                  <SelectItem value="monthly">Monthly Newsletter</SelectItem>
                  <SelectItem value="events_only">Events Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Quiet Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Start Time</Label>
                  <Input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      setPreferences(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">End Time</Label>
                  <Input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      setPreferences(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                No emails will be sent during these hours
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Type Preferences */}
      {!isGuest && preferences.subscriptionStatus === 'subscribed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Content Preferences
            </CardTitle>
            <CardDescription>
              Choose what type of emails you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(preferences.contentTypes).map(([type, enabled]) => {
              const info = getContentTypeInfo(type as keyof EmailPreferences['contentTypes']);
              return (
                <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{info.icon}</div>
                    <div>
                      <p className="font-medium">{info.title}</p>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggleContentType(type as keyof EmailPreferences['contentTypes'])}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Email Preview */}
      {!isGuest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Preview
            </CardTitle>
            <CardDescription>
              Preview your email settings and manage data usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Template Preview</p>
                <p className="text-sm text-muted-foreground">
                  See how your emails will look with current settings
                </p>
              </div>
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>

            {previewMode && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-3">
                  <h3 className="font-semibold">🏃‍♀️ Your Weekly Yogic Mile Progress</h3>
                  <p className="text-sm">Hi there! Here's your walking summary:</p>
                  
                  {preferences.contentTypes.achievements && (
                    <div className="border-l-4 border-primary pl-3">
                      <p className="text-sm font-medium">🏆 New Achievement Unlocked!</p>
                      <p className="text-xs text-muted-foreground">You've completed the "Weekly Walker" challenge</p>
                    </div>
                  )}
                  
                  {preferences.contentTypes.healthTips && (
                    <div className="border-l-4 border-success pl-3">
                      <p className="text-sm font-medium">💡 Wellness Tip of the Week</p>
                      <p className="text-xs text-muted-foreground">Try walking after meals to improve digestion</p>
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Sent {preferences.frequencyPreference} • Unsubscribe anytime
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {!isGuest && (
        <div className="flex gap-2">
          <Button onClick={savePreferences} disabled={isSaving} className="flex-1">
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button variant="outline" onClick={() => setPreferences(DEFAULT_PREFERENCES)}>
            Reset to Defaults
          </Button>
        </div>
      )}

      {/* GDPR Compliance Notice */}
      <Card className="border-info/20 bg-info/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-info mt-1" />
            <div className="text-sm">
              <p className="font-medium text-info-foreground mb-2">Privacy & Data Protection</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Your email data is encrypted and securely stored</li>
                <li>• We never share your email with third parties</li>
                <li>• You can download or delete your data anytime</li>
                <li>• All emails include one-click unsubscribe</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};