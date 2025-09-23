import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  Users, 
  Globe, 
  Mail, 
  MapPin, 
  BarChart, 
  Save,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrivacySettings {
  profile_visibility: 'public' | 'friends' | 'private';
  data_sharing_enabled: boolean;
  marketing_emails_enabled: boolean;
  analytics_tracking_enabled: boolean;
  location_sharing_enabled: boolean;
  activity_visibility: 'public' | 'friends' | 'private';
}

export const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    profile_visibility: 'public',
    data_sharing_enabled: true,
    marketing_emails_enabled: true,
    analytics_tracking_enabled: true,
    location_sharing_enabled: false,
    activity_visibility: 'friends'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing privacy settings
  useEffect(() => {
    if (user) {
      loadPrivacySettings();
    }
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          profile_visibility: data.profile_visibility as 'public' | 'friends' | 'private',
          data_sharing_enabled: data.data_collection || false,
          marketing_emails_enabled: data.marketing_emails || false,
          analytics_tracking_enabled: data.analytics_tracking || false,
          location_sharing_enabled: data.location_tracking || false,
          activity_visibility: 'friends' // Default since this column may not exist
        });
      }
    } catch (error: any) {
      console.error('Failed to load privacy settings:', error);
      toast.error('Failed to load privacy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('privacy_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setHasChanges(false);
      toast.success('Privacy settings saved successfully');

      // Log the security event
      await supabase.rpc('log_security_event' as any, {
        p_user_id: user.id,
        p_event_type: 'privacy_settings_updated',
        p_severity: 'medium',
        p_details: { settings }
      } as any);

    } catch (error: any) {
      console.error('Failed to save privacy settings:', error);
      toast.error('Failed to save privacy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Visible to everyone on the platform';
      case 'friends':
        return 'Visible only to your friends and connections';
      case 'private':
        return 'Only visible to you';
      default:
        return '';
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
          <p className="text-muted-foreground">
            Control how your data is used and who can see your information
          </p>
        </div>
        {hasChanges && (
          <Button onClick={savePrivacySettings} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Profile Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Profile Privacy</span>
          </CardTitle>
          <CardDescription>
            Control who can see your profile information and activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="profile-visibility" className="text-base font-medium">
              Profile Visibility
            </Label>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value: any) => updateSetting('profile_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Friends Only</span>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Private</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getVisibilityDescription(settings.profile_visibility)}
            </p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="activity-visibility" className="text-base font-medium">
              Activity Visibility
            </Label>
            <Select
              value={settings.activity_visibility}
              onValueChange={(value: any) => updateSetting('activity_visibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Controls who can see your steps, achievements, and activity feed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="w-5 h-5" />
            <span>Data & Analytics</span>
          </CardTitle>
          <CardDescription>
            Manage how your data is used for analytics and improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="analytics-tracking" className="text-base font-medium">
                Analytics Tracking
              </Label>
              <p className="text-sm text-muted-foreground">
                Help improve the app by sharing anonymous usage data
              </p>
            </div>
            <Switch
              id="analytics-tracking"
              checked={settings.analytics_tracking_enabled}
              onCheckedChange={(checked) => updateSetting('analytics_tracking_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="data-sharing" className="text-base font-medium">
                Data Sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow sharing anonymized data with research partners
              </p>
            </div>
            <Switch
              id="data-sharing"
              checked={settings.data_sharing_enabled}
              onCheckedChange={(checked) => updateSetting('data_sharing_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location & Communications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Location & Communications</span>
          </CardTitle>
          <CardDescription>
            Control location sharing and communication preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="location-sharing" className="text-base font-medium">
                Location Sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Share your location for features like local challenges and deals
              </p>
            </div>
            <Switch
              id="location-sharing"
              checked={settings.location_sharing_enabled}
              onCheckedChange={(checked) => updateSetting('location_sharing_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="marketing-emails" className="text-base font-medium">
                Marketing Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features, tips, and promotions
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={settings.marketing_emails_enabled}
              onCheckedChange={(checked) => updateSetting('marketing_emails_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Your Privacy Matters:</strong> These settings control how your information is shared 
          within the Yogic Mile community. You can change these settings at any time, and they will 
          take effect immediately. For more information about our privacy practices, please review our 
          Privacy Policy.
        </AlertDescription>
      </Alert>

      {/* Data Export & Deletion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Data Rights</span>
          </CardTitle>
          <CardDescription>
            Manage your data and account deletion options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Request Data Export
            </Button>
            <Button variant="destructive" className="flex-1">
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Data export typically takes 24-48 hours. Account deletion is permanent and cannot be undone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};