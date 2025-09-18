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
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedPhaseSystem, PhaseTestResult } from '@/services/EnhancedPhaseSystem';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  TrendingUp, 
  Star, 
  Zap, 
  Shield, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  Play,
  Calculator,
  Crown,
  Sparkles
} from 'lucide-react';

export const PhaseTestingPanel: React.FC = () => {
  const { toast } = useToast();
  const phaseSystem = EnhancedPhaseSystem.getInstance();
  
  const [testResults, setTestResults] = useState<PhaseTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testSummary, setTestSummary] = useState<any>(null);
  const [customSteps, setCustomSteps] = useState('25000');
  const [customPhase, setCustomPhase] = useState('1');

  // All 9 phases for reference
  const allPhases = phaseSystem.getAllPhases();

  // Run individual test case
  const runIndividualTest = async (testCase: string) => {
    setIsRunning(true);
    
    try {
      let result: PhaseTestResult;
      
      switch (testCase) {
        case 'TC021':
          result = phaseSystem.testInitialPhase();
          break;
        case 'TC022':
          result = phaseSystem.testPhaseAdvancement();
          break;
        case 'TC023':
          result = phaseSystem.testMaximumPhase();
          break;
        case 'TC024':
          result = phaseSystem.testPhaseCelebration();
          break;
        case 'TC025':
          result = phaseSystem.testBlockedAdvancement();
          break;
        case 'TC026':
          result = phaseSystem.testPhasePersistence();
          break;
        case 'TC027':
          result = phaseSystem.testExactRequirementAdvancement();
          break;
        default:
          throw new Error('Unknown test case');
      }

      setTestResults(prev => {
        const filtered = prev.filter(r => r.testCase !== result.testCase);
        return [...filtered, result];
      });

      toast({
        title: result.passed ? "✅ Test Passed" : "❌ Test Failed",
        description: result.message,
        variant: result.passed ? "default" : "destructive"
      });
    } catch (error) {
      console.error(`Test ${testCase} failed:`, error);
      toast({
        title: "Test Error",
        description: `Failed to run ${testCase}`,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    
    try {
      const { results, summary } = phaseSystem.runAllTests();
      setTestResults(results);
      setTestSummary(summary);

      toast({
        title: "🧪 All Tests Complete",
        description: `${summary.passed}/${summary.totalTests} tests passed (${summary.passRate}%)`,
        variant: summary.passRate === 100 ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Failed to run all tests:', error);
      toast({
        title: "Test Suite Error",
        description: "Failed to run complete test suite",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Test custom scenario
  const testCustomScenario = () => {
    const steps = parseInt(customSteps);
    const progression = phaseSystem.getPhaseProgression(steps);
    const earnings = phaseSystem.calculateEarnings(1000, progression.currentPhase.rate);

    const customResult: PhaseTestResult = {
      testCase: `Custom Test - ${steps.toLocaleString()} steps`,
      passed: true,
      expected: 'Custom scenario',
      actual: {
        phase: progression.currentPhase.name,
        rate: progression.currentPhase.rate,
        progress: Math.round(progression.progressPercentage),
        stepsToNext: progression.stepsToNext,
        earningsFor1000Steps: earnings.totalEarnings
      },
      message: `Phase: ${progression.currentPhase.name}, Rate: ${progression.currentPhase.rate} paisa/25 steps`,
      timestamp: new Date()
    };

    setTestResults(prev => {
      const filtered = prev.filter(r => !r.testCase.startsWith('Custom Test'));
      return [...filtered, customResult];
    });

    toast({
      title: "🔍 Custom Test Complete",
      description: `${steps.toLocaleString()} steps → ${progression.currentPhase.name}`,
    });
  };

  // Calculate earning example
  const calculateEarningExample = (steps: number, rate: number) => {
    const groups = Math.floor(steps / 25);
    const paisa = groups * rate;
    const rupees = paisa / 100;
    
    return {
      steps,
      groups,
      paisa,
      rupees: rupees.toFixed(2)
    };
  };

  const TestResultCard: React.FC<{ result: PhaseTestResult }> = ({ result }) => (
    <Card className={`mt-4 border-l-4 ${result.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            {result.passed ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
            {result.testCase}
          </span>
          <Badge variant={result.passed ? "default" : "destructive"}>
            {result.passed ? "PASS" : "FAIL"}
          </Badge>
        </CardTitle>
        <CardDescription>{result.message}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="font-medium text-green-600 mb-1">Expected:</div>
            <pre className="bg-green-50 dark:bg-green-950/30 p-2 rounded text-green-800 dark:text-green-200 overflow-auto">
              {JSON.stringify(result.expected, null, 2)}
            </pre>
          </div>
          <div>
            <div className="font-medium text-blue-600 mb-1">Actual:</div>
            <pre className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded text-blue-800 dark:text-blue-200 overflow-auto">
              {JSON.stringify(result.actual, null, 2)}
            </pre>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Tested at: {result.timestamp.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Phase Progression & Earning Calculation Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing for all 9 phases and earning calculations (TC021-TC027)
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tests">Test Cases</TabsTrigger>
          <TabsTrigger value="phases">Phase System</TabsTrigger>
          <TabsTrigger value="calculations">Calculations</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phase System Test Cases (TC021-TC027)</CardTitle>
              <CardDescription>
                Test all aspects of phase progression and earning calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Master Test Runner */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                <Button 
                  onClick={runAllTests}
                  disabled={isRunning}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? 'Running All Tests...' : 'Run Complete Test Suite'}
                </Button>
                
                {testSummary && (
                  <div className="flex items-center gap-4">
                    <Badge variant={testSummary.passRate === 100 ? "default" : "destructive"}>
                      {testSummary.passed}/{testSummary.totalTests} Tests Passed
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Success Rate: {testSummary.passRate}%
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Individual Test Cases */}
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => runIndividualTest('TC021')}
                  disabled={isRunning}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 text-left"
                >
                  <Star className="h-4 w-4" />
                  <div>
                    <div className="font-medium">TC021 - Initial Phase</div>
                    <div className="text-xs text-muted-foreground">New user starts in Paisa phase (1 paisa/25 steps)</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => runIndividualTest('TC022')}
                  disabled={isRunning}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 text-left"
                >
                  <TrendingUp className="h-4 w-4" />
                  <div>
                    <div className="font-medium">TC022 - Phase Advancement</div>
                    <div className="text-xs text-muted-foreground">Complete 25000 steps → Anna phase unlock</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => runIndividualTest('TC023')}
                  disabled={isRunning}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 text-left"
                >
                  <Crown className="h-4 w-4" />
                  <div>
                    <div className="font-medium">TC023 - Maximum Phase</div>
                    <div className="text-xs text-muted-foreground">Immortal phase → 30 paisa/25 steps rate</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => runIndividualTest('TC024')}
                  disabled={isRunning}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 text-left"
                >
                  <Sparkles className="h-4 w-4" />
                  <div>
                    <div className="font-medium">TC024 - Phase Celebration</div>
                    <div className="text-xs text-muted-foreground">Advance phase → animation & notification</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => runIndividualTest('TC025')}
                  disabled={isRunning}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 text-left"
                >
                  <Shield className="h-4 w-4" />
                  <div>
                    <div className="font-medium">TC025 - Blocked Advancement</div>
                    <div className="text-xs text-muted-foreground">Try advancing without requirements → verify block</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => runIndividualTest('TC026')}
                  disabled={isRunning}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 text-left"
                >
                  <Clock className="h-4 w-4" />
                  <div>
                    <div className="font-medium">TC026 - Phase Persistence</div>
                    <div className="text-xs text-muted-foreground">Daily reset → confirm phase maintained</div>
                  </div>
                </Button>

                <Button 
                  onClick={() => runIndividualTest('TC027')}
                  disabled={isRunning}
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4 text-left col-span-2"
                >
                  <Target className="h-4 w-4" />
                  <div>
                    <div className="font-medium">TC027 - Exact Requirement</div>
                    <div className="text-xs text-muted-foreground">Reach phase requirement exactly → verify immediate advancement</div>
                  </div>
                </Button>
              </div>

              <Separator />

              {/* Custom Testing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Custom Scenario Testing</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="customSteps">Total Steps</Label>
                    <Input
                      id="customSteps"
                      value={customSteps}
                      onChange={(e) => setCustomSteps(e.target.value)}
                      placeholder="25000"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={testCustomScenario} className="w-full">
                      Test Scenario
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete 9-Phase System Overview</CardTitle>
              <CardDescription>
                All phases with their earning rates and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {allPhases.map((phase, index) => (
                  <Card key={phase.tier} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{phase.symbol}</span>
                        <div>
                          <div className="font-semibold">{phase.name}</div>
                          <div className="text-sm text-muted-foreground">{phase.spiritualName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{phase.rate} paisa</div>
                        <div className="text-sm text-muted-foreground">per 25 steps</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      <div className="flex justify-between">
                        <span>Steps Required:</span>
                        <span className="font-medium">
                          {index === allPhases.length - 1 
                            ? 'Maximum Phase' 
                            : phase.stepRequirement.toLocaleString()
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>1000 steps earnings:</span>
                        <span className="font-medium text-green-600">
                          {calculateEarningExample(1000, phase.rate).paisa} paisa
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Earning Calculation Examples
              </CardTitle>
              <CardDescription>
                Verify calculation accuracy across all phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Example calculations for 1000 steps */}
                <div>
                  <h4 className="font-semibold mb-3">1000 Steps Earnings by Phase:</h4>
                  <div className="grid gap-3">
                    {allPhases.map(phase => {
                      const example = calculateEarningExample(1000, phase.rate);
                      return (
                        <div key={phase.tier} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>{phase.symbol}</span>
                            <span className="font-medium">{phase.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{example.paisa} paisa</div>
                            <div className="text-sm text-muted-foreground">
                              {example.groups} groups × {phase.rate} paisa
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Calculation Formula */}
                <div>
                  <h4 className="font-semibold mb-3">Calculation Formula:</h4>
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-2">
                        <div><strong>Step Groups:</strong> floor(steps ÷ 25)</div>
                        <div><strong>Paisa Earned:</strong> step_groups × phase_rate</div>
                        <div><strong>Rupees:</strong> paisa_earned ÷ 100</div>
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                          <strong>Example:</strong> 1000 steps in Paisa Phase<br/>
                          • Groups: 1000 ÷ 25 = 40 groups<br/>
                          • Earnings: 40 × 1 = 40 paisa<br/>
                          • Rupees: 40 ÷ 100 = ₹0.40
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
              <CardDescription>
                Complete overview of all test results and system validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No test results yet. Run some tests to see results here.
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <TestResultCard key={index} result={result} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};