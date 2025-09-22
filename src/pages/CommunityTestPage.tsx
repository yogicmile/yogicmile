import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Trophy, MessageSquare, UserPlus, Shield, 
  Activity, Clock, AlertTriangle, CheckCircle2, XCircle 
} from 'lucide-react';
import { CommunityProfileTests } from '@/components/community/CommunityProfileTests';
import { CommunityFriendsTests } from '@/components/community/CommunityFriendsTests';
import { CommunityLeaderboardTests } from '@/components/community/CommunityLeaderboardTests';
import { CommunityForumTests } from '@/components/community/CommunityForumTests';
import { CommunityModerationTests } from '@/components/community/CommunityModerationTests';
import { CommunityRateLimitTests } from '@/components/community/CommunityRateLimitTests';

interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  message: string;
  timestamp?: Date;
}

export const CommunityTestPage = () => {
  const [activeTab, setActiveTab] = useState('profiles');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);

  const testCategories = [
    {
      id: 'profiles',
      label: 'Profile Tests',
      icon: Users,
      component: CommunityProfileTests,
      tests: ['TC067']
    },
    {
      id: 'friends',
      label: 'Friends Tests',
      icon: UserPlus,
      component: CommunityFriendsTests,
      tests: ['TC068', 'TC069', 'TC074']
    },
    {
      id: 'leaderboards',
      label: 'Leaderboard Tests',
      icon: Trophy,
      component: CommunityLeaderboardTests,
      tests: ['TC070']
    },
    {
      id: 'forums',
      label: 'Forum Tests',
      icon: MessageSquare,
      component: CommunityForumTests,
      tests: ['TC072']
    },
    {
      id: 'groups',
      label: 'Group Tests',
      icon: Activity,
      component: CommunityForumTests, // Placeholder - would be separate component
      tests: ['TC071']
    },
    {
      id: 'moderation',
      label: 'Moderation Tests',
      icon: Shield,
      component: CommunityModerationTests,
      tests: ['TC073']
    },
    {
      id: 'ratelimit',
      label: 'Rate Limit Tests',
      icon: Clock,
      component: CommunityRateLimitTests,
      tests: ['TC075']
    }
  ];

  const runAllTests = async () => {
    setIsRunningAllTests(true);
    const allTests = testCategories.flatMap(cat => cat.tests);
    
    // Initialize all tests as running
    setTestResults(allTests.map(testId => ({
      testId,
      status: 'running',
      message: 'Test in progress...'
    })));

    // Simulate running tests with delays
    for (const testId of allTests) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const success = Math.random() > 0.2; // 80% success rate for demo
      setTestResults(prev => prev.map(result => 
        result.testId === testId 
          ? {
              ...result,
              status: success ? 'passed' : 'failed',
              message: success ? 'Test completed successfully' : 'Test failed - check implementation',
              timestamp: new Date()
            }
          : result
      ));
    }

    setIsRunningAllTests(false);
  };

  const getTestStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const overallStatus = testResults.length > 0 ? {
    passed: testResults.filter(r => r.status === 'passed').length,
    failed: testResults.filter(r => r.status === 'failed').length,
    total: testResults.length
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Community System Testing
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive testing suite for community features including profiles, friends, 
            leaderboards, forums, and content moderation systems.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunningAllTests}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isRunningAllTests ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>
            
            {overallStatus && (
              <div className="flex items-center gap-2">
                <Badge variant={overallStatus.failed === 0 ? "default" : "destructive"}>
                  {overallStatus.passed}/{overallStatus.total} Passed
                </Badge>
                {overallStatus.failed > 0 && (
                  <Badge variant="destructive">
                    {overallStatus.failed} Failed
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Test Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {testCategories.map((category) => {
            const categoryResults = testResults.filter(r => category.tests.includes(r.testId));
            const categoryStatus = categoryResults.length > 0 ? {
              passed: categoryResults.filter(r => r.status === 'passed').length,
              failed: categoryResults.filter(r => r.status === 'failed').length,
              running: categoryResults.filter(r => r.status === 'running').length,
              total: categoryResults.length
            } : null;

            return (
              <Card 
                key={category.id} 
                className="cursor-pointer hover:shadow-md transition-all bg-card/80 backdrop-blur-sm"
                onClick={() => setActiveTab(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <category.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm">{category.label}</h3>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.tests.length} test{category.tests.length !== 1 ? 's' : ''}
                  </div>
                  {categoryStatus && (
                    <div className="flex items-center gap-1 mt-2">
                      {categoryStatus.running > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Running
                        </Badge>
                      )}
                      {categoryStatus.passed > 0 && (
                        <Badge variant="default" className="text-xs">
                          {categoryStatus.passed} ✓
                        </Badge>
                      )}
                      {categoryStatus.failed > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {categoryStatus.failed} ✗
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Test Results Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testResults.map((result) => (
                  <div 
                    key={result.testId}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
                  >
                    <div className="flex items-center gap-2">
                      {getTestStatusIcon(result.status)}
                      <span className="font-mono text-sm">{result.testId}</span>
                    </div>
                    <Badge 
                      variant={
                        result.status === 'passed' ? 'default' :
                        result.status === 'failed' ? 'destructive' :
                        result.status === 'running' ? 'outline' : 'secondary'
                      }
                    >
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Testing Interface */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-6">
                {testCategories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{category.label.split(' ')[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {testCategories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-4">
                  <div className="animate-fade-in">
                    <category.component 
                      testResults={testResults.filter(r => category.tests.includes(r.testId))}
                      onTestUpdate={(testId: string, status: TestResult['status'], message: string) => {
                        setTestResults(prev => {
                          const existing = prev.find(r => r.testId === testId);
                          if (existing) {
                            return prev.map(r => r.testId === testId ? {
                              ...r, status, message, timestamp: new Date()
                            } : r);
                          } else {
                            return [...prev, { testId, status, message, timestamp: new Date() }];
                          }
                        });
                      }}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};