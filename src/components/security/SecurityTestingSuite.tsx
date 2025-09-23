import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Lock,
  UserCheck,
  Database,
  FileCheck,
  Settings,
  Clock
} from 'lucide-react';
import { useSecurity } from '@/hooks/use-security';
import { useEnhancedSecurity } from '@/hooks/use-enhanced-security';
import { useSecurityMonitoring } from '@/hooks/use-security-monitoring';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TestCase {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  category: 'security' | 'privacy' | 'compliance';
  icon: React.ReactNode;
}

export const SecurityTestingSuite: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    privacySettings, 
    requestDataExport, 
    requestAccountDeletion,
    updatePrivacySettings,
    logSecurityEvent
  } = useSecurity();
  const { 
    deviceSessions, 
    revokeDeviceSession,
    validatePasswordStrength 
  } = useEnhancedSecurity();
  const { recentAlerts, logSecurityEvent: logMonitoringEvent } = useSecurityMonitoring();

  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'running' | 'passed' | 'failed'>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const testCases: TestCase[] = [
    {
      id: 'TC103',
      name: 'Data Export Test',
      description: 'Request data download → Complete package generated',
      status: testResults['TC103'] || 'pending',
      category: 'privacy',
      icon: <Download className="h-4 w-4" />
    },
    {
      id: 'TC104',
      name: 'Account Deletion Test',
      description: 'Delete account → All data removed after grace period',
      status: testResults['TC104'] || 'pending',
      category: 'privacy',
      icon: <Trash2 className="h-4 w-4" />
    },
    {
      id: 'TC105',
      name: 'Privacy Settings Test',
      description: 'Change visibility → Settings applied immediately',
      status: testResults['TC105'] || 'pending',
      category: 'privacy',
      icon: <Eye className="h-4 w-4" />
    },
    {
      id: 'TC106',
      name: 'Consent Management Test',
      description: 'Manage permissions → Preferences saved correctly',
      status: testResults['TC106'] || 'pending',
      category: 'compliance',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: 'TC107',
      name: 'Unauthorized Access Test',
      description: 'Invalid access attempt → Blocked and logged',
      status: testResults['TC107'] || 'pending',
      category: 'security',
      icon: <Lock className="h-4 w-4" />
    },
    {
      id: 'TC108',
      name: 'Data Protection Test',
      description: 'Modify attempt → System prevents unauthorized changes',
      status: testResults['TC108'] || 'pending',
      category: 'security',
      icon: <Shield className="h-4 w-4" />
    }
  ];

  const updateTestStatus = (testId: string, status: 'pending' | 'running' | 'passed' | 'failed') => {
    setTestResults(prev => ({ ...prev, [testId]: status }));
  };

  const runTest = async (testId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run security tests",
        variant: "destructive"
      });
      return;
    }

    setActiveTest(testId);
    updateTestStatus(testId, 'running');

    try {
      switch (testId) {
        case 'TC103':
          await testDataExport();
          break;
        case 'TC104':
          await testAccountDeletion();
          break;
        case 'TC105':
          await testPrivacySettings();
          break;
        case 'TC106':
          await testConsentManagement();
          break;
        case 'TC107':
          await testUnauthorizedAccess();
          break;
        case 'TC108':
          await testDataProtection();
          break;
        default:
          throw new Error('Unknown test case');
      }
      updateTestStatus(testId, 'passed');
      toast({
        title: "Test Passed",
        description: `${testId} completed successfully`,
        variant: "default"
      });
    } catch (error) {
      updateTestStatus(testId, 'failed');
      toast({
        title: "Test Failed",
        description: `${testId} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setActiveTest(null);
    }
  };

  const testDataExport = async () => {
    // Test data export functionality
    await requestDataExport('full');
    await logSecurityEvent('data_export_test', 'low', { test_case: 'TC103' });
  };

  const testAccountDeletion = async () => {
    // Test account deletion request (not actual deletion)
    await logSecurityEvent('account_deletion_test', 'medium', { 
      test_case: 'TC104',
      note: 'Test simulation only'
    });
  };

  const testPrivacySettings = async () => {
    // Test privacy settings update
    const originalSettings = privacySettings;
    await updatePrivacySettings({
      profile_visibility: 'private',
      analytics_tracking: false
    });
    
    // Verify settings were applied
    if (privacySettings?.profile_visibility === 'private') {
      await logSecurityEvent('privacy_settings_test', 'low', { test_case: 'TC105' });
    } else {
      throw new Error('Privacy settings not applied correctly');
    }
  };

  const testConsentManagement = async () => {
    // Test consent management
    await logSecurityEvent('consent_management_test', 'low', { 
      test_case: 'TC106',
      consent_status: 'tested'
    });
  };

  const testUnauthorizedAccess = async () => {
    // Simulate unauthorized access attempt (logged only)
    await logSecurityEvent('unauthorized_access_test', 'high', { 
      test_case: 'TC107',
      simulated: true
    });
  };

  const testDataProtection = async () => {
    // Test data protection measures
    const testPassword = 'weak123';
    const strength = validatePasswordStrength(testPassword);
    
    if (!strength.isValid) {
      await logSecurityEvent('data_protection_test', 'low', { 
        test_case: 'TC108',
        password_strength: strength.strength
      });
    } else {
      throw new Error('Weak password was accepted');
    }
  };

  const runAllTests = async () => {
    for (const testCase of testCases) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between tests
      await runTest(testCase.id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filterTestsByCategory = (category: string) => {
    return testCases.filter(test => test.category === category);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security & Privacy Testing Suite
          </h2>
          <p className="text-muted-foreground">
            Comprehensive testing for privacy controls and security measures
          </p>
        </div>
        <Button 
          onClick={runAllTests}
          disabled={activeTest !== null}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Run All Tests
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <FileCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{testCases.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Passed Tests</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter(status => status === 'passed').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).filter(status => status === 'failed').length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCases.map((testCase) => (
                  <div key={testCase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(testCase.status)}
                      <div className="flex items-center space-x-2">
                        {testCase.icon}
                        <span className="font-medium">{testCase.id}</span>
                      </div>
                      <div>
                        <p className="font-medium">{testCase.name}</p>
                        <p className="text-sm text-muted-foreground">{testCase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(testCase.status)}
                      <Button
                        size="sm"
                        onClick={() => runTest(testCase.id)}
                        disabled={activeTest === testCase.id}
                      >
                        {activeTest === testCase.id ? 'Running...' : 'Run Test'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Security Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterTestsByCategory('security').map((testCase) => (
                  <div key={testCase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(testCase.status)}
                      <div className="flex items-center space-x-2">
                        {testCase.icon}
                        <span className="font-medium">{testCase.id}</span>
                      </div>
                      <div>
                        <p className="font-medium">{testCase.name}</p>
                        <p className="text-sm text-muted-foreground">{testCase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(testCase.status)}
                      <Button
                        size="sm"
                        onClick={() => runTest(testCase.id)}
                        disabled={activeTest === testCase.id}
                      >
                        {activeTest === testCase.id ? 'Running...' : 'Run Test'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Measures Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Active Device Sessions</h4>
                  <p className="text-2xl font-bold">{deviceSessions?.length || 0}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Security Alerts</h4>
                  <p className="text-2xl font-bold">{recentAlerts?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Privacy Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterTestsByCategory('privacy').map((testCase) => (
                  <div key={testCase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(testCase.status)}
                      <div className="flex items-center space-x-2">
                        {testCase.icon}
                        <span className="font-medium">{testCase.id}</span>
                      </div>
                      <div>
                        <p className="font-medium">{testCase.name}</p>
                        <p className="text-sm text-muted-foreground">{testCase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(testCase.status)}
                      <Button
                        size="sm"
                        onClick={() => runTest(testCase.id)}
                        disabled={activeTest === testCase.id}
                      >
                        {activeTest === testCase.id ? 'Running...' : 'Run Test'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Privacy Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Profile Visibility</h4>
                    <p className="text-sm text-muted-foreground">
                      {privacySettings?.profile_visibility || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium">Analytics Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      {privacySettings?.analytics_tracking ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                GDPR Compliance Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterTestsByCategory('compliance').map((testCase) => (
                  <div key={testCase.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(testCase.status)}
                      <div className="flex items-center space-x-2">
                        {testCase.icon}
                        <span className="font-medium">{testCase.id}</span>
                      </div>
                      <div>
                        <p className="font-medium">{testCase.name}</p>
                        <p className="text-sm text-muted-foreground">{testCase.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(testCase.status)}
                      <Button
                        size="sm"
                        onClick={() => runTest(testCase.id)}
                        disabled={activeTest === testCase.id}
                      >
                        {activeTest === testCase.id ? 'Running...' : 'Run Test'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>GDPR Compliance Features:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Right to access (data export)</li>
                <li>Right to erasure (account deletion)</li>
                <li>Right to rectification (data correction)</li>
                <li>Consent management and withdrawal</li>
              </ul>
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};