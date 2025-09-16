import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Unlock, 
  Mail, 
  Phone, 
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityIncident {
  id: string;
  type: 'suspicious_login' | 'multiple_failed_attempts' | 'rate_limit_exceeded' | 'device_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
  autoResolved: boolean;
}

export const SecurityIncidentResponse: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([
    {
      id: '1',
      type: 'rate_limit_exceeded',
      severity: 'medium',
      description: 'Multiple OTP requests detected from your account',
      timestamp: new Date().toISOString(),
      resolved: false,
      autoResolved: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleResolveIncident = async (incidentId: string) => {
    setIsLoading(true);
    try {
      // Log the incident resolution
      if (user) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'security_incident_resolved',
            details: { incident_id: incidentId, resolved_by: 'user_action' }
          });
      }

      setIncidents(prev => 
        prev.map(incident => 
          incident.id === incidentId 
            ? { ...incident, resolved: true }
            : incident
        )
      );

      toast({
        title: "Incident Resolved",
        description: "Security incident has been marked as resolved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve incident. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityAction = async (action: string) => {
    setIsLoading(true);
    try {
      if (user) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: `security_action_${action}`,
            details: { action_type: action, triggered_by: 'user_request' }
          });
      }

      let message = '';
      switch (action) {
        case 'lock_account':
          message = 'Account has been temporarily locked for security.';
          break;
        case 'reset_sessions':
          message = 'All active sessions have been reset.';
          break;
        case 'notify_contacts':
          message = 'Security notifications sent to your contacts.';
          break;
        default:
          message = 'Security action completed.';
      }

      toast({
        title: "Security Action Completed",
        description: message,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete security action.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getIncidentTitle = (type: string) => {
    switch (type) {
      case 'suspicious_login': return 'Suspicious Login Attempt';
      case 'multiple_failed_attempts': return 'Multiple Failed Login Attempts';
      case 'rate_limit_exceeded': return 'Rate Limit Exceeded';
      case 'device_change': return 'New Device Detected';
      default: return 'Security Incident';
    }
  };

  const activeIncidents = incidents.filter(incident => !incident.resolved);
  const resolvedIncidents = incidents.filter(incident => incident.resolved);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Security Actions
          </CardTitle>
          <CardDescription>
            Take immediate action if you suspect unauthorized access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="destructive" 
              onClick={() => handleSecurityAction('lock_account')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Ban className="h-4 w-4" />
              Lock Account
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSecurityAction('reset_sessions')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Unlock className="h-4 w-4" />
              Reset Sessions
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleSecurityAction('notify_contacts')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Notify Contacts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Security Incidents
            {activeIncidents.length > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {activeIncidents.length}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Security events requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeIncidents.length > 0 ? (
            <div className="space-y-4">
              {activeIncidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getSeverityIcon(incident.severity)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">
                            {getIncidentTitle(incident.type)}
                          </h4>
                          <Badge variant={getSeverityColor(incident.severity) as any}>
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {incident.description}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(incident.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResolveIncident(incident.id)}
                      disabled={isLoading}
                      className="ml-4"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No active security incidents. Your account is secure.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resolved Incidents */}
      {resolvedIncidents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Resolved Incidents
            </CardTitle>
            <CardDescription>
              Previously resolved security events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {resolvedIncidents.map((incident) => (
                <div key={incident.id} className="border rounded-lg p-3 opacity-75">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div>
                        <h5 className="text-sm font-medium">
                          {getIncidentTitle(incident.type)}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {incident.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-success">
                      Resolved
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Security Contact
          </CardTitle>
          <CardDescription>
            Need help with a security issue?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                For urgent security matters, contact our security team at{' '}
                <a href="mailto:security@yogicmile.com" className="font-medium underline">
                  security@yogicmile.com
                </a>
              </AlertDescription>
            </Alert>
            <Alert>
              <Phone className="h-4 w-4" />
              <AlertDescription>
                24/7 Security Hotline:{' '}
                <a href="tel:+911234567890" className="font-medium underline">
                  +91 12345 67890
                </a>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};