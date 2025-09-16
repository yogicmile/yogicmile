import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/use-security-monitoring';

export const SecurityDashboard: React.FC = () => {
  const { recentAlerts, isLoading, fetchSecurityAlerts, getAlertMessage } = useSecurityMonitoring();

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <CardTitle>Security Dashboard</CardTitle>
            <CardDescription>
              Monitor your account security and recent authentication events
            </CardDescription>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSecurityAlerts}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">Protected</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Audit Logging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="text-sm text-muted-foreground">Enabled</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Security Events</h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading security events...</span>
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No recent security events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(alert.severity)}
                    <div>
                      <p className="text-sm font-medium">
                        {getAlertMessage(alert)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant={getSeverityColor(alert.severity) as any}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Security Features Active:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              <Shield className="w-3 h-3 mr-1" />
              OTP Rate Limiting
            </Badge>
            <Badge variant="outline">
              <CheckCircle className="w-3 h-3 mr-1" />
              Audit Logging
            </Badge>
            <Badge variant="outline">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Progressive Delays
            </Badge>
            <Badge variant="outline">
              <Shield className="w-3 h-3 mr-1" />
              Secure Hashing
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};