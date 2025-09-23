import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  RefreshCw, 
  Clock,
  Activity,
  UserX,
  Key,
  Phone,
  Mail,
  Globe,
  Database
} from 'lucide-react';
import { useEnhancedSecurityMonitoring } from '@/hooks/use-enhanced-security-monitoring';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const EnhancedSecurityDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    recentAlerts,
    securityMetrics,
    rateLimitStatus,
    isLoading,
    fetchSecurityAlerts,
    logSecurityEvent,
    checkRateLimit,
    getAlertMessage
  } = useEnhancedSecurityMonitoring();

  const [isSecureMode, setIsSecureMode] = useState(false);

  if (!user) return null;

  const handleSecureMode = async () => {
    const newMode = !isSecureMode;
    setIsSecureMode(newMode);
    
    await logSecurityEvent('secure_mode_toggle', 'medium', {
      enabled: newMode,
      timestamp: new Date().toISOString()
    });

    toast.success(`Secure mode ${newMode ? 'enabled' : 'disabled'}`);
  };

  const handleSignOutAllDevices = async () => {
    const isRateLimited = await checkRateLimit('security_action');
    if (isRateLimited) return;

    await logSecurityEvent('sign_out_all_devices', 'high', {
      action: 'security_cleanup',
      timestamp: new Date().toISOString()
    });

    await signOut();
    toast.success('Signed out from all devices');
  };

  const getThreatLevelColor = () => {
    switch (securityMetrics.threatLevel) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium': return <Eye className="w-4 h-4 text-yellow-600" />;
      default: return <Activity className="w-4 h-4 text-green-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your account security
          </p>
        </div>
        <Button
          onClick={fetchSecurityAlerts}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Security Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.securityScore}/100</div>
                <Progress value={securityMetrics.securityScore} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  Based on recent activity and security practices
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold capitalize ${getThreatLevelColor()}`}>
                  {securityMetrics.threatLevel}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Current security threat assessment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.activeAlerts}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Security events in the last 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Security Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Security Actions</CardTitle>
              <CardDescription>
                Take immediate action to secure your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Secure Mode</span>
                  <Badge variant={isSecureMode ? "default" : "secondary"}>
                    {isSecureMode ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <Button
                  onClick={handleSecureMode}
                  variant={isSecureMode ? "destructive" : "default"}
                  size="sm"
                >
                  {isSecureMode ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserX className="w-4 h-4" />
                  <span>Sign Out All Devices</span>
                </div>
                <Button
                  onClick={handleSignOutAllDevices}
                  variant="outline"
                  size="sm"
                >
                  Sign Out All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rate Limiting Status */}
          {rateLimitStatus.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting Status</CardTitle>
                <CardDescription>
                  Current rate limiting for security-sensitive operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rateLimitStatus.map((limit, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize">{limit.operation_type.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {limit.attempt_count} attempts
                        </Badge>
                        {limit.blocked_until && (
                          <Badge variant="destructive">
                            Blocked until {new Date(limit.blocked_until).toLocaleTimeString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Monitor suspicious activities and security events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : recentAlerts.length > 0 ? (
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border"
                    >
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{getAlertMessage(alert)}</p>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                        {alert.details.fraud_detected && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Fraud pattern detected: {alert.details.fraud_reason}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No security alerts found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
              <CardDescription>
                Manage your data privacy and visibility settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Privacy settings control how your profile and activity data is shared with other users.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Profile Visibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Control who can see your profile information
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Manage Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Data Sharing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Control how your data is used for analytics
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Review Permissions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>
                Complete history of security events and account changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-2 rounded border-l-4 border-l-primary/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{alert.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emergency Contact */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Emergency Security Support</CardTitle>
          <CardDescription>
            If you suspect unauthorized access to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="destructive" size="sm">
              <Phone className="w-4 h-4 mr-2" />
              Emergency Contact
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              Report Security Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};