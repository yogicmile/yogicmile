import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Clock, Activity, RefreshCw, Eye, Lock } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/use-security-monitoring';
import { format } from 'date-fns';

export const EnhancedSecurityMonitoring: React.FC = () => {
  const { 
    recentAlerts, 
    isLoading, 
    fetchSecurityAlerts, 
    getAlertMessage 
  } = useSecurityMonitoring();
  
  const [securityScore, setSecurityScore] = useState(85);
  const [threatLevel, setThreatLevel] = useState<'low' | 'medium' | 'high'>('low');

  useEffect(() => {
    calculateSecurityMetrics();
  }, [recentAlerts]);

  const calculateSecurityMetrics = () => {
    const highSeverityCount = recentAlerts.filter(alert => alert.severity === 'high').length;
    const mediumSeverityCount = recentAlerts.filter(alert => alert.severity === 'medium').length;
    
    let score = 100;
    score -= highSeverityCount * 15;
    score -= mediumSeverityCount * 8;
    
    const finalScore = Math.max(score, 0);
    setSecurityScore(finalScore);
    
    if (finalScore >= 80) setThreatLevel('low');
    else if (finalScore >= 60) setThreatLevel('medium');
    else setThreatLevel('high');
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Eye className="h-4 w-4 text-warning" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getThreatLevelColor = () => {
    switch (threatLevel) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      default: return 'text-success';
    }
  };

  const securityFeatures = [
    { name: 'Rate Limiting', status: 'Active', icon: <Clock className="h-4 w-4" /> },
    { name: 'Audit Logging', status: 'Active', icon: <Activity className="h-4 w-4" /> },
    { name: 'OTP Verification', status: 'Active', icon: <Shield className="h-4 w-4" /> },
    { name: 'Session Security', status: 'Active', icon: <Lock className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScore}%</div>
            <p className="text-xs text-muted-foreground">
              Based on recent activity
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
              {threatLevel}
            </div>
            <p className="text-xs text-muted-foreground">
              Current risk assessment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Security Events
              </CardTitle>
              <CardDescription>
                Recent security-related activities and alerts
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSecurityAlerts}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentAlerts.length > 0 ? (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <div className="mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {getAlertMessage(alert)}
                      </p>
                      <Badge variant={getSeverityColor(alert.severity) as any}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                    {alert.details && Object.keys(alert.details).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <details>
                          <summary className="cursor-pointer hover:text-foreground">
                            View details
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(alert.details, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No security events found. Your account appears secure.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Active Security Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security Features
          </CardTitle>
          <CardDescription>
            Currently active security measures protecting your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature) => (
              <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {feature.icon}
                  <span className="font-medium">{feature.name}</span>
                </div>
                <Badge variant="secondary" className="text-success">
                  {feature.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
          <CardDescription>
            Suggestions to improve your account security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Consider enabling two-factor authentication for enhanced security.
              </AlertDescription>
            </Alert>
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Review and update your password regularly.
              </AlertDescription>
            </Alert>
            <Alert>
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Monitor your account for unusual activity patterns.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};