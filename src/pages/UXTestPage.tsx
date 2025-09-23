import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { UXTestResults } from '@/components/UXTestResults';
import { 
  Play, 
  TestTube, 
  Users, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UXTestPage() {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [testResults, setTestResults] = useState({
    onboarding: 'pending',
    dailyFlow: 'pending',
    discovery: 'pending', 
    errorRecovery: 'pending'
  });

  const runTest = async (testType: string) => {
    setTestResults(prev => ({ ...prev, [testType]: 'running' }));
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results based on our analysis
    const results: Record<string, string> = {
      onboarding: 'warning', // Missing components
      dailyFlow: 'passed',   // Working well
      discovery: 'warning',  // Needs improvement
      errorRecovery: 'passed' // Good error handling
    };
    
    setTestResults(prev => ({ ...prev, [testType]: results[testType] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />;
      default:
        return <TestTube className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const testSuites = [
    {
      id: 'onboarding',
      name: 'Onboarding Flow (TC119)',
      description: 'New user registration to first use',
      workflow: [
        'Welcome screen value proposition',
        'Mobile number registration',
        'Profile setup and photo upload',
        'Health permissions explanation',
        'First step tracking demo',
        'Wallet and earning tutorial',
        'Rewards catalog introduction',
        'Community features overview'
      ]
    },
    {
      id: 'dailyFlow',
      name: 'Daily Usage (TC120)',
      description: 'Regular daily activities workflow',
      workflow: [
        'Open app and view step progress',
        'Check wallet balance and earnings',
        'Browse rewards catalog',
        'Participate in challenges',
        'Interact with community features',
        'Share achievements socially'
      ]
    },
    {
      id: 'discovery',
      name: 'Feature Discovery (TC121)',
      description: 'Finding and using major features',
      workflow: [
        'Intuitive navigation design',
        'Feature tooltips and hints',
        'Progressive disclosure system',
        'Help documentation integration',
        'Tutorial videos and guides'
      ]
    },
    {
      id: 'errorRecovery',
      name: 'Error Recovery (TC122)',
      description: 'Error handling and recovery',
      workflow: [
        'Clear error messages with solutions',
        'Retry mechanisms for failures',
        'Alternative paths when blocked',
        'Support contact integration',
        'FAQ linking from error states'
      ]
    }
  ];

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TestTube className="h-6 w-6" />
                UX Testing & Workflow Optimization Suite
              </CardTitle>
              <p className="text-muted-foreground">
                Comprehensive user experience testing dashboard for Yogic Mile
              </p>
            </div>
            <Button onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tests">Test Execution</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="demo">Onboarding Demo</TabsTrigger>
        </TabsList>

        {/* Test Execution Tab */}
        <TabsContent value="tests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testSuites.map((suite) => (
              <Card key={suite.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResults[suite.id as keyof typeof testResults])}
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                    </div>
                    <Badge variant="outline">
                      {testResults[suite.id as keyof typeof testResults]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{suite.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Test Workflow:</h4>
                    <ul className="space-y-1">
                      {suite.workflow.map((step, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-blue-500" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => runTest(suite.id)}
                    disabled={testResults[suite.id as keyof typeof testResults] === 'running'}
                  >
                    {testResults[suite.id as keyof typeof testResults] === 'running' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Run Test
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Action Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => setShowOnboarding(true)}
                >
                  <Users className="h-6 w-6 mb-1" />
                  <span className="text-xs">Preview Onboarding</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/wallet')}
                >
                  <TrendingUp className="h-6 w-6 mb-1" />
                  <span className="text-xs">Test Daily Flow</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/help')}
                >
                  <Lightbulb className="h-6 w-6 mb-1" />
                  <span className="text-xs">Test Help System</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => runTest('errorRecovery')}
                >
                  <AlertTriangle className="h-6 w-6 mb-1" />
                  <span className="text-xs">Test Error Handling</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Results Tab */}
        <TabsContent value="results">
          <UXTestResults />
        </TabsContent>

        {/* Onboarding Demo Tab */}
        <TabsContent value="demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Onboarding Flow Preview
              </CardTitle>
              <p className="text-muted-foreground">
                Experience the complete new user onboarding journey
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-muted/50 p-8 rounded-lg">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">👟</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Ready to Experience the Journey?</h3>
                <p className="text-muted-foreground mb-4">
                  Click below to go through the complete onboarding flow that new users will experience.
                </p>
                <Button 
                  size="lg"
                  onClick={() => setShowOnboarding(true)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Onboarding Demo
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="bg-card p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">✨ What's Included</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Welcome & value proposition</li>
                    <li>• Profile setup guidance</li>
                    <li>• Health permissions tutorial</li>
                    <li>• First steps demonstration</li>
                  </ul>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">🎯 Key Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Wallet introduction</li>
                    <li>• Rewards catalog preview</li>
                    <li>• Community overview</li>
                    <li>• Progress tracking</li>
                  </ul>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">📱 Experience</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Step-by-step guidance</li>
                    <li>• Interactive components</li>
                    <li>• Progress indicators</li>
                    <li>• Skip options available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}