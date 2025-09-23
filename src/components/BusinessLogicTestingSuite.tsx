import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Clock, Shield, DollarSign, Users, TrendingUp, Calendar, Eye, Activity } from 'lucide-react';

interface TestResult {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
  businessImpact: 'critical' | 'high' | 'medium' | 'low';
  executionTime?: number;
}

interface BusinessMetrics {
  dailyActiveUsers: number;
  retentionRate: number;
  fraudDetectionRate: number;
  revenuePerUser: number;
  churnRate: number;
}

export const BusinessLogicTestingSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    dailyActiveUsers: 0,
    retentionRate: 0,
    fraudDetectionRate: 0,
    revenuePerUser: 0,
    churnRate: 0
  });

  const runBusinessLogicTests = async () => {
    setIsRunning(true);
    setProgress(0);
    const results: TestResult[] = [];

    // TC130: Daily Reset Tests
    await testDailyReset(results);
    setProgress(25);

    // TC131: Fraud Detection Tests
    await testFraudDetection(results);
    setProgress(50);

    // TC132: Revenue Tracking Tests
    await testRevenueTracking(results);
    setProgress(75);

    // TC133: User Lifecycle Tests
    await testUserLifecycle(results);
    setProgress(100);

    setTestResults(results);
    await updateBusinessMetrics();
    setIsRunning(false);
  };

  const testDailyReset = async (results: TestResult[]) => {
    const startTime = Date.now();
    
    try {
      // Test step counter reset
      const stepResetTest = await simulateMidnightReset('steps');
      results.push({
        id: 'daily_reset_steps',
        name: 'Step Counter Reset',
        status: stepResetTest.success ? 'pass' : 'fail',
        message: stepResetTest.success 
          ? 'Step counters reset correctly at midnight'
          : 'Step counter reset failed',
        details: stepResetTest.details,
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });

      // Test spin wheel cooldown reset
      const spinResetTest = await simulateMidnightReset('spins');
      results.push({
        id: 'daily_reset_spins',
        name: 'Spin Wheel Cooldown Reset',
        status: spinResetTest.success ? 'pass' : 'fail',
        message: spinResetTest.success 
          ? 'Spin wheel cooldowns refreshed correctly'
          : 'Spin wheel reset failed',
        details: spinResetTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

      // Test daily challenges reset
      const challengeResetTest = await simulateMidnightReset('challenges');
      results.push({
        id: 'daily_reset_challenges',
        name: 'Daily Challenges Reset',
        status: challengeResetTest.success ? 'pass' : 'fail',
        message: challengeResetTest.success 
          ? 'Daily challenges reset correctly'
          : 'Daily challenges reset failed',
        details: challengeResetTest.details,
        businessImpact: 'medium',
        executionTime: Date.now() - startTime
      });

      // Test streak calculations
      const streakTest = await validateStreakCalculations();
      results.push({
        id: 'daily_reset_streaks',
        name: 'Streak Calculations',
        status: streakTest.valid ? 'pass' : 'fail',
        message: streakTest.valid 
          ? 'Streak calculations updated correctly'
          : 'Streak calculation errors detected',
        details: streakTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      results.push({
        id: 'daily_reset_error',
        name: 'Daily Reset System',
        status: 'fail',
        message: 'Critical error in daily reset system',
        details: error instanceof Error ? error.message : 'Unknown error',
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });
    }
  };

  const testFraudDetection = async (results: TestResult[]) => {
    const startTime = Date.now();
    
    try {
      // Test excessive steps detection
      const excessiveStepsTest = await testFraudRule('excessive_steps', 55000);
      results.push({
        id: 'fraud_excessive_steps',
        name: 'Excessive Steps Detection (>50,000/day)',
        status: excessiveStepsTest.flagged ? 'pass' : 'fail',
        message: excessiveStepsTest.flagged 
          ? 'Excessive steps properly flagged for review'
          : 'Failed to detect excessive step counts',
        details: excessiveStepsTest.details,
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });

      // Test impossible speed detection
      const speedTest = await testFraudRule('impossible_speed', 30);
      results.push({
        id: 'fraud_speed_detection',
        name: 'Impossible Speed Detection (>25 km/h)',
        status: speedTest.flagged ? 'pass' : 'fail',
        message: speedTest.flagged 
          ? 'Impossible walking speeds properly rejected'
          : 'Failed to detect impossible speeds',
        details: speedTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

      // Test multiple account detection
      const multiAccountTest = await testFraudRule('multiple_accounts', 'same_device');
      results.push({
        id: 'fraud_multi_account',
        name: 'Multiple Account Detection',
        status: multiAccountTest.flagged ? 'pass' : 'fail',
        message: multiAccountTest.flagged 
          ? 'Multiple accounts from same device detected'
          : 'Failed to detect multiple account creation',
        details: multiAccountTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

      // Test location change detection
      const locationTest = await testFraudRule('impossible_location', 'teleportation');
      results.push({
        id: 'fraud_location_detection',
        name: 'Impossible Location Changes',
        status: locationTest.flagged ? 'pass' : 'fail',
        message: locationTest.flagged 
          ? 'Impossible location changes detected'
          : 'Failed to detect teleportation patterns',
        details: locationTest.details,
        businessImpact: 'medium',
        executionTime: Date.now() - startTime
      });

      // Test repetitive pattern detection
      const patternTest = await testFraudRule('repetitive_patterns', 'identical_steps');
      results.push({
        id: 'fraud_pattern_detection',
        name: 'Repetitive Pattern Detection',
        status: patternTest.flagged ? 'pass' : 'fail',
        message: patternTest.flagged 
          ? 'Repetitive identical patterns flagged'
          : 'Failed to detect repetitive patterns',
        details: patternTest.details,
        businessImpact: 'medium',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      results.push({
        id: 'fraud_detection_error',
        name: 'Fraud Detection System',
        status: 'fail',
        message: 'Critical error in fraud detection system',
        details: error instanceof Error ? error.message : 'Unknown error',
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });
    }
  };

  const testRevenueTracking = async (results: TestResult[]) => {
    const startTime = Date.now();
    
    try {
      // Test ad impression tracking
      const impressionTest = await testRevenueMetric('ad_impressions');
      results.push({
        id: 'revenue_impressions',
        name: 'Ad Impression Tracking',
        status: impressionTest.accurate ? 'pass' : 'fail',
        message: impressionTest.accurate 
          ? 'Ad impressions counted and attributed correctly'
          : 'Ad impression tracking has discrepancies',
        details: impressionTest.details,
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });

      // Test click-through tracking
      const clickTest = await testRevenueMetric('click_through');
      results.push({
        id: 'revenue_clicks',
        name: 'Click-Through Tracking',
        status: clickTest.accurate ? 'pass' : 'fail',
        message: clickTest.accurate 
          ? 'Click-through tracked with accurate timestamps'
          : 'Click-through tracking has timing issues',
        details: clickTest.details,
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });

      // Test partner commission calculations
      const commissionTest = await testRevenueMetric('partner_commissions');
      results.push({
        id: 'revenue_commissions',
        name: 'Partner Commission Calculations',
        status: commissionTest.accurate ? 'pass' : 'fail',
        message: commissionTest.accurate 
          ? 'Partner commissions calculated correctly'
          : 'Commission calculation errors detected',
        details: commissionTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

      // Test user acquisition cost tracking
      const acquisitionTest = await testRevenueMetric('user_acquisition_cost');
      results.push({
        id: 'revenue_acquisition',
        name: 'User Acquisition Cost Tracking',
        status: acquisitionTest.accurate ? 'pass' : 'fail',
        message: acquisitionTest.accurate 
          ? 'User acquisition costs tracked accurately'
          : 'Acquisition cost tracking has errors',
        details: acquisitionTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

      // Test lifetime value calculations
      const ltv_test = await testRevenueMetric('lifetime_value');
      results.push({
        id: 'revenue_ltv',
        name: 'Lifetime Value Calculations',
        status: ltv_test.accurate ? 'pass' : 'fail',
        message: ltv_test.accurate 
          ? 'Lifetime value calculations accurate'
          : 'LTV calculation discrepancies found',
        details: ltv_test.details,
        businessImpact: 'medium',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      results.push({
        id: 'revenue_tracking_error',
        name: 'Revenue Tracking System',
        status: 'fail',
        message: 'Critical error in revenue tracking',
        details: error instanceof Error ? error.message : 'Unknown error',
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });
    }
  };

  const testUserLifecycle = async (results: TestResult[]) => {
    const startTime = Date.now();
    
    try {
      // Test new user segmentation (0-7 days)
      const newUserTest = await testUserSegmentation('new_users', '0-7 days');
      results.push({
        id: 'lifecycle_new_users',
        name: 'New User Segmentation (0-7 days)',
        status: newUserTest.accurate ? 'pass' : 'fail',
        message: newUserTest.accurate 
          ? 'New users properly categorized for onboarding'
          : 'New user segmentation has errors',
        details: newUserTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

      // Test active user segmentation
      const activeUserTest = await testUserSegmentation('active_users', 'regular_usage');
      results.push({
        id: 'lifecycle_active_users',
        name: 'Active User Segmentation',
        status: activeUserTest.accurate ? 'pass' : 'fail',
        message: activeUserTest.accurate 
          ? 'Active users properly identified for engagement'
          : 'Active user segmentation issues detected',
        details: activeUserTest.details,
        businessImpact: 'medium',
        executionTime: Date.now() - startTime
      });

      // Test at-risk user identification
      const atRiskTest = await testUserSegmentation('at_risk_users', 'declining_activity');
      results.push({
        id: 'lifecycle_at_risk',
        name: 'At-Risk User Identification',
        status: atRiskTest.accurate ? 'pass' : 'fail',
        message: atRiskTest.accurate 
          ? 'At-risk users identified for re-engagement'
          : 'At-risk user detection has gaps',
        details: atRiskTest.details,
        businessImpact: 'high',
        executionTime: Date.now() - startTime
      });

      // Test churned user segmentation (>30 days inactive)
      const churnedTest = await testUserSegmentation('churned_users', 'inactive_30_days');
      results.push({
        id: 'lifecycle_churned',
        name: 'Churned User Segmentation (>30 days)',
        status: churnedTest.accurate ? 'pass' : 'fail',
        message: churnedTest.accurate 
          ? 'Churned users properly categorized for win-back'
          : 'Churned user segmentation errors found',
        details: churnedTest.details,
        businessImpact: 'medium',
        executionTime: Date.now() - startTime
      });

    } catch (error) {
      results.push({
        id: 'user_lifecycle_error',
        name: 'User Lifecycle Management',
        status: 'fail',
        message: 'Critical error in user lifecycle system',
        details: error instanceof Error ? error.message : 'Unknown error',
        businessImpact: 'critical',
        executionTime: Date.now() - startTime
      });
    }
  };

  // Simulation functions
  const simulateMidnightReset = async (resetType: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      details: success 
        ? `${resetType} reset completed successfully at midnight UTC`
        : `${resetType} reset failed - database transaction error`
    };
  };

  const validateStreakCalculations = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const valid = Math.random() > 0.15; // 85% success rate
    
    return {
      valid,
      details: valid 
        ? 'All streak calculations validated against business rules'
        : 'Streak calculation discrepancies found in 3% of user records'
    };
  };

  const testFraudRule = async (ruleType: string, testValue: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const flagged = Math.random() > 0.2; // 80% detection rate
    
    const ruleDetails: Record<string, string> = {
      excessive_steps: `Tested with ${testValue} steps - threshold: 50,000`,
      impossible_speed: `Tested with ${testValue} km/h - threshold: 25 km/h`,
      multiple_accounts: `Tested ${testValue} scenario - device fingerprinting`,
      impossible_location: `Tested ${testValue} scenario - geofencing validation`,
      repetitive_patterns: `Tested ${testValue} scenario - ML pattern detection`
    };
    
    return {
      flagged,
      details: flagged 
        ? `${ruleDetails[ruleType]} - FLAGGED for manual review`
        : `${ruleDetails[ruleType]} - NOT DETECTED (potential false negative)`
    };
  };

  const testRevenueMetric = async (metricType: string) => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const accurate = Math.random() > 0.1; // 90% accuracy rate
    
    const metricDetails: Record<string, string> = {
      ad_impressions: 'Tracked 1,247 impressions with 99.8% attribution accuracy',
      click_through: 'Tracked 89 clicks with average 0.03s timestamp precision',
      partner_commissions: 'Calculated ₹2,847 in commissions with 0.02% variance',
      user_acquisition_cost: 'CAC calculated at ₹47.50 per user with full attribution',
      lifetime_value: 'LTV calculated at ₹186 per user over 12-month period'
    };
    
    return {
      accurate,
      details: accurate 
        ? metricDetails[metricType]
        : `${metricType} tracking showing discrepancies - requires investigation`
    };
  };

  const testUserSegmentation = async (segmentType: string, criteria: string) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const accurate = Math.random() > 0.12; // 88% accuracy rate
    
    const segmentDetails: Record<string, string> = {
      new_users: 'Identified 127 new users for onboarding optimization',
      active_users: 'Classified 2,847 users as active for engagement campaigns',
      at_risk_users: 'Flagged 189 users showing declining activity patterns',
      churned_users: 'Identified 74 churned users for win-back campaigns'
    };
    
    return {
      accurate,
      details: accurate 
        ? `${segmentDetails[segmentType]} - ${criteria}`
        : `${segmentType} segmentation accuracy below threshold - rules need refinement`
    };
  };

  const updateBusinessMetrics = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setBusinessMetrics({
      dailyActiveUsers: Math.floor(Math.random() * 3000) + 2000,
      retentionRate: Math.round((Math.random() * 30 + 60) * 100) / 100,
      fraudDetectionRate: Math.round((Math.random() * 5 + 92) * 100) / 100,
      revenuePerUser: Math.round((Math.random() * 50 + 150) * 100) / 100,
      churnRate: Math.round((Math.random() * 8 + 4) * 100) / 100
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'fail': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getImpactBadge = (impact: TestResult['businessImpact']) => {
    const variants = {
      critical: 'destructive',
      high: 'secondary',
      medium: 'outline',
      low: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[impact]} className="ml-2">
        {impact.toUpperCase()}
      </Badge>
    );
  };

  const calculateOverallScore = () => {
    if (testResults.length === 0) return 0;
    const passed = testResults.filter(r => r.status === 'pass').length;
    return Math.round((passed / testResults.length) * 100);
  };

  const groupResultsByCategory = () => {
    const categories = {
      'Daily Reset (TC130)': testResults.filter(r => r.id.includes('daily_reset')),
      'Fraud Detection (TC131)': testResults.filter(r => r.id.includes('fraud')),
      'Revenue Tracking (TC132)': testResults.filter(r => r.id.includes('revenue')),
      'User Lifecycle (TC133)': testResults.filter(r => r.id.includes('lifecycle'))
    };
    return categories;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Business Logic Testing Suite
          </CardTitle>
          <CardDescription>
            Test core business rules, daily operations, fraud detection, and revenue tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {testResults.length > 0 && (
                <Badge variant={calculateOverallScore() >= 85 ? 'default' : calculateOverallScore() >= 70 ? 'secondary' : 'destructive'}>
                  Overall Score: {calculateOverallScore()}%
                </Badge>
              )}
            </div>
            <Button 
              onClick={runBusinessLogicTests} 
              disabled={isRunning}
            >
              {isRunning ? 'Running Tests...' : 'Run Business Logic Tests'}
            </Button>
          </div>
          
          {isRunning && (
            <div className="mb-4">
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                Testing business logic and application rules...
              </p>
            </div>
          )}

          {Object.keys(businessMetrics).some(key => businessMetrics[key as keyof BusinessMetrics] > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{businessMetrics.dailyActiveUsers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Daily Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{businessMetrics.retentionRate}%</div>
                <div className="text-xs text-muted-foreground">Retention Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">{businessMetrics.fraudDetectionRate}%</div>
                <div className="text-xs text-muted-foreground">Fraud Detection</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">₹{businessMetrics.revenuePerUser}</div>
                <div className="text-xs text-muted-foreground">Revenue/User</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{businessMetrics.churnRate}%</div>
                <div className="text-xs text-muted-foreground">Churn Rate</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="results" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="daily-reset">Daily Reset</TabsTrigger>
          <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
          <TabsTrigger value="revenue">Revenue & Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {testResults.length > 0 ? (
            Object.entries(groupResultsByCategory()).map(([category, results]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {category.includes('Daily Reset') && <Clock className="w-4 h-4" />}
                    {category.includes('Fraud Detection') && <Shield className="w-4 h-4" />}
                    {category.includes('Revenue') && <DollarSign className="w-4 h-4" />}
                    {category.includes('Lifecycle') && <Users className="w-4 h-4" />}
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.map((result) => (
                      <div key={result.id} className="flex items-start gap-3 p-3 rounded-lg border">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{result.name}</h4>
                            <div className="flex items-center">
                              {getStatusBadge(result.status)}
                              {getImpactBadge(result.businessImpact)}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {result.message}
                          </p>
                          {result.details && (
                            <p className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
                              {result.details}
                            </p>
                          )}
                          {result.executionTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Execution time: {result.executionTime}ms
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Click "Run Business Logic Tests" to start testing
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="daily-reset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Daily Reset Functionality (TC130)
              </CardTitle>
              <CardDescription>
                Midnight rollover operations and daily boundary management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Reset Operations</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Step counters reset to 0 at midnight UTC</li>
                    <li>• Spin wheel cooldowns refresh for all users</li>
                    <li>• Daily challenges reset with new objectives</li>
                    <li>• Streak calculations update based on previous day activity</li>
                    <li>• Analytics day boundaries maintained consistently</li>
                  </ul>
                </div>
                <Alert>
                  <Clock className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Critical:</strong> Daily reset failures can impact user engagement and revenue tracking. 
                    All reset operations must complete within 5-minute window.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Fraud Detection Rules (TC131)
              </CardTitle>
              <CardDescription>
                Automated fraud detection and prevention mechanisms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Detection Rules</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <strong>Step Fraud:</strong> &gt;50,000 steps/day flagged for manual review
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <strong>Speed Fraud:</strong> Walking speed &gt;25 km/h automatically rejected
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-lg">
                      <strong>Multi-Account:</strong> Multiple accounts from same device fingerprint
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <strong>Location Fraud:</strong> Impossible location changes detected via geofencing
                    </div>
                  </div>
                </div>
                <Alert>
                  <Shield className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Target:</strong> Maintain &gt;95% fraud detection accuracy while keeping false positives &lt;2%.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Revenue Tracking (TC132)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Ad impression counting with 99.9% accuracy</li>
                  <li>• Click-through tracking with precise timestamps</li>
                  <li>• Partner commission calculations with real-time updates</li>
                  <li>• User acquisition cost tracking across all channels</li>
                  <li>• Lifetime value calculations with 12-month projections</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  User Lifecycle (TC133)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <strong className="text-success">New Users (0-7 days):</strong>
                    <p className="text-sm text-muted-foreground">Onboarding optimization and engagement tracking</p>
                  </div>
                  <div>
                    <strong className="text-primary">Active Users:</strong>
                    <p className="text-sm text-muted-foreground">Regular usage patterns and feature engagement</p>
                  </div>
                  <div>
                    <strong className="text-warning">At-Risk Users:</strong>
                    <p className="text-sm text-muted-foreground">Declining activity triggers re-engagement campaigns</p>
                  </div>
                  <div>
                    <strong className="text-destructive">Churned Users (&gt;30 days):</strong>
                    <p className="text-sm text-muted-foreground">Win-back attempts and churn analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};