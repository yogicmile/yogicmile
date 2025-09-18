import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Gift, 
  ShoppingCart, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  RotateCcw,
  Wallet,
  Package,
  History,
  AlertCircle
} from 'lucide-react';
import { rewardsTestingService, TestResult } from '@/services/RewardsTestingService';
import { useToast } from '@/hooks/use-toast';

export const RewardsTestPanel = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(75000);
  const { toast } = useToast();

  const testCases = [
    {
      id: 'TC036',
      name: 'Catalog Viewing',
      description: 'Test rewards catalog displays vouchers with prices',
      icon: <ShoppingCart className="w-4 h-4" />,
      category: 'catalog'
    },
    {
      id: 'TC037',
      name: 'Successful Redemption',
      description: 'User with ₹500 redeems ₹500 voucher successfully',
      icon: <CheckCircle className="w-4 h-4" />,
      category: 'redemption'
    },
    {
      id: 'TC038',
      name: 'Voucher Generation',
      description: 'Unique voucher code generated after redemption',
      icon: <Gift className="w-4 h-4" />,
      category: 'voucher'
    },
    {
      id: 'TC039',
      name: 'Redemption History',
      description: 'View history with all past redemptions listed',
      icon: <History className="w-4 h-4" />,
      category: 'history'
    },
    {
      id: 'TC040',
      name: 'Insufficient Balance',
      description: 'Block redemption when balance too low',
      icon: <Wallet className="w-4 h-4" />,
      category: 'validation'
    },
    {
      id: 'TC041',
      name: 'Expired Voucher',
      description: 'Block redemption of expired offers',
      icon: <Clock className="w-4 h-4" />,
      category: 'validation'
    },
    {
      id: 'TC042',
      name: 'Out of Stock',
      description: 'Handle unavailable voucher attempts',
      icon: <Package className="w-4 h-4" />,
      category: 'inventory'
    },
    {
      id: 'TC043',
      name: 'Minimum Balance',
      description: 'Redeem with exact minimum, confirm zero balance',
      icon: <CreditCard className="w-4 h-4" />,
      category: 'edge-case'
    },
    {
      id: 'TC044',
      name: 'Stock Conflicts',
      description: 'Multiple users redeem last item - only one succeeds',
      icon: <AlertTriangle className="w-4 h-4" />,
      category: 'concurrency'
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      toast({
        title: "🧪 Running Rewards Tests",
        description: "Testing all redemption scenarios...",
      });

      const results = await rewardsTestingService.runAllTests();
      setTestResults(results);

      const passCount = results.filter(r => r.status === 'PASS').length;
      const failCount = results.filter(r => r.status === 'FAIL').length;

      toast({
        title: "✅ Tests Complete",
        description: `${passCount} passed, ${failCount} failed`,
        variant: passCount === results.length ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "❌ Test Error",
        description: "Failed to run rewards tests",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async (testCase: string) => {
    setIsRunning(true);
    
    try {
      let result: TestResult;
      
      switch (testCase) {
        case 'TC036':
          result = await rewardsTestingService.testCatalogViewing();
          break;
        case 'TC037':
          result = await rewardsTestingService.testSuccessfulRedemption();
          break;
        case 'TC038':
          result = await rewardsTestingService.testVoucherGeneration();
          break;
        case 'TC039':
          result = await rewardsTestingService.testRedemptionHistory();
          break;
        case 'TC040':
          result = await rewardsTestingService.testInsufficientBalance();
          break;
        case 'TC041':
          result = await rewardsTestingService.testExpiredVoucher();
          break;
        case 'TC042':
          result = await rewardsTestingService.testOutOfStock();
          break;
        case 'TC043':
          result = await rewardsTestingService.testMinimumBalance();
          break;
        case 'TC044':
          result = await rewardsTestingService.testStockConflicts();
          break;
        default:
          return;
      }

      // Update or add the result
      setTestResults(prev => {
        const filtered = prev.filter(r => r.testCase !== testCase);
        return [...filtered, result];
      });

      toast({
        title: result.status === 'PASS' ? "✅ Test Passed" : "❌ Test Failed",
        description: result.message,
        variant: result.status === 'PASS' ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "❌ Test Error",
        description: `Failed to run ${testCase}`,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const resetTests = () => {
    rewardsTestingService.resetTestData();
    setTestResults([]);
    setWalletBalance(75000);
    toast({
      title: "🔄 Tests Reset",
      description: "All test data has been reset",
    });
  };

  const getTestResult = (testCase: string) => {
    return testResults.find(r => r.testCase === testCase);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'catalog': return <ShoppingCart className="w-4 h-4" />;
      case 'redemption': return <Gift className="w-4 h-4" />;
      case 'voucher': return <CreditCard className="w-4 h-4" />;
      case 'history': return <History className="w-4 h-4" />;
      case 'validation': return <AlertCircle className="w-4 h-4" />;
      case 'inventory': return <Package className="w-4 h-4" />;
      case 'edge-case': return <Wallet className="w-4 h-4" />;
      case 'concurrency': return <AlertTriangle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const renderTestDetails = (result: TestResult) => (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {result.status === 'PASS' ? 
            <CheckCircle className="w-4 h-4 text-success" /> : 
            <XCircle className="w-4 h-4 text-destructive" />
          }
          {result.testCase} - {result.message}
        </CardTitle>
      </CardHeader>
      {result.details && (
        <CardContent className="pt-0">
          <ScrollArea className="h-32">
            <pre className="text-xs bg-muted p-2 rounded overflow-auto">
              {JSON.stringify(result.details, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-tier-1-paisa" />
            Rewards System Testing Panel
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test rewards catalog, redemption flow, voucher generation, and error handling
          </p>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetTests}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Tests
            </Button>
          </div>
          
          {/* Test Summary */}
          {testResults.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-success">
                    {testResults.filter(r => r.status === 'PASS').length}
                  </div>
                  <div className="text-xs text-success">Passed</div>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold text-destructive">
                    {testResults.filter(r => r.status === 'FAIL').length}
                  </div>
                  <div className="text-xs text-destructive">Failed</div>
                </CardContent>
              </Card>
              <Card className="bg-muted">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-bold">{testResults.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Current Balance */}
          <Card className="bg-tier-1-paisa/10 border-tier-1-paisa/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-tier-1-paisa" />
                  <span className="text-sm font-medium">Test Wallet Balance</span>
                </div>
                <div className="text-lg font-bold text-tier-1-paisa">
                  ₹{(rewardsTestingService.getWalletBalance() / 100).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Test Cases */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="redemption">Redemption</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {testCases.map((testCase) => {
            const result = getTestResult(testCase.id);
            return (
              <Card key={testCase.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {testCase.icon}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {testCase.name}
                          <Badge variant="outline" className="text-xs">
                            {testCase.id}
                          </Badge>
                          {result && (
                            <Badge variant={result.status === 'PASS' ? 'default' : 'destructive'}>
                              {result.status}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testCase.description}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runSingleTest(testCase.id)}
                      disabled={isRunning}
                    >
                      Run Test
                    </Button>
                  </div>
                  
                  {result && renderTestDetails(result)}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          {testCases
            .filter(tc => ['catalog', 'inventory'].includes(tc.category))
            .map((testCase) => {
              const result = getTestResult(testCase.id);
              return (
                <Card key={testCase.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {testCase.icon}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {testCase.name}
                            <Badge variant="outline" className="text-xs">{testCase.id}</Badge>
                            {result && (
                              <Badge variant={result.status === 'PASS' ? 'default' : 'destructive'}>
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{testCase.description}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSingleTest(testCase.id)}
                        disabled={isRunning}
                      >
                        Run Test
                      </Button>
                    </div>
                    {result && renderTestDetails(result)}
                  </CardContent>
                </Card>
              );
            })
          }
        </TabsContent>

        <TabsContent value="redemption" className="space-y-4">
          {testCases
            .filter(tc => ['redemption', 'voucher', 'history'].includes(tc.category))
            .map((testCase) => {
              const result = getTestResult(testCase.id);
              return (
                <Card key={testCase.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {testCase.icon}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {testCase.name}
                            <Badge variant="outline" className="text-xs">{testCase.id}</Badge>
                            {result && (
                              <Badge variant={result.status === 'PASS' ? 'default' : 'destructive'}>
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{testCase.description}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSingleTest(testCase.id)}
                        disabled={isRunning}
                      >
                        Run Test
                      </Button>
                    </div>
                    {result && renderTestDetails(result)}
                  </CardContent>
                </Card>
              );
            })
          }
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          {testCases
            .filter(tc => ['validation', 'edge-case', 'concurrency'].includes(tc.category))
            .map((testCase) => {
              const result = getTestResult(testCase.id);
              return (
                <Card key={testCase.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                          {testCase.icon}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {testCase.name}
                            <Badge variant="outline" className="text-xs">{testCase.id}</Badge>
                            {result && (
                              <Badge variant={result.status === 'PASS' ? 'default' : 'destructive'}>
                                {result.status}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{testCase.description}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => runSingleTest(testCase.id)}
                        disabled={isRunning}
                      >
                        Run Test
                      </Button>
                    </div>
                    {result && renderTestDetails(result)}
                  </CardContent>
                </Card>
              );
            })
          }
        </TabsContent>
      </Tabs>
    </div>
  );
};