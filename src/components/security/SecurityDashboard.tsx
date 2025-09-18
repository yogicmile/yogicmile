import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedSecurity } from '@/hooks/use-enhanced-security';
import { Shield, Smartphone, AlertTriangle, Clock, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const SecurityDashboard: React.FC = () => {
  const {
    deviceSessions,
    recentSecurityEvents,
    deviceFingerprint,
    isLoading,
    revokeDeviceSession
  } = useEnhancedSecurity();

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getEventMessage = (action: string): string => {
    const eventMessages: Record<string, string> = {
      'otp_generated': 'OTP code was generated',
      'otp_verified_successfully': 'OTP code was verified successfully',
      'otp_generation_failed': 'OTP generation failed',
      'otp_verification_failed': 'OTP verification failed',
      'otp_generation_blocked': 'OTP generation was blocked',
      'otp_rate_limit_exceeded': 'Rate limit exceeded for OTP requests',
      'otp_daily_limit_exceeded': 'Daily OTP limit exceeded',
      'device_session_revoked': 'Device session was revoked',
      'password_changed': 'Password was changed',
      'profile_updated': 'Profile was updated',
      'login_attempt': 'Login attempt detected'
    };

    return eventMessages[action] || action.replace(/_/g, ' ').toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Monitor your account security and active sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{deviceSessions.filter(s => s.is_active).length}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">
                {recentSecurityEvents.filter(e => e.severity === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Priority Alerts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{recentSecurityEvents.length}</div>
              <div className="text-sm text-muted-foreground">Recent Events</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Device Sessions</CardTitle>
          <CardDescription>
            Manage devices that have access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviceSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active device sessions found
              </div>
            ) : (
              deviceSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        Device ID: {session.device_fingerprint.slice(0, 8)}...
                        {session.device_fingerprint === deviceFingerprint && (
                          <Badge variant="secondary" className="ml-2">Current Device</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last active: {formatDistanceToNow(new Date(session.last_activity))} ago
                      </div>
                      {session.user_agent && (
                        <div className="text-xs text-muted-foreground truncate max-w-md">
                          {session.user_agent}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={session.is_active ? "default" : "secondary"}
                      className={session.is_active ? "bg-green-500" : ""}
                    >
                      {session.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {session.device_fingerprint !== deviceFingerprint && session.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeDeviceSession(session.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Activity</CardTitle>
          <CardDescription>
            View recent security events and login attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {recentSecurityEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No security events found
                </div>
              ) : (
                recentSecurityEvents.map((event, index) => (
                  <div key={event.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <AlertTriangle 
                            className={`h-4 w-4 ${
                              event.severity === 'high' ? 'text-red-500' :
                              event.severity === 'medium' ? 'text-orange-500' :
                              'text-blue-500'
                            }`} 
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {getEventMessage(event.action)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(event.created_at))} ago
                          </div>
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                    </div>
                    {index < recentSecurityEvents.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>Regularly review your active device sessions and revoke access for unknown devices</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>Use strong, unique passwords and enable two-factor authentication when available</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>Monitor security events for any suspicious activity on your account</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>Keep your browser and device software up to date for better security</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};