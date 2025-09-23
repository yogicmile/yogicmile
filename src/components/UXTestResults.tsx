import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Users, 
  Smartphone,
  TrendingUp,
  Target,
  Heart,
  MessageSquare,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestCase {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  description: string;
  issues?: string[];
  recommendations?: string[];
  score?: number;
}

interface UXTestResultsProps {
  className?: string;
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TC119',
    name: 'Onboarding Flow Test',
    status: 'warning',
    description: 'New user flow from registration to first use',
    score: 75,
    issues: [
      'Missing guided profile setup wizard',
      'No health permissions explanation',
      'First step tracking demo not implemented',
      'Tutorial overlay system needed'
    ],
    recommendations: [
      'Add step-by-step onboarding flow component',
      'Implement health permissions with privacy explanations',
      'Create interactive first-use tutorial',
      'Add progress indicators for setup completion'
    ]
  },
  {
    id: 'TC120',
    name: 'Daily Usage Workflow Test',
    status: 'passed',
    description: 'Regular daily activities and workflow completion',
    score: 90,
    issues: [
      'Minor loading states could be improved'
    ],
    recommendations: [
      'Add skeleton loading for better perceived performance',
      'Implement smart caching for frequent actions'
    ]
  },
  {
    id: 'TC121',
    name: 'Feature Discovery Test',
    status: 'warning',
    description: 'Finding and using all major features',
    score: 70,
    issues: [
      'No feature tooltips or hints system',
      'Advanced features not progressively disclosed',
      'Missing contextual help integration'
    ],
    recommendations: [
      'Add interactive feature tours',
      'Implement contextual tooltips',
      'Create in-app help documentation',
      'Add feature spotlight system for new capabilities'
    ]
  },
  {
    id: 'TC122',
    name: 'Error Recovery Test',
    status: 'passed',
    description: 'Error handling and recovery mechanisms',
    score: 85,
    issues: [
      'Some error messages could be more user-friendly'
    ],
    recommendations: [
      'Improve error message clarity',
      'Add more retry mechanisms',
      'Implement better offline handling'
    ]
  }
];

const WORKFLOW_TESTS = [
  {
    category: 'Onboarding Flow',
    tests: [
      { name: 'Welcome Screen Value Prop', status: 'passed', time: '2s' },
      { name: 'Mobile Registration', status: 'passed', time: '45s' },
      { name: 'Profile Setup Wizard', status: 'failed', time: 'N/A' },
      { name: 'Health Permissions', status: 'failed', time: 'N/A' },
      { name: 'First Step Demo', status: 'failed', time: 'N/A' },
      { name: 'Wallet Introduction', status: 'warning', time: '15s' },
      { name: 'Rewards Overview', status: 'passed', time: '10s' },
      { name: 'Community Introduction', status: 'warning', time: '8s' }
    ]
  },
  {
    category: 'Daily Workflow',
    tests: [
      { name: 'Open App & View Progress', status: 'passed', time: '1s' },
      { name: 'Check Wallet Balance', status: 'passed', time: '2s' },
      { name: 'Browse Rewards Catalog', status: 'passed', time: '5s' },
      { name: 'Join Challenges', status: 'passed', time: '8s' },
      { name: 'Community Interaction', status: 'passed', time: '3s' },
      { name: 'Share Achievement', status: 'passed', time: '4s' }
    ]
  },
  {
    category: 'Feature Discovery',
    tests: [
      { name: 'Navigation Intuitiveness', status: 'passed', time: '3s' },
      { name: 'Feature Tooltips', status: 'failed', time: 'N/A' },
      { name: 'Help Documentation', status: 'warning', time: '12s' },
      { name: 'Tutorial System', status: 'failed', time: 'N/A' },
      { name: 'Progressive Disclosure', status: 'warning', time: '8s' }
    ]
  },
  {
    category: 'Error Recovery',
    tests: [
      { name: 'Network Error Handling', status: 'passed', time: '2s' },
      { name: 'Retry Mechanisms', status: 'passed', time: '1s' },
      { name: 'Offline Support', status: 'passed', time: '1s' },
      { name: 'Error Message Clarity', status: 'warning', time: '3s' },
      { name: 'Alternative Paths', status: 'passed', time: '5s' }
    ]
  }
];

export const UXTestResults: React.FC<UXTestResultsProps> = ({ className }) => {
  const [selectedTest, setSelectedTest] = useState<string>('TC119');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const overallScore = Math.round(
    TEST_CASES.reduce((sum, test) => sum + (test.score || 0), 0) / TEST_CASES.length
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                UX Test Results & Workflow Analysis
              </CardTitle>
              <p className="text-muted-foreground">
                Comprehensive user experience testing and optimization recommendations
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{overallScore}%</div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Tests</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="recommendations">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEST_CASES.map((test) => (
              <Card 
                key={test.id}
                className={cn("cursor-pointer transition-colors", getStatusColor(test.status))}
                onClick={() => setSelectedTest(test.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{test.id}</Badge>
                    {getStatusIcon(test.status)}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{test.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{test.description}</p>
                  {test.score && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Score</span>
                        <span className="font-semibold">{test.score}%</span>
                      </div>
                      <Progress value={test.score} className="h-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">2</div>
                <p className="text-sm text-muted-foreground">Tests Passed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">2</div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">85%</div>
                <p className="text-sm text-muted-foreground">User Satisfaction</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">Improvements</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Tests Tab */}
        <TabsContent value="detailed" className="space-y-4">
          {TEST_CASES.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                  </div>
                  <Badge variant={test.status === 'passed' ? 'default' : 'destructive'}>
                    {test.id}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {test.score && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Test Score</span>
                      <span className="font-semibold">{test.score}%</span>
                    </div>
                    <Progress value={test.score} />
                  </div>
                )}

                {test.issues && test.issues.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Issues Found
                    </h4>
                    <ul className="space-y-1">
                      {test.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {test.recommendations && test.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {test.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-4">
          {WORKFLOW_TESTS.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.tests.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <span className="text-sm font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{test.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Priority Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xs font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Implement Onboarding Flow</h4>
                    <p className="text-xs text-muted-foreground">
                      Create guided setup wizard with health permissions and first-use tutorial
                    </p>
                    <Button size="sm" className="mt-2">
                      Create Onboarding Component
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-yellow-600 text-xs font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Add Feature Discovery</h4>
                    <p className="text-xs text-muted-foreground">
                      Implement tooltips, feature tours, and contextual help system
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Add Help System
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Enhance Error Messages</h4>
                    <p className="text-xs text-muted-foreground">
                      Improve error message clarity and add more recovery options
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      Update Error Handling
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};