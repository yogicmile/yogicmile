import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Users, Trash2, Eye, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FraudAlert {
  id: string;
  user_id: string;
  fraud_type: string;
  detection_timestamp: string;
  severity_level: string;
  detection_data: any;
  auto_action_taken: string;
  admin_reviewed: boolean;
  resolution_status: string;
  resolution_notes?: string;
}

interface DeletionRequest {
  id: string;
  user_id: string;
  request_date: string;
  reason?: string;
  grace_period_end: string;
  status: string;
  admin_approval: boolean;
}

interface SecurityStats {
  total_fraud_alerts: number;
  pending_reviews: number;
  deletion_requests: number;
  high_risk_users: number;
}

export const AdminSecurityDashboard: React.FC = () => {
  const { toast } = useToast();
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    total_fraud_alerts: 0,
    pending_reviews: 0,
    deletion_requests: 0,
    high_risk_users: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch fraud alerts
  const fetchFraudAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_detection')
        .select('*')
        .order('detection_timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setFraudAlerts(data || []);
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load fraud alerts",
        variant: "destructive"
      });
    }
  };

  // Fetch deletion requests
  const fetchDeletionRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .order('request_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDeletionRequests(data || []);
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      toast({
        title: "Error",
        description: "Failed to load deletion requests",
        variant: "destructive"
      });
    }
  };

  // Calculate security statistics
  const calculateStats = () => {
    const stats = {
      total_fraud_alerts: fraudAlerts.length,
      pending_reviews: fraudAlerts.filter(alert => !alert.admin_reviewed && alert.resolution_status === 'open').length,
      deletion_requests: deletionRequests.filter(req => req.status === 'pending').length,
      high_risk_users: fraudAlerts.filter(alert => 
        alert.severity_level === 'high' || alert.severity_level === 'critical'
      ).length
    };
    setSecurityStats(stats);
  };

  // Handle fraud alert resolution
  const resolveFraudAlert = async (alertId: string, resolution: 'resolved' | 'false_positive', notes?: string) => {
    try {
      const { error } = await supabase
        .from('fraud_detection')
        .update({
          admin_reviewed: true,
          resolution_status: resolution,
          resolution_notes: notes || '',
          admin_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', alertId);

      if (error) throw error;

      await fetchFraudAlerts();
      toast({
        title: "Alert Resolved",
        description: `Fraud alert marked as ${resolution}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error resolving fraud alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve fraud alert",
        variant: "destructive"
      });
    }
  };

  // Handle deletion request approval
  const handleDeletionRequest = async (requestId: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({
          admin_approval: approve,
          status: approve ? 'approved' : 'cancelled',
          admin_user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId);

      if (error) throw error;

      await fetchDeletionRequests();
      toast({
        title: approve ? "Request Approved" : "Request Denied",
        description: `Account deletion request has been ${approve ? 'approved' : 'denied'}`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error handling deletion request:', error);
      toast({
        title: "Error",
        description: "Failed to handle deletion request",
        variant: "destructive"
      });
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

  const getFraudTypeIcon = (type: string) => {
    switch (type) {
      case 'gps_spoofing': return '📍';
      case 'unrealistic_steps': return '👟';
      case 'device_manipulation': return '📱';
      case 'multiple_accounts': return '👥';
      case 'speed_violation': return '🏃';
      case 'pattern_anomaly': return '📊';
      default: return '⚠️';
    }
  };

  const formatFraudType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFraudAlerts(), fetchDeletionRequests()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [fraudAlerts, deletionRequests]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-surface/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor fraud, security alerts, and compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-sm font-medium text-primary">Security Center</span>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-surface/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Fraud Alerts</p>
                <p className="text-2xl font-bold text-foreground">{securityStats.total_fraud_alerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-surface/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-destructive">{securityStats.pending_reviews}</p>
              </div>
              <Clock className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-surface/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Deletion Requests</p>
                <p className="text-2xl font-bold text-primary">{securityStats.deletion_requests}</p>
              </div>
              <Trash2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-surface/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Users</p>
                <p className="text-2xl font-bold text-destructive">{securityStats.high_risk_users}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="fraud-alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fraud-alerts">Fraud Alerts</TabsTrigger>
          <TabsTrigger value="deletion-requests">Account Deletions</TabsTrigger>
        </TabsList>

        {/* Fraud Alerts Tab */}
        <TabsContent value="fraud-alerts" className="space-y-6">
          <Card className="border-border/50 bg-surface/80">
            <CardHeader>
              <CardTitle className="text-foreground">Active Fraud Alerts</CardTitle>
              <CardDescription>Review and resolve detected fraudulent activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAlerts.filter(alert => alert.resolution_status === 'open').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No active fraud alerts</p>
                  </div>
                ) : (
                  fraudAlerts
                    .filter(alert => alert.resolution_status === 'open')
                    .map((alert) => (
                      <div key={alert.id} className="p-4 border border-border/50 rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getFraudTypeIcon(alert.fraud_type)}</span>
                            <div>
                              <h3 className="font-medium text-foreground">{formatFraudType(alert.fraud_type)}</h3>
                              <p className="text-sm text-muted-foreground">
                                User ID: {alert.user_id.slice(0, 8)}... • {new Date(alert.detection_timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getSeverityColor(alert.severity_level)}>
                            {alert.severity_level}
                          </Badge>
                        </div>

                        {alert.detection_data && (
                          <div className="bg-muted/30 p-3 rounded text-sm">
                            <pre className="whitespace-pre-wrap text-muted-foreground">
                              {JSON.stringify(alert.detection_data, null, 2)}
                            </pre>
                          </div>
                        )}

                        {alert.auto_action_taken && (
                          <Alert className="border-secondary/50 bg-secondary/5">
                            <AlertDescription>
                              <strong>Auto Action:</strong> {alert.auto_action_taken.replace('_', ' ')}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => resolveFraudAlert(alert.id, 'resolved', 'Confirmed fraud - resolved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveFraudAlert(alert.id, 'false_positive', 'False positive - no fraud detected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            False Positive
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4 mr-1" />
                            Investigate
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deletion Requests Tab */}
        <TabsContent value="deletion-requests" className="space-y-6">
          <Card className="border-border/50 bg-surface/80">
            <CardHeader>
              <CardTitle className="text-foreground">Account Deletion Requests</CardTitle>
              <CardDescription>Review and approve account deletion requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deletionRequests.filter(req => req.status === 'pending').length === 0 ? (
                  <div className="text-center py-8">
                    <Trash2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending deletion requests</p>
                  </div>
                ) : (
                  deletionRequests
                    .filter(req => req.status === 'pending')
                    .map((request) => (
                      <div key={request.id} className="p-4 border border-border/50 rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">Account Deletion Request</h3>
                            <p className="text-sm text-muted-foreground">
                              User ID: {request.user_id.slice(0, 8)}...
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Requested: {new Date(request.request_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Grace period ends: {new Date(request.grace_period_end).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={request.admin_approval ? 'default' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>

                        {request.reason && (
                          <div className="bg-muted/30 p-3 rounded">
                            <p className="text-sm"><strong>Reason:</strong> {request.reason}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletionRequest(request.id, true)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve Deletion
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletionRequest(request.id, false)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny Request
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Users className="h-4 w-4 mr-1" />
                            View User Profile
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};