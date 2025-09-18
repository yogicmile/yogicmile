import { useState, useEffect } from 'react';
import { Play, RefreshCw, Trash2, CheckCircle, XCircle, Clock, Wallet, TrendingUp, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { walletTestingService, WalletTestResult, WalletBalance, WalletTransaction } from '@/services/WalletTestingService';
import { toast } from '@/hooks/use-toast';

export const WalletTestPanel = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<WalletTestResult[]>([]);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const testUserId = 'test-user-wallet-123';

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setTestResults(walletTestingService.getTestResults());
    setWalletBalance(walletTestingService.getWalletBalance(testUserId));
    setTransactions(walletTestingService.getTransactionHistory(testUserId));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      await walletTestingService.runAllTests(testUserId);
      refreshData();
      toast({
        title: "Wallet Tests Completed",
        description: "All wallet functionality tests have been executed",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to complete wallet tests",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTest = async (testType: string) => {
    setIsRunning(true);
    try {
      let result: WalletTestResult;
      
      switch (testType) {
        case 'TC028':
          result = await walletTestingService.testEarningsUpdate(testUserId, 5000, 2);
          break;
        case 'TC029':
          result = await walletTestingService.testTransactionHistory(testUserId);
          break;
        case 'TC030':
          result = await walletTestingService.testBalanceAccuracy(testUserId);
          break;
        case 'TC031':
          result = await walletTestingService.testBonusEarnings(testUserId, 'referral');
          break;
        case 'TC032':
          result = await walletTestingService.testBalanceManipulation(testUserId);
          break;
        case 'TC033':
          result = await walletTestingService.testInvalidTransactions(testUserId);
          break;
        case 'TC034':
          result = await walletTestingService.testConcurrentTransactions(testUserId);
          break;
        case 'TC035':
          result = await walletTestingService.testMidnightCalculations(testUserId);
          break;
        default:
          return;
      }

      refreshData();
      toast({
        title: result.passed ? "Test Passed" : "Test Failed",
        description: result.message,
        variant: result.passed ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Test Error",
        description: `Failed to run ${testType}`,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearTestData = () => {
    walletTestingService.clearTestData();
    refreshData();
    toast({
      title: "Data Cleared",
      description: "All test data has been cleared",
    });
  };

  const calculateTestStats = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;
    return { total, passed, failed, successRate: total > 0 ? (passed / total) * 100 : 0 };
  };

  const stats = calculateTestStats();

  const testCases = [
    { id: 'TC028', name: 'Earnings Update', description: 'Test wallet balance update from step earnings', icon: TrendingUp, color: 'text-green-500' },
    { id: 'TC029', name: 'Transaction History', description: 'Verify transaction history accuracy', icon: Clock, color: 'text-blue-500' },
    { id: 'TC030', name: 'Balance Accuracy', description: 'Check balance matches all transactions', icon: Wallet, color: 'text-purple-500' },
    { id: 'TC031', name: 'Bonus Earnings', description: 'Test referral/achievement bonus system', icon: Zap, color: 'text-yellow-500' },
    { id: 'TC032', name: 'Balance Security', description: 'Prevent direct balance manipulation', icon: Shield, color: 'text-red-500' },
    { id: 'TC033', name: 'Invalid Transactions', description: 'Block negative/invalid transactions', icon: XCircle, color: 'text-orange-500' },
    { id: 'TC034', name: 'Concurrent Transactions', description: 'Handle simultaneous operations', icon: RefreshCw, color: 'text-cyan-500' },
    { id: 'TC035', name: 'Midnight Calculations', description: 'Test day boundary calculations', icon: Clock, color: 'text-indigo-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-tier-1-paisa">Wallet System Testing</h1>
        <p className="text-muted-foreground">
          Comprehensive testing for wallet transactions, balance accuracy, and security
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-tier-1-paisa">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.passed}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{stats.passed}/{stats.total}</span>
              </div>
              <Progress value={stats.successRate} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Test Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-tier-1-paisa hover:bg-tier-1-paisa/80"
            >
              {isRunning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Run All Tests
            </Button>
            <Button variant="outline" onClick={refreshData} disabled={isRunning}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
            <Button variant="outline" onClick={clearTestData} disabled={isRunning}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="wallet">Wallet State</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((testCase) => {
              const result = testResults.find(r => r.testId === testCase.id);
              const Icon = testCase.icon;
              
              return (
                <Card key={testCase.id} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${testCase.color}`} />
                        {testCase.name}
                      </div>
                      {result && (
                        result.passed ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {testCase.description}
                    </p>
                    {result && (
                      <div className="space-y-2">
                        <Badge variant={result.passed ? "secondary" : "destructive"} className="text-xs">
                          {result.passed ? "✅ Passed" : "❌ Failed"}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {result.message}
                        </p>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-3"
                      onClick={() => runIndividualTest(testCase.id)}
                      disabled={isRunning}
                    >
                      Run {testCase.id}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {testResults.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No test results yet. Run some tests to see results here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{result.testId}</Badge>
                        <h4 className="font-medium">{result.testName}</h4>
                      </div>
                      {result.passed ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {result.message}
                    </p>
                    {result.expectedValue !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        Expected: {JSON.stringify(result.expectedValue)} | 
                        Actual: {JSON.stringify(result.actualValue)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      {result.timestamp.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Wallet State Tab */}
        <TabsContent value="wallet" className="space-y-4">
          {walletBalance ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Wallet State</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-lg font-bold text-tier-1-paisa">
                      {walletBalance.totalBalance} paisa
                    </div>
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                    <div className="text-xs text-muted-foreground">
                      (₹{(walletBalance.totalBalance / 100).toFixed(2)})
                    </div>
                  </div>
                  <div className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="text-lg font-bold text-success">
                      {walletBalance.totalEarned} paisa
                    </div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                    <div className="text-xs text-muted-foreground">
                      (₹{(walletBalance.totalEarned / 100).toFixed(2)})
                    </div>
                  </div>
                </div>
                <div className="text-center p-4 bg-secondary/30 rounded-lg">
                  <div className="text-lg font-bold text-muted-foreground">
                    {walletBalance.totalSpent} paisa
                  </div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                  <div className="text-xs text-muted-foreground">
                    (₹{(walletBalance.totalSpent / 100).toFixed(2)})
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Last Updated: {walletBalance.lastUpdated.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No wallet data available. Run some tests first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {transactions.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No transactions yet. Run wallet tests to generate transactions.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{transaction.description}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {transaction.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          transaction.amount > 0 ? 'text-success' : 'text-muted-foreground'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} paisa
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ₹{Math.abs(transaction.amount / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{transaction.timestamp.toLocaleString()}</span>
                      <Badge variant={transaction.status === 'completed' ? "secondary" : "destructive"}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};