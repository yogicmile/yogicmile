import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedHealthService } from '@/services/EnhancedHealthService';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Smartphone, 
  MapPin, 
  Shield, 
  Clock, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Wifi,
  Battery
} from 'lucide-react';

export const StepTrackingTestPanel: React.FC = () => {
  const { toast } = useToast();
  const healthService = EnhancedHealthService.getInstance();
  
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [testInputs, setTestInputs] = useState({
    healthSyncSteps: '5000',
    conversionSteps: '5000',
    goalSteps: '10000',
    excessiveSteps: '60000',
    fraudSteps: '25000',
    userPhase: '1'
  });

  // TC010: Health API Sync Test
  const testHealthAPISync = async () => {
    setIsLoading(prev => ({ ...prev, healthSync: true }));
    
    try {
      const steps = parseInt(testInputs.healthSyncSteps);
      const result = await healthService.simulateHealthKitSync(steps);
      
      setTestResults(prev => ({
        ...prev,
        healthSync: {
          ...result,
          timestamp: new Date(),
          input: steps
        }
      }));

      toast({
        title: result.success ? "✅ Health Sync Test Passed" : "❌ Health Sync Test Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Health sync test failed:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, healthSync: false }));
    }
  };

  // TC011: Step-to-Coin Conversion Test
  const testStepToCoinConversion = async () => {
    setIsLoading(prev => ({ ...prev, conversion: true }));
    
    try {
      const steps = parseInt(testInputs.conversionSteps);
      const phase = parseInt(testInputs.userPhase);
      const result = healthService.calculateCoinsFromSteps(steps, phase);
      
      setTestResults(prev => ({
        ...prev,
        conversion: {
          ...result,
          timestamp: new Date(),
          input: { steps, phase }
        }
      }));

      toast({
        title: "💰 Conversion Test Complete",
        description: `${steps} steps → ${result.coins} coins (Phase ${phase})`,
      });
    } finally {
      setIsLoading(prev => ({ ...prev, conversion: false }));
    }
  };

  // TC012: Daily Goal Achievement Test
  const testGoalAchievement = async () => {
    setIsLoading(prev => ({ ...prev, goal: true }));
    
    try {
      const currentSteps = parseInt(testInputs.conversionSteps);
      const goalSteps = parseInt(testInputs.goalSteps);
      const result = await healthService.checkGoalAchievement(currentSteps, goalSteps);
      
      setTestResults(prev => ({
        ...prev,
        goal: {
          ...result,
          currentSteps,
          goalSteps,
          progress: (currentSteps / goalSteps) * 100,
          timestamp: new Date()
        }
      }));

      toast({
        title: result.achieved ? "🎯 Goal Achieved!" : "📊 Goal Progress",
        description: result.achieved 
          ? `${result.milestone} - ${currentSteps}/${goalSteps} steps`
          : `${currentSteps}/${goalSteps} steps (${Math.round((currentSteps/goalSteps)*100)}%)`,
        variant: result.achieved ? "default" : undefined
      });
    } finally {
      setIsLoading(prev => ({ ...prev, goal: false }));
    }
  };

  // TC013: Multi-Device Sync Test
  const testMultiDeviceSync = async () => {
    setIsLoading(prev => ({ ...prev, multiDevice: true }));
    
    try {
      const result = await healthService.syncMultipleDevices();
      
      setTestResults(prev => ({
        ...prev,
        multiDevice: {
          ...result,
          timestamp: new Date()
        }
      }));

      toast({
        title: "📱 Multi-Device Sync Complete",
        description: `Primary: ${result.primarySteps} steps, ${result.conflicts.length} conflicts`,
      });
    } finally {
      setIsLoading(prev => ({ ...prev, multiDevice: false }));
    }
  };

  // TC014: GPS Validation Test
  const testGPSValidation = async () => {
    setIsLoading(prev => ({ ...prev, gps: true }));
    
    try {
      const result = await healthService.validateGPSData();
      
      setTestResults(prev => ({
        ...prev,
        gps: {
          ...result,
          timestamp: new Date()
        }
      }));

      toast({
        title: result.valid ? "📍 GPS Valid" : "⚠️ GPS Invalid",
        description: result.reason || `Speed: ${result.speed.toFixed(1)} km/h, Accuracy: ${result.accuracy}m`,
        variant: result.valid ? "default" : "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, gps: false }));
    }
  };

  // TC015: Excessive Steps Test
  const testExcessiveSteps = async () => {
    setIsLoading(prev => ({ ...prev, excessive: true }));
    
    try {
      const steps = parseInt(testInputs.excessiveSteps);
      const hourlyResult = healthService.validateStepCount(steps, 'hourly');
      const dailyResult = healthService.validateStepCount(steps, 'daily');
      
      setTestResults(prev => ({
        ...prev,
        excessive: {
          steps,
          hourly: hourlyResult,
          daily: dailyResult,
          timestamp: new Date()
        }
      }));

      toast({
        title: "🚫 Excessive Steps Test",
        description: `${steps} steps - Hourly: ${hourlyResult.valid ? 'Valid' : 'Invalid'}, Daily: ${dailyResult.valid ? 'Valid' : 'Invalid'}`,
        variant: (!hourlyResult.valid || !dailyResult.valid) ? "destructive" : "default"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, excessive: false }));
    }
  };

  // TC016: Speed Validation Test
  const testSpeedValidation = async () => {
    setIsLoading(prev => ({ ...prev, speed: true }));
    
    try {
      const result = await healthService.validateWalkingSpeed();
      
      setTestResults(prev => ({
        ...prev,
        speed: {
          ...result,
          timestamp: new Date()
        }
      }));

      toast({
        title: result.valid ? "✅ Speed Valid" : "🏃‍♂️ Speed Too High",
        description: `${result.currentSpeed.toFixed(1)} km/h (max: ${result.maxAllowed} km/h)`,
        variant: result.valid ? "default" : "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, speed: false }));
    }
  };

  // TC017: Health App Disconnect Test
  const testHealthDisconnect = async () => {
    setIsLoading(prev => ({ ...prev, disconnect: true }));
    
    try {
      const result = await healthService.simulateHealthAppDisconnect();
      
      setTestResults(prev => ({
        ...prev,
        disconnect: {
          ...result,
          timestamp: new Date()
        }
      }));

      toast({
        title: "📱 Health App Disconnected",
        description: result.error,
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, disconnect: false }));
    }
  };

  // TC018: Fraud Detection Test
  const testFraudDetection = async () => {
    setIsLoading(prev => ({ ...prev, fraud: true }));
    
    try {
      // Create suspicious step data
      const suspiciousData = Array.from({ length: 10 }, (_, i) => ({
        steps: parseInt(testInputs.fraudSteps) / 10,
        timestamp: new Date(Date.now() - i * 100),
        speed: 30 + Math.random() * 10, // High speed
        accuracy: 50,
        source: 'Manual' as const,
        deviceId: 'test-device',
        validated: false,
        fraudScore: 0
      }));

      const result = healthService.detectFraud(suspiciousData);
      
      setTestResults(prev => ({
        ...prev,
        fraud: {
          ...result,
          inputSteps: testInputs.fraudSteps,
          timestamp: new Date()
        }
      }));

      toast({
        title: result.isSuspicious ? "🚨 Fraud Detected" : "✅ Clean Activity",
        description: `Score: ${result.score}/100 - Action: ${result.action}`,
        variant: result.isSuspicious ? "destructive" : "default"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, fraud: false }));
    }
  };

  // TC019: Midnight Rollover Test
  const testMidnightRollover = async () => {
    setIsLoading(prev => ({ ...prev, midnight: true }));
    
    try {
      const steps = parseInt(testInputs.conversionSteps);
      const result = await healthService.testMidnightRollover(steps);
      
      setTestResults(prev => ({
        ...prev,
        midnight: {
          ...result,
          timestamp: new Date()
        }
      }));

      toast({
        title: "🕛 Midnight Rollover Test",
        description: `${steps} steps assigned to ${result.date}${result.newDay ? ' (New Day!)' : ''}`,
      });
    } finally {
      setIsLoading(prev => ({ ...prev, midnight: false }));
    }
  };

  // TC020: Multiple Wearables Test
  const testMultipleWearables = async () => {
    setIsLoading(prev => ({ ...prev, wearables: true }));
    
    try {
      const result = await healthService.manageMultipleWearables();
      
      setTestResults(prev => ({
        ...prev,
        wearables: {
          ...result,
          timestamp: new Date()
        }
      }));

      toast({
        title: "⌚ Wearables Test Complete",
        description: `${result.devices.length} devices, Primary: ${result.primary?.name}`,
      });
    } finally {
      setIsLoading(prev => ({ ...prev, wearables: false }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setTestInputs(prev => ({ ...prev, [field]: value }));
  };

  const ResultCard: React.FC<{ title: string; result: any; icon: React.ReactNode }> = ({ title, result, icon }) => {
    if (!result) return null;

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {icon}
            {title}
            <Badge variant="outline" className="ml-auto">
              {new Date(result.timestamp).toLocaleTimeString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Step Tracking & Health Integration Test Panel
          </CardTitle>
          <CardDescription>
            Comprehensive testing suite for all step tracking features and health API integration
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Tests</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Functionality Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="healthSyncSteps">Steps to Sync (TC010)</Label>
                  <Input
                    id="healthSyncSteps"
                    value={testInputs.healthSyncSteps}
                    onChange={(e) => handleInputChange('healthSyncSteps', e.target.value)}
                    placeholder="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="userPhase">User Phase (1-5)</Label>
                  <Input
                    id="userPhase"
                    value={testInputs.userPhase}
                    onChange={(e) => handleInputChange('userPhase', e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>

              <Separator />

              {/* Basic Tests */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={testHealthAPISync}
                  disabled={isLoading.healthSync}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  {isLoading.healthSync ? 'Testing...' : 'Test Health API Sync (TC010)'}
                </Button>

                <Button 
                  onClick={testStepToCoinConversion}
                  disabled={isLoading.conversion}
                  className="flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  {isLoading.conversion ? 'Testing...' : 'Test Coin Conversion (TC011)'}
                </Button>

                <Button 
                  onClick={testGoalAchievement}
                  disabled={isLoading.goal}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isLoading.goal ? 'Testing...' : 'Test Goal Achievement (TC012)'}
                </Button>

                <Button 
                  onClick={testMultiDeviceSync}
                  disabled={isLoading.multiDevice}
                  className="flex items-center gap-2"
                >
                  <Wifi className="h-4 w-4" />
                  {isLoading.multiDevice ? 'Testing...' : 'Test Multi-Device (TC013)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results for Basic Tests */}
          <ResultCard title="Health API Sync Result" result={testResults.healthSync} icon={<Smartphone className="h-4 w-4" />} />
          <ResultCard title="Conversion Result" result={testResults.conversion} icon={<Zap className="h-4 w-4" />} />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation & Security Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="excessiveSteps">Excessive Steps Test</Label>
                  <Input
                    id="excessiveSteps"
                    value={testInputs.excessiveSteps}
                    onChange={(e) => handleInputChange('excessiveSteps', e.target.value)}
                    placeholder="60000"
                  />
                </div>
                <div>
                  <Label htmlFor="fraudSteps">Fraud Detection Test</Label>
                  <Input
                    id="fraudSteps"
                    value={testInputs.fraudSteps}
                    onChange={(e) => handleInputChange('fraudSteps', e.target.value)}
                    placeholder="25000"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={testGPSValidation}
                  disabled={isLoading.gps}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {isLoading.gps ? 'Testing...' : 'Test GPS Validation (TC014)'}
                </Button>

                <Button 
                  onClick={testExcessiveSteps}
                  disabled={isLoading.excessive}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  {isLoading.excessive ? 'Testing...' : 'Test Excessive Steps (TC015)'}
                </Button>

                <Button 
                  onClick={testSpeedValidation}
                  disabled={isLoading.speed}
                  className="flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  {isLoading.speed ? 'Testing...' : 'Test Speed Validation (TC016)'}
                </Button>

                <Button 
                  onClick={testFraudDetection}
                  disabled={isLoading.fraud}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {isLoading.fraud ? 'Testing...' : 'Test Fraud Detection (TC018)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <ResultCard title="GPS Validation Result" result={testResults.gps} icon={<MapPin className="h-4 w-4" />} />
          <ResultCard title="Fraud Detection Result" result={testResults.fraud} icon={<Shield className="h-4 w-4" />} />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Feature Tests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={testHealthDisconnect}
                  disabled={isLoading.disconnect}
                  className="flex items-center gap-2"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4" />
                  {isLoading.disconnect ? 'Testing...' : 'Test Health Disconnect (TC017)'}
                </Button>

                <Button 
                  onClick={testMidnightRollover}
                  disabled={isLoading.midnight}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  {isLoading.midnight ? 'Testing...' : 'Test Midnight Rollover (TC019)'}
                </Button>

                <Button 
                  onClick={testMultipleWearables}
                  disabled={isLoading.wearables}
                  className="flex items-center gap-2"
                >
                  <Battery className="h-4 w-4" />
                  {isLoading.wearables ? 'Testing...' : 'Test Multiple Wearables (TC020)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <ResultCard title="Health Disconnect Result" result={testResults.disconnect} icon={<XCircle className="h-4 w-4" />} />
          <ResultCard title="Midnight Rollover Result" result={testResults.midnight} icon={<Clock className="h-4 w-4" />} />
          <ResultCard title="Multiple Wearables Result" result={testResults.wearables} icon={<Battery className="h-4 w-4" />} />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
              <CardDescription>
                Complete overview of all test results and system status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(testResults).length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No test results yet. Run some tests to see results here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {Object.entries(testResults).map(([key, result]) => (
                    <div key={key} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <Badge variant={result.success !== false ? "default" : "destructive"}>
                          {result.success !== false ? "Pass" : "Fail"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tested at: {new Date(result.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};