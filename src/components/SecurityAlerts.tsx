import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle, X, Eye, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useSecurity } from '@/hooks/use-security';

interface SecurityAlert {
  id: string;
  type: 'fraud_detection' | 'login_anomaly' | 'location_change' | 'device_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  actionRequired: boolean;
  data: any;
}

interface SecurityAlertsProps {
  className?: string;
}

export const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ className = '' }) => {
  const { fraudAlerts, logSecurityEvent } = useSecurity();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Transform fraud alerts into security alerts
  useEffect(() => {
    const transformedAlerts: SecurityAlert[] = fraudAlerts.map(alert => ({
      id: alert.id,
      type: 'fraud_detection',
      severity: mapSeverity(alert.severity_level),
      title: getAlertTitle(alert.fraud_type),
      description: getAlertDescription(alert.fraud_type, alert.detection_data),
      timestamp: alert.detection_timestamp,
      actionRequired: alert.severity_level === 'high' || alert.severity_level === 'critical',
      data: alert.detection_data
    }));

    // Add mock alerts for demo purposes (in real app, these would come from various sources)
    const mockAlerts: SecurityAlert[] = [
      {
        id: 'login-1',
        type: 'login_anomaly',
        severity: 'medium',
        title: 'New Device Login',
        description: 'Someone logged into your account from a new device in Mumbai',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionRequired: false,
        data: { location: 'Mumbai, India', device: 'Android Phone' }
      }
    ];

    setAlerts([...transformedAlerts, ...mockAlerts]);
  }, [fraudAlerts]);

  const mapSeverity = (level: string): 'low' | 'medium' | 'high' | 'critical' => {
    switch (level) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const getAlertTitle = (fraudType: string): string => {
    switch (fraudType) {
      case 'gps_spoofing': return 'GPS Manipulation Detected';
      case 'unrealistic_steps': return 'Unusual Step Pattern';
      case 'device_manipulation': return 'Device Tampering Detected';
      case 'multiple_accounts': return 'Multiple Account Activity';
      case 'speed_violation': return 'Impossible Movement Speed';
      case 'pattern_anomaly': return 'Activity Pattern Anomaly';
      default: return 'Security Alert';
    }
  };

  const getAlertDescription = (fraudType: string, data: any): string => {
    switch (fraudType) {
      case 'gps_spoofing': 
        return `Detected potential GPS manipulation. Your location data shows inconsistencies that may indicate spoofing.`;
      case 'unrealistic_steps':
        return `Recorded ${data?.step_count || 'high number of'} steps, which exceeds normal human limits.`;
      case 'device_manipulation':
        return `Your device shows signs of modification or running in an emulated environment.`;
      case 'multiple_accounts':
        return `Multiple accounts detected from the same device or network.`;
      case 'speed_violation':
        return `Movement speed of ${data?.speed || 'high'} km/h detected, which is impossible for walking.`;
      case 'pattern_anomaly':
        return `Your activity pattern shows unusual characteristics that require verification.`;
      default:
        return 'A security concern has been detected with your account.';
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    await logSecurityEvent('alert_dismissed', 'success', { alert_id: alertId });
  };

  const handleViewDetails = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className={`border-border/50 bg-surface/80 backdrop-blur ${className}`}>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">All Clear</h3>
          <p className="text-muted-foreground">No security alerts at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`border-border/50 bg-surface/80 backdrop-blur ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Security Alerts
          </CardTitle>
          <CardDescription>
            Recent security events and recommendations for your account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {alerts.slice(0, 5).map((alert) => (
            <Alert key={alert.id} className={`border-${getSeverityColor(alert.severity)}/50`}>
              <div className="flex items-start justify-between w-full">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground text-sm">{alert.title}</h4>
                      <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      {alert.description}
                    </AlertDescription>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(alert.timestamp)}
                      </span>
                      {alert.data?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.data.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(alert)}
                    className="h-8 px-2"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissAlert(alert.id)}
                    className="h-8 px-2"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Alert>
          ))}
          
          {alerts.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm">
                View All {alerts.length} Alerts
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl bg-surface/95 backdrop-blur border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              {selectedAlert && getSeverityIcon(selectedAlert.severity)}
              Security Alert Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this security event
            </DialogDescription>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">Alert Type</h4>
                  <p className="text-sm text-muted-foreground">{selectedAlert.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Severity</h4>
                  <Badge variant={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Time</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAlert.actionRequired ? 'Action Required' : 'Under Review'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedAlert.description}
                </p>
              </div>
              
              {selectedAlert.data && Object.keys(selectedAlert.data).length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Technical Details</h4>
                  <div className="bg-muted/30 p-3 rounded text-xs font-mono">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(selectedAlert.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                {selectedAlert.actionRequired && (
                  <Button variant="default">
                    Take Action
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={() => handleDismissAlert(selectedAlert.id)}
                >
                  Mark as Resolved
                </Button>
                <Button variant="ghost" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};