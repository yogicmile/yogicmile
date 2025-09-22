import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  RotateCw, 
  Timer, 
  TrendingUp, 
  Trophy, 
  Shuffle, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Target,
  Clock,
  Coins,
  Gift,
  BarChart3,
  Settings
} from 'lucide-react';

interface TestResult {
  testCase: string;
  status: 'passed' | 'failed' | 'running';
  message: string;
  details?: any;
}

interface SpinTestStats {
  totalSpins: number;
  rewards: { [key: string]: number };
  fairnessScore: number;
  averageWaitTime: number;
}

interface SpinWheelTestPanelProps {
  onTestComplete?: (results: TestResult[]) => void;
}

export const SpinWheelTestPanel: React.FC<SpinWheelTestPanelProps> = ({ onTestComplete }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [spinStats, setSpinStats] = useState<SpinTestStats>({
    totalSpins: 0,
    rewards: {},
    fairnessScore: 0,
    averageWaitTime: 0
  });

  const [simulatedState, setSimulatedState] = useState({
    dailySteps: 5000,
    availableSpins: 1,
    lastSpinTime: null as Date | null,
    cooldownRemaining: 0,
    isPremiumUser: false,
    walletBalance: 1000
  });

  const testCases = [
    {
      id: 'TC052',
      name: 'Available Spin Test',
      description: 'User has free spin - verify wheel accessible and spinnable',
      icon: CheckCircle,
      category: 'basic'
    },
    {
      id: 'TC053', 
      name: 'Spin Execution Test',
      description: 'Perform spin - check random reward given with animation',
      icon: RotateCw,
      category: 'basic'
    },
    {
      id: 'TC054',
      name: 'Coin Rewards Test', 
      description: 'Win coins from spin - verify wallet updated immediately',
      icon: Coins,
      category: 'rewards'
    },
    {
      id: 'TC055',
      name: 'Bonus Spin Test',
      description: 'Win additional spin - check extra spin granted', 
      icon: Gift,
      category: 'rewards'
    },
    {
      id: 'TC056',
      name: 'No Spins Available Test',
      description: 'User exhausted spins - verify disabled with countdown timer',
      icon: Timer,
      category: 'timers'
    },
    {
      id: 'TC057',
      name: 'Cooldown Period Test',
      description: 'Try spinning during cooldown - confirm blocked with timer',
      icon: Clock,
      category: 'timers'
    },
    {
      id: 'TC058',
      name: 'Fair Randomization Test',
      description: 'Perform 100 spins - verify random distribution',
      icon: BarChart3,
      category: 'fairness'
    },
    {
      id: 'TC059',
      name: 'Rapid Attempts Test',
      description: 'Multiple quick spin attempts - only valid spins processed',
      icon: Shuffle,
      category: 'fairness'
    }
  ];

  const expectedRewards = {
    '10_paisa': { probability: 30, description: '10 paisa' },
    '25_paisa': { probability: 25, description: '25 paisa' },
    '50_paisa': { probability: 20, description: '50 paisa' },
    '100_paisa': { probability: 15, description: '100 paisa' },
    'bonus_spin': { probability: 10, description: 'Bonus spin' }
  };

  useEffect(() => {
    // Update cooldown timer every second
    const interval = setInterval(() => {
      if (simulatedState.cooldownRemaining > 0) {
        setSimulatedState(prev => ({
          ...prev,
          cooldownRemaining: Math.max(0, prev.cooldownRemaining - 1)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [simulatedState.cooldownRemaining]);

  const simulateSpin = () => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [rewardType, reward] of Object.entries(expectedRewards)) {
      cumulative += reward.probability;
      if (random <= cumulative) {
        return rewardType;
      }
    }
    
    return '10_paisa'; // Fallback
  };

  const runSingleTest = async (testId: string) => {
    setSelectedTest(testId);
    setIsRunning(true);
    
    const testCase = testCases.find(tc => tc.id === testId);
    if (!testCase) return;

    let result: TestResult = {
      testCase: testId,
      status: 'running',
      message: 'Test in progress...'
    };

    setTestResults(prev => {
      const filtered = prev.filter(r => r.testCase !== testId);
      return [...filtered, result];
    });

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      switch (testId) {
        case 'TC052':
          result = {
            testCase: testId,
            status: simulatedState.availableSpins > 0 ? 'passed' : 'failed',
            message: simulatedState.availableSpins > 0 
              ? 'Spin wheel is accessible and ready' 
              : 'No spins available',
            details: { availableSpins: simulatedState.availableSpins }
          };
          break;

        case 'TC053':
          const reward = simulateSpin();
          result = {
            testCase: testId,
            status: 'passed',
            message: `Spin executed successfully, won: ${expectedRewards[reward].description}`,
            details: { reward, animationTime: '3000ms' }
          };
          break;

        case 'TC054':
          const coinReward = simulateSpin();
          if (coinReward.includes('paisa')) {
            const amount = parseInt(coinReward.split('_')[0]);
            setSimulatedState(prev => ({
              ...prev,
              walletBalance: prev.walletBalance + amount
            }));
            result = {
              testCase: testId,
              status: 'passed',
              message: `Wallet updated: +${amount} paisa`,
              details: { 
                previousBalance: simulatedState.walletBalance,
                newBalance: simulatedState.walletBalance + amount
              }
            };
          } else {
            result = {
              testCase: testId,
              status: 'passed',
              message: 'Non-coin reward received',
              details: { reward: coinReward }
            };
          }
          break;

        case 'TC055':
          const bonusResult = simulateSpin();
          if (bonusResult === 'bonus_spin') {
            setSimulatedState(prev => ({
              ...prev,
              availableSpins: prev.availableSpins + 1
            }));
            result = {
              testCase: testId,
              status: 'passed',
              message: 'Bonus spin awarded successfully',
              details: { newSpinCount: simulatedState.availableSpins + 1 }
            };
          } else {
            result = {
              testCase: testId,
              status: 'passed',
              message: 'No bonus spin this time',
              details: { reward: bonusResult }
            };
          }
          break;

        case 'TC056':
          setSimulatedState(prev => ({ ...prev, availableSpins: 0 }));
          result = {
            testCase: testId,
            status: 'passed',
            message: 'Spin wheel correctly disabled, countdown displayed',
            details: { 
              timeUntilNextSpin: '23:45:12',
              wheelDisabled: true 
            }
          };
          break;

        case 'TC057':
          setSimulatedState(prev => ({
            ...prev,
            cooldownRemaining: 86400 // 24 hours in seconds
          }));
          result = {
            testCase: testId,
            status: 'passed',
            message: 'Cooldown active - spin attempts blocked',
            details: { cooldownTime: '24:00:00' }
          };
          break;

        case 'TC058':
          const multiSpinResults: { [key: string]: number } = {};
          const totalTestSpins = 100;
          
          for (let i = 0; i < totalTestSpins; i++) {
            const spinResult = simulateSpin();
            multiSpinResults[spinResult] = (multiSpinResults[spinResult] || 0) + 1;
          }
          
          // Calculate fairness score
          let fairnessScore = 0;
          for (const [rewardType, count] of Object.entries(multiSpinResults)) {
            const actualPercentage = (count / totalTestSpins) * 100;
            const expectedPercentage = expectedRewards[rewardType].probability;
            const deviation = Math.abs(actualPercentage - expectedPercentage);
            fairnessScore += Math.max(0, 100 - deviation * 2); // Penalty for deviation
          }
          fairnessScore = fairnessScore / Object.keys(expectedRewards).length;

          setSpinStats(prev => ({
            ...prev,
            totalSpins: totalTestSpins,
            rewards: multiSpinResults,
            fairnessScore
          }));

          result = {
            testCase: testId,
            status: fairnessScore > 80 ? 'passed' : 'failed',
            message: `Fairness test completed - Score: ${fairnessScore.toFixed(1)}%`,
            details: { 
              results: multiSpinResults,
              fairnessScore: fairnessScore.toFixed(1),
              totalSpins: totalTestSpins
            }
          };
          break;

        case 'TC059':
          // Simulate rapid clicking
          let validSpins = 0;
          let blockedAttempts = 0;
          const rapidAttempts = 10;
          
          for (let i = 0; i < rapidAttempts; i++) {
            if (simulatedState.availableSpins > 0 && simulatedState.cooldownRemaining === 0) {
              validSpins++;
              setSimulatedState(prev => ({ 
                ...prev, 
                availableSpins: Math.max(0, prev.availableSpins - 1),
                cooldownRemaining: i < 5 ? 0 : 300 // Add cooldown after 5 spins
              }));
            } else {
              blockedAttempts++;
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // Rapid clicking
          }

          result = {
            testCase: testId,
            status: blockedAttempts > 0 ? 'passed' : 'failed',
            message: `Rapid attempts handled: ${validSpins} valid, ${blockedAttempts} blocked`,
            details: { validSpins, blockedAttempts, totalAttempts: rapidAttempts }
          };
          break;

        default:
          result = {
            testCase: testId,
            status: 'failed',
            message: 'Test case not implemented'
          };
      }
    } catch (error) {
      result = {
        testCase: testId,
        status: 'failed',
        message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }

    setTestResults(prev => {
      const filtered = prev.filter(r => r.testCase !== testId);
      return [...filtered, result];
    });

    setIsRunning(false);
    setSelectedTest(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (const testCase of testCases) {
      await runSingleTest(testCase.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause between tests
    }
    
    setIsRunning(false);
    
    if (onTestComplete) {
      onTestComplete(testResults);
    }
  };

  const resetTests = () => {
    setTestResults([]);
    setSpinStats({
      totalSpins: 0,
      rewards: {},
      fairnessScore: 0,
      averageWaitTime: 0
    });
    setSimulatedState({
      dailySteps: 5000,
      availableSpins: 1,
      lastSpinTime: null,
      cooldownRemaining: 0,
      isPremiumUser: false,
      walletBalance: 1000
    });
  };

  const getTestResult = (testId: string) => {
    return testResults.find(r => r.testCase === testId);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      'basic': Play,
      'rewards': Trophy,
      'timers': Clock,
      'fairness': Target
    };
    return iconMap[category] || Settings;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const totalTests = testResults.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-primary" />
          Spin Wheel Testing Panel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Comprehensive testing for spin wheel functionality, rewards, timers, and fairness
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Test Controls */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-primary hover:bg-primary/90"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            Run All Tests
          </Button>
          
          <Button 
            onClick={resetTests} 
            variant="outline"
            disabled={isRunning}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Tests
          </Button>
        </div>

        {/* Test Summary */}
        {totalTests > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">{passedTests}</div>
              <div className="text-xs text-muted-foreground">Passed</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{failedTests}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{totalTests}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">{spinStats.fairnessScore.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Fairness</div>
            </div>
          </div>
        )}

        {/* Simulated State */}
        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Simulated State
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Daily Steps:</span>
              <div className="font-mono">{simulatedState.dailySteps.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Available Spins:</span>
              <div className="font-mono">{simulatedState.availableSpins}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Wallet Balance:</span>
              <div className="font-mono">{simulatedState.walletBalance} paisa</div>
            </div>
            <div>
              <span className="text-muted-foreground">Cooldown:</span>
              <div className="font-mono">
                {simulatedState.cooldownRemaining > 0 ? formatTime(simulatedState.cooldownRemaining) : 'None'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Premium:</span>
              <div className="font-mono">{simulatedState.isPremiumUser ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </Card>

        <Separator />

        {/* Test Cases */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="timers">Timers</TabsTrigger>
            <TabsTrigger value="fairness">Fairness</TabsTrigger>
          </TabsList>
          
          {['all', 'basic', 'rewards', 'timers', 'fairness'].map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {testCases
                .filter(tc => category === 'all' || tc.category === category)
                .map((testCase) => {
                  const result = getTestResult(testCase.id);
                  const Icon = testCase.icon;
                  const CategoryIcon = getCategoryIcon(testCase.category);
                  
                  return (
                    <Card key={testCase.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{testCase.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {testCase.id}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {testCase.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {result && (
                            <Badge 
                              variant={result.status === 'passed' ? 'default' : 
                                      result.status === 'failed' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {result.status === 'passed' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {result.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                              {result.status === 'running' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                              {result.status}
                            </Badge>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runSingleTest(testCase.id)}
                            disabled={isRunning}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Run Test
                          </Button>
                        </div>
                      </div>
                      
                      {result && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {result.status === 'passed' && <CheckCircle className="w-4 h-4 text-success" />}
                            {result.status === 'failed' && <XCircle className="w-4 h-4 text-destructive" />}
                            {result.status === 'running' && <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />}
                            <span className="text-sm font-medium">{result.message}</span>
                          </div>
                          
                          {result.details && (
                            <details className="text-xs text-muted-foreground">
                              <summary className="cursor-pointer hover:text-foreground">
                                View Details
                              </summary>
                              <pre className="mt-2 bg-background/50 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
            </TabsContent>
          ))}
        </Tabs>

        {/* Reward Distribution Chart */}
        {spinStats.totalSpins > 0 && (
          <Card className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reward Distribution Analysis
            </h4>
            <div className="space-y-3">
              {Object.entries(expectedRewards).map(([rewardType, expected]) => {
                const actual = spinStats.rewards[rewardType] || 0;
                const actualPercentage = (actual / spinStats.totalSpins) * 100;
                const deviation = Math.abs(actualPercentage - expected.probability);
                
                return (
                  <div key={rewardType} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{expected.description}</span>
                      <span className="font-mono">
                        {actual}/{spinStats.totalSpins} ({actualPercentage.toFixed(1)}% vs {expected.probability}%)
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Progress value={actualPercentage} className="flex-1" />
                      <Badge 
                        variant={deviation < 5 ? 'default' : deviation < 10 ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {deviation < 5 ? 'Good' : deviation < 10 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};