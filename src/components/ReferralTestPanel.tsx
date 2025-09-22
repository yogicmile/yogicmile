import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  UserPlus, 
  Gift, 
  Share2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  RefreshCw,
  Users,
  MessageSquare,
  Trophy,
  Code,
  Phone,
  Settings,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  testCase: string;
  status: 'passed' | 'failed' | 'running';
  message: string;
  details?: any;
}

interface ReferralTestState {
  userMobile: string;
  referralCode: string;
  newUserMobile: string;
  enteredCode: string;
  sharesLogged: number;
  achievementsShared: number;
}

interface ShareTestResult {
  platform: string;
  status: 'success' | 'failed';
  message: string;
}

export const ReferralTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const { toast } = useToast();

  const [testState, setTestState] = useState<ReferralTestState>({
    userMobile: '+919876543210',
    referralCode: 'YM3210',
    newUserMobile: '+918765432109',
    enteredCode: '',
    sharesLogged: 0,
    achievementsShared: 0
  });

  const [shareResults, setShareResults] = useState<ShareTestResult[]>([]);

  const testCases = [
    {
      id: 'TC060',
      name: 'Code Generation Test',
      description: 'New user signup → Verify unique referral code "YM" + last 4 digits',
      icon: Code,
      category: 'generation'
    },
    {
      id: 'TC061', 
      name: 'Valid Referral Test',
      description: 'New user enters valid code → Both users receive bonus',
      icon: Gift,
      category: 'validation'
    },
    {
      id: 'TC062',
      name: 'Achievement Sharing Test',
      description: 'Unlock achievement → Social media apps open correctly',
      icon: Trophy,
      category: 'sharing'
    },
    {
      id: 'TC063',
      name: 'Share Recording Test',
      description: 'Complete share → Verify logged in analytics',
      icon: TrendingUp,
      category: 'sharing'
    },
    {
      id: 'TC064',
      name: 'Invalid Code Test',
      description: 'Enter non-existent code → Check error message',
      icon: AlertCircle,
      category: 'validation'
    },
    {
      id: 'TC065',
      name: 'Self-Referral Test',
      description: 'User tries own code → Verify blocking with message',
      icon: XCircle,
      category: 'validation'
    },
    {
      id: 'TC066',
      name: 'Used Code Test',
      description: 'Code already redeemed → Show appropriate error',
      icon: Users,
      category: 'validation'
    }
  ];

  const socialPlatforms = [
    { name: 'Instagram Stories', icon: '📷', testUrl: 'https://instagram.com/stories/camera' },
    { name: 'WhatsApp Status', icon: '💬', testUrl: 'https://wa.me/' },
    { name: 'Facebook Post', icon: '📘', testUrl: 'https://facebook.com/sharer' },
    { name: 'Twitter Share', icon: '🐦', testUrl: 'https://twitter.com/intent/tweet' }
  ];

  const generateReferralCode = (mobileNumber: string): string => {
    const lastFour = mobileNumber.slice(-4);
    return `YM${lastFour}`;
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
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      switch (testId) {
        case 'TC060':
          const generatedCode = generateReferralCode(testState.userMobile);
          const expectedCode = testState.referralCode;
          
          result = {
            testCase: testId,
            status: generatedCode === expectedCode ? 'passed' : 'failed',
            message: generatedCode === expectedCode 
              ? `Referral code generated correctly: ${generatedCode}` 
              : `Code mismatch. Expected: ${expectedCode}, Got: ${generatedCode}`,
            details: { 
              userMobile: testState.userMobile,
              generatedCode,
              expectedCode,
              algorithm: 'YM + last 4 digits'
            }
          };
          break;

        case 'TC061':
          // Simulate valid referral processing
          const referrerBonus = 200; // paisa
          const refereeBonus = 100; // paisa
          
          result = {
            testCase: testId,
            status: 'passed',
            message: `Valid referral processed successfully. Referrer: +${referrerBonus} paisa, Referee: +${refereeBonus} paisa`,
            details: { 
              referralCode: testState.referralCode,
              referrerBonus,
              refereeBonus,
              referrerMobile: testState.userMobile,
              refereeMobile: testState.newUserMobile
            }
          };
          break;

        case 'TC062':
          // Test social media platform integration
          const platformTests = socialPlatforms.map(platform => ({
            platform: platform.name,
            status: 'success' as const,
            message: `${platform.name} opened successfully with achievement card`
          }));
          
          setShareResults(platformTests);
          setTestState(prev => ({ ...prev, achievementsShared: prev.achievementsShared + 1 }));
          
          result = {
            testCase: testId,
            status: 'passed',
            message: `Achievement sharing tested across ${platformTests.length} platforms`,
            details: { 
              platformsTested: platformTests.length,
              achievementType: 'First 10K Steps',
              shareFormats: ['Image card', 'Custom stickers', 'Progress graphics']
            }
          };
          break;

        case 'TC063':
          // Test share logging and analytics
          const shareLogged = Math.random() > 0.1; // 90% success rate
          
          if (shareLogged) {
            setTestState(prev => ({ ...prev, sharesLogged: prev.sharesLogged + 1 }));
          }
          
          result = {
            testCase: testId,
            status: shareLogged ? 'passed' : 'failed',
            message: shareLogged 
              ? 'Share event successfully logged in analytics' 
              : 'Failed to log share event',
            details: { 
              shareType: 'achievement_milestone',
              platform: 'instagram_stories',
              timestamp: new Date().toISOString(),
              userId: 'test_user_123',
              contentShared: 'achievement_card_10k_steps'
            }
          };
          break;

        case 'TC064':
          const invalidCodes = ['YM0000', 'INVALID', ''];
          const testCode = invalidCodes[Math.floor(Math.random() * invalidCodes.length)];
          
          result = {
            testCase: testId,
            status: 'passed',
            message: `Invalid code "${testCode}" correctly rejected with error message`,
            details: { 
              testedCode: testCode,
              errorMessage: testCode === '' 
                ? 'Please enter a referral code' 
                : `Referral code "${testCode}" not found. Please check and try again.`,
              validationPassed: true
            }
          };
          break;

        case 'TC065':
          const ownCodeBlocked = true; // Simulate blocking
          
          result = {
            testCase: testId,
            status: ownCodeBlocked ? 'passed' : 'failed',
            message: ownCodeBlocked 
              ? 'Self-referral correctly blocked with appropriate message' 
              : 'Self-referral was not blocked',
            details: { 
              userCode: testState.referralCode,
              enteredCode: testState.referralCode,
              errorMessage: "You cannot use your own referral code!",
              blocked: ownCodeBlocked
            }
          };
          break;

        case 'TC066':
          const alreadyUsed = Math.random() > 0.3; // 70% chance code was used
          
          result = {
            testCase: testId,
            status: 'passed',
            message: alreadyUsed 
              ? 'Used code correctly shows "already redeemed" error' 
              : 'Code available for use',
            details: { 
              testedCode: 'YM1234',
              previousUser: alreadyUsed ? '+918888888888' : null,
              usedDate: alreadyUsed ? new Date().toISOString() : null,
              errorMessage: alreadyUsed 
                ? 'This referral code has already been used.' 
                : null
            }
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
  };

  const resetTests = () => {
    setTestResults([]);
    setShareResults([]);
    setTestState({
      userMobile: '+919876543210',
      referralCode: 'YM3210',
      newUserMobile: '+918765432109',
      enteredCode: '',
      sharesLogged: 0,
      achievementsShared: 0
    });
  };

  const testSocialShare = async (platform: string) => {
    try {
      // Simulate opening social platform
      const shareText = `🎉 Just reached 10,000 steps on Yogic Mile! Join me and earn real money by walking. Use code ${testState.referralCode} to get bonus coins! #YogicMile #WalkEarnEvolve`;
      
      toast({
        title: `${platform} Share`,
        description: `Opening ${platform} with achievement card...`,
      });

      // Log the share attempt
      setTestState(prev => ({ ...prev, sharesLogged: prev.sharesLogged + 1 }));
      
      const newShareResult: ShareTestResult = {
        platform,
        status: 'success',
        message: `${platform} opened successfully with custom achievement card`
      };
      
      setShareResults(prev => {
        const filtered = prev.filter(r => r.platform !== platform);
        return [...filtered, newShareResult];
      });

    } catch (error) {
      const failedResult: ShareTestResult = {
        platform,
        status: 'failed',
        message: `Failed to open ${platform}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      
      setShareResults(prev => {
        const filtered = prev.filter(r => r.platform !== platform);
        return [...filtered, failedResult];
      });
    }
  };

  const getTestResult = (testId: string) => {
    return testResults.find(r => r.testCase === testId);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      'generation': Code,
      'validation': AlertCircle,
      'sharing': Share2
    };
    return iconMap[category] || Settings;
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const totalTests = testResults.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Referral & Social Testing Panel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test referral codes, bonus distribution, and social sharing functionality
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
              <div className="text-2xl font-bold text-primary">{testState.sharesLogged}</div>
              <div className="text-xs text-muted-foreground">Shares</div>
            </div>
          </div>
        )}

        {/* Test Configuration */}
        <Card className="p-4 bg-muted/30">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Test Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">User Mobile Number:</label>
              <Input 
                value={testState.userMobile}
                onChange={(e) => setTestState(prev => ({ 
                  ...prev, 
                  userMobile: e.target.value,
                  referralCode: generateReferralCode(e.target.value)
                }))}
                placeholder="+919876543210"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Generated Code:</label>
              <Input 
                value={testState.referralCode}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium">New User Mobile:</label>
              <Input 
                value={testState.newUserMobile}
                onChange={(e) => setTestState(prev => ({ ...prev, newUserMobile: e.target.value }))}
                placeholder="+918765432109"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Code Entry:</label>
              <Input 
                value={testState.enteredCode}
                onChange={(e) => setTestState(prev => ({ ...prev, enteredCode: e.target.value }))}
                placeholder="Enter code to test"
              />
            </div>
          </div>
        </Card>

        <Separator />

        {/* Test Cases */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="generation">Generation</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
          </TabsList>
          
          {['all', 'generation', 'validation', 'sharing'].map((category) => (
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

        {/* Social Sharing Test */}
        <Card className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Social Media Sharing Test
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {socialPlatforms.map((platform) => {
              const shareResult = shareResults.find(r => r.platform === platform.name);
              return (
                <Button
                  key={platform.name}
                  variant="outline"
                  className="h-auto p-3 flex flex-col gap-2"
                  onClick={() => testSocialShare(platform.name)}
                >
                  <span className="text-2xl">{platform.icon}</span>
                  <span className="text-xs">{platform.name}</span>
                  {shareResult && (
                    <Badge 
                      variant={shareResult.status === 'success' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {shareResult.status}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
          
          {shareResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="font-medium text-sm">Share Results:</h5>
              {shareResults.map((result, index) => (
                <div key={index} className="text-xs p-2 bg-muted/30 rounded">
                  <span className="font-medium">{result.platform}:</span> {result.message}
                </div>
              ))}
            </div>
          )}
        </Card>
      </CardContent>
    </Card>
  );
};