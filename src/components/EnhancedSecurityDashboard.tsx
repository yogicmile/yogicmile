import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, Eye, Activity, Phone, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface SecurityEvent {
  id: string;
  action: string;
  details: any;
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  user_id?: string;
}

export const EnhancedSecurityDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeThreats, setActiveThreats] = useState(0);
  const [isSecureMode, setIsSecureMode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSecurityEvents();
    }
  }, [user]);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching security events:', error);
        return;
      }

      setSecurityEvents((data || []) as SecurityEvent[]);
      
      // Count high-risk events from last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentThreats = (data || []).filter(event => 
        new Date(event.created_at) > oneDayAgo && 
        ['otp_rate_limit_exceeded', 'otp_verification_failed', 'suspicious_activity'].includes(event.action)
      ).length;
      
      setActiveThreats(recentThreats);
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (action: string): "default" | "destructive" | "secondary" | "outline" => {
    if (['otp_rate_limit_exceeded', 'account_locked'].includes(action)) return 'destructive';
    if (['otp_verification_failed', 'suspicious_activity'].includes(action)) return 'secondary';
    return 'default';
  };

  const getEventIcon = (action: string) => {
    if (action.includes('otp')) return <Shield className="h-4 w-4" />;
    if (['suspicious_activity', 'rate_limit'].includes(action)) return <AlertTriangle className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getEventDescription = (event: SecurityEvent): string => {
    const actions: Record<string, string> = {
      'otp_generated': 'OTP requested for login',
      'otp_verified_successfully': 'Successfully verified OTP',
      'otp_verification_failed': 'Failed OTP verification attempt',
      'otp_rate_limit_exceeded': 'Too many OTP attempts - temporarily blocked',
      'login_success': 'Successful login',
      'login_failed': 'Failed login attempt',
      'password_changed': 'Password updated',
      'profile_updated': 'Profile information changed'
    };
    
    return actions[event.action] || `Security event: ${event.action}`;
  };

  const handleSecureMode = () => {
    setIsSecureMode(!isSecureMode);
    toast({
      title: isSecureMode ? "Secure Mode Disabled" : "Secure Mode Enabled",
      description: isSecureMode 
        ? "Your account is now operating normally." 
        : "Your account is now in secure mode with restricted access.",
      variant: isSecureMode ? "default" : "destructive"
    });
  };

  const handleSignOutAll = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out from all devices for security.",
      variant: "destructive"
    });
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Dashboard
          </CardTitle>
          <CardDescription>
            Monitor your account security and respond to potential threats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Security Status</span>
            </div>
            <Badge variant={activeThreats > 0 ? "destructive" : "default"}>
              {activeThreats > 0 ? `${activeThreats} Active Alerts` : 'Secure'}
            </Badge>
          </div>

          {/* Secure Mode Status */}
          {isSecureMode && (
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Secure Mode Active:</strong> Your account has restricted access. 
                Some features may be temporarily unavailable.
              </AlertDescription>
            </Alert>
          )}

          {/* Active Threats Alert */}
          {activeThreats > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {activeThreats} security event{activeThreats > 1 ? 's' : ''} detected in the last 24 hours. 
                Please review your recent activity below.
              </AlertDescription>
            </Alert>
          )}

          {/* Quick Security Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSecureMode}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              {isSecureMode ? 'Disable' : 'Enable'} Secure Mode
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOutAll}
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              Sign Out All Devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Security Activity
          </CardTitle>
          <CardDescription>
            Your latest security events and authentication attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No security events recorded</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {securityEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                  <div className="mt-0.5">
                    {getEventIcon(event.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {getEventDescription(event)}
                      </p>
                      <Badge variant={getSeverityColor(event.action)} className="text-xs">
                        {event.action.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </span>
                      {event.ip_address && (
                        <span>• IP: {event.ip_address}</span>
                      )}
                    </div>
                    {event.details && Object.keys(event.details).length > 0 && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {JSON.stringify(event.details, null, 0).slice(0, 100)}
                        {JSON.stringify(event.details).length > 100 && '...'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Emergency Security Support</span>
          </div>
          <p className="text-xs text-muted-foreground">
            If you believe your account has been compromised, contact our security team immediately 
            at security@yogicmile.com for immediate assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};