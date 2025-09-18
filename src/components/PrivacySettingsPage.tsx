import React, { useState } from 'react';
import { ArrowLeft, Shield, Eye, BarChart3, Lock, Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useSecurity } from '@/hooks/use-security';
import { useNavigate } from 'react-router-dom';

export const PrivacySettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    privacySettings,
    fraudAlerts,
    securityEvents,
    isLoading,
    updatePrivacySettings,
    requestDataExport,
    requestAccountDeletion
  } = useSecurity();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  const handlePrivacyToggle = async (setting: string, value: boolean) => {
    await updatePrivacySettings({ [setting]: value });
  };

  const handleVisibilityChange = async (visibility: 'public' | 'friends_only' | 'private') => {
    await updatePrivacySettings({ profile_visibility: visibility });
  };

  const handleDataExport = async (type: 'full' | 'basic' | 'transactions' | 'steps') => {
    await requestDataExport(type);
  };

  const handleAccountDeletion = async () => {
    if (await requestAccountDeletion(deleteReason)) {
      setShowDeleteConfirmation(false);
      navigate('/');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-light to-surface/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-surface/20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light to-surface/50 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/profile')}
              className="text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Privacy & Security</h1>
              <p className="text-muted-foreground">Manage your data and security preferences</p>
            </div>
          </div>
        </div>

        {/* Fraud Alerts */}
        {fraudAlerts.length > 0 && (
          <Alert className="border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <strong>Security Alert:</strong> We've detected {fraudAlerts.length} suspicious activities on your account.
              <div className="mt-2 space-y-1">
                {fraudAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center gap-2 text-sm">
                    <Badge variant={getSeverityColor(alert.severity_level)} className="text-xs">
                      {alert.severity_level}
                    </Badge>
                    <span>{alert.fraud_type.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Account Security */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Account Security</CardTitle>
            </div>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Login Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified of new device logins</p>
              </div>
              <Switch
                checked={privacySettings?.login_notifications || false}
                onCheckedChange={(checked) => handlePrivacyToggle('login_notifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive fraud and security warnings</p>
              </div>
              <Switch
                checked={privacySettings?.security_alerts || false}
                onCheckedChange={(checked) => handlePrivacyToggle('security_alerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Privacy */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Data Privacy</CardTitle>
            </div>
            <CardDescription>Control how your data is collected and used</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Data Collection</Label>
                <p className="text-sm text-muted-foreground">Allow app improvement analytics</p>
              </div>
              <Switch
                checked={privacySettings?.data_collection || false}
                onCheckedChange={(checked) => handlePrivacyToggle('data_collection', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Location Tracking</Label>
                <p className="text-sm text-muted-foreground">Enable location-based features</p>
              </div>
              <Switch
                checked={privacySettings?.location_tracking || false}
                onCheckedChange={(checked) => handlePrivacyToggle('location_tracking', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">Receive promotional communications</p>
              </div>
              <Switch
                checked={privacySettings?.marketing_emails || false}
                onCheckedChange={(checked) => handlePrivacyToggle('marketing_emails', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Visibility */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Profile Visibility</CardTitle>
            </div>
            <CardDescription>Choose who can see your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              {[
                { value: 'public', label: 'Public', desc: 'Anyone can see your basic info' },
                { value: 'friends_only', label: 'Friends Only', desc: 'Only referred users can see your profile' },
                { value: 'private', label: 'Private', desc: 'Completely hidden from others' }
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id={option.value}
                    name="visibility"
                    value={option.value}
                    checked={privacySettings?.profile_visibility === option.value}
                    onChange={() => handleVisibilityChange(option.value as any)}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <Label htmlFor={option.value} className="text-foreground font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{option.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Analytics & Tracking */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Analytics & Tracking</CardTitle>
            </div>
            <CardDescription>Control data collection for app improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground font-medium">Analytics Tracking</Label>
                <p className="text-sm text-muted-foreground">Help us improve the app with usage analytics</p>
              </div>
              <Switch
                checked={privacySettings?.analytics_tracking || false}
                onCheckedChange={(checked) => handlePrivacyToggle('analytics_tracking', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card className="border-border/50 bg-surface/80 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Download My Data</CardTitle>
            </div>
            <CardDescription>Export your data in compliance with GDPR</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDataExport('full')}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Complete Data
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDataExport('basic')}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Basic Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDataExport('transactions')}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Transactions
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDataExport('steps')}
                className="justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Step History
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Delete Account</CardTitle>
            </div>
            <CardDescription>Permanently delete your account and all associated data</CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirmation ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirmation(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Request Account Deletion
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert className="border-destructive/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action cannot be undone. You have 30 days to cancel this request.
                  </AlertDescription>
                </Alert>
                <div>
                  <Label htmlFor="reason" className="text-sm font-medium">
                    Reason for deletion (optional)
                  </Label>
                  <textarea
                    id="reason"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground"
                    rows={3}
                    placeholder="Tell us why you're leaving..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleAccountDeletion}
                  >
                    Confirm Deletion
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Security Events */}
        {securityEvents.length > 0 && (
          <Card className="border-border/50 bg-surface/80 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Recent Security Activity</CardTitle>
              <CardDescription>Your recent security-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.event_timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={event.result_status === 'success' ? 'default' : 'destructive'} className="text-xs">
                      {event.result_status === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                      {event.result_status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};