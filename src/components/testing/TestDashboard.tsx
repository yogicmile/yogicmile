/**
 * Phase 6: Testing Dashboard Component
 * 
 * Admin/Developer interface for running comprehensive tests
 * and viewing security/performance metrics.
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestUtilities, PerformanceMonitor, SecurityAudit } from '@/utils/test-utilities';
import { 
  Shield, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  PlayCircle,
  Database,
  Lock,
  Activity
} from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  duration?: number;
  message?: string;
  details?: any;
}

export function TestDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [securityScore, setSecurityScore] = useState<number | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Note: In production, you'd get these from authenticated user context
      const testUserId = '00000000-0000-0000-0000-000000000001'; // Demo
      const otherUserId = '00000000-0000-0000-0000-000000000002'; // Demo
      const testMobile = '+919999999999'; // Demo

      const results: TestResult[] = [];

      // Run authentication tests
      console.log('Running authentication tests...');
      const authResults = await TestUtilities.testAuthFlow(testMobile);
      results.push({
        name: 'Authentication Flow',
        passed: authResults.otpGeneration,
        message: authResults.errors.join(', ') || 'OTP generation working',
        details: authResults,
      });

      // Run step tracking tests
      console.log('Running step tracking tests...');
      const stepResults = await TestUtilities.testStepTracking(testUserId);
      results.push({
        name: 'Step Tracking System',
        passed: stepResults.dailyStepsInsert && stepResults.walletUpdate,
        message: stepResults.errors.join(', ') || 'Step tracking functional',
        details: stepResults,
      });

      // Run wallet tests
      console.log('Running wallet tests...');
      const walletResults = await TestUtilities.testWalletTransactions(testUserId);
      results.push({
        name: 'Wallet Transactions',
        passed: walletResults.redemptionFlow && walletResults.idempotency,
        message: walletResults.errors.join(', ') || 'Wallet system functional',
        details: walletResults,
      });

      // Run RLS security tests
      console.log('Running RLS security tests...');
      const rlsResults = await TestUtilities.testRLSPolicies(testUserId, otherUserId);
      results.push({
        name: 'RLS Security Policies',
        passed: rlsResults.userDataIsolation && rlsResults.walletIsolation,
        message: rlsResults.errors.join(', ') || 'RLS policies enforced',
        details: rlsResults,
      });

      // Run security audit
      console.log('Running security audit...');
      const securityResults = await SecurityAudit.checkSensitiveDataExposure(testUserId);
      results.push({
        name: 'Sensitive Data Exposure',
        passed: !securityResults.otpExposed && !securityResults.sessionTokenExposed,
        message: securityResults.errors.join(', ') || 'No data exposure detected',
        details: securityResults,
      });

      // Calculate security score
      const passedTests = results.filter(r => r.passed).length;
      const score = Math.round((passedTests / results.length) * 100);
      setSecurityScore(score);

      setTestResults(results);
    } catch (error: any) {
      console.error('Test suite error:', error);
      setTestResults([{
        name: 'Test Suite',
        passed: false,
        message: `Error: ${error.message}`,
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runPerformanceTests = async () => {
    setIsRunning(true);
    
    try {
      console.log('Running performance tests...');
      
      // Check database indexes
      await PerformanceMonitor.checkDatabaseIndexes();
      
      // Measure bundle size
      const bundleSize = PerformanceMonitor.measureBundleSize();
      
      setTestResults([{
        name: 'Performance Audit',
        passed: bundleSize < 1024 * 1024, // < 1MB
        message: `Bundle size: ${(bundleSize / 1024).toFixed(2)} KB`,
      }]);
    } catch (error: any) {
      console.error('Performance test error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Dashboard</h1>
          <p className="text-muted-foreground">Phase 6: Quality Assurance & Testing</p>
        </div>
        
        {securityScore !== null && (
          <Badge 
            variant={securityScore >= 80 ? 'default' : securityScore >= 60 ? 'secondary' : 'destructive'}
            className="text-lg px-4 py-2"
          >
            Security Score: {securityScore}%
          </Badge>
        )}
      </div>

      <Tabs defaultValue="tests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tests">
            <CheckCircle className="w-4 h-4 mr-2" />
            Test Results
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security Audit
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>End-to-End Test Suite</CardTitle>
              <CardDescription>
                Run comprehensive tests for authentication, step tracking, wallet, and security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="w-full"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <Alert 
                      key={index}
                      variant={result.passed ? 'default' : 'destructive'}
                    >
                      <div className="flex items-start gap-3">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{result.name}</p>
                          <AlertDescription>{result.message}</AlertDescription>
                          {result.duration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Duration: {result.duration.toFixed(2)}ms
                            </p>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Audit Results
              </CardTitle>
              <CardDescription>
                Critical security issues identified in Phase 6 audit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical:</strong> GPS routes expose home addresses (needs privacy controls)
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High:</strong> Security Definer views detected (2 instances)
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Medium:</strong> Leaked password protection disabled
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Medium:</strong> Referral mobile numbers not masked
                </AlertDescription>
              </Alert>

              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/PHASE-6-TESTING-REPORT.md" target="_blank">
                    <Database className="w-4 h-4 mr-2" />
                    View Full Security Report
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Monitor database queries, bundle size, and loading times
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runPerformanceTests} 
                disabled={isRunning}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isRunning ? 'Running Tests...' : 'Run Performance Tests'}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Target Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>TTI: &lt; 3s</p>
                    <p>FCP: &lt; 1.5s</p>
                    <p>Bundle: &lt; 500KB</p>
                    <p>API: &lt; 500ms</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Optimization Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>✅ Lazy load pages</p>
                    <p>⏳ Add DB indexes</p>
                    <p>⏳ Image optimization</p>
                    <p>⏳ Bundle splitting</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
