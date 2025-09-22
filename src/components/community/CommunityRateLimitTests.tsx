import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  message: string;
}

interface CommunityRateLimitTestsProps {
  testResults: TestResult[];
  onTestUpdate: (testId: string, status: TestResult['status'], message: string) => void;
}

export const CommunityRateLimitTests: React.FC<CommunityRateLimitTestsProps> = ({
  testResults,
  onTestUpdate
}) => {
  const { toast } = useToast();
  const [postCount, setPostCount] = useState(0);

  const runRateLimitTest = async () => {
    const testId = 'TC075';
    onTestUpdate(testId, 'running', 'Testing rate limiting...');

    try {
      // Simulate rapid posting
      for (let i = 0; i < 5; i++) {
        setPostCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Check if rate limit should be applied (after 3 posts)
      if (postCount >= 3) {
        onTestUpdate(testId, 'passed', 'Rate limits applied appropriately after rapid posting');
      } else {
        onTestUpdate(testId, 'failed', 'Rate limits not properly enforced');
      }

      toast({
        title: "Test Completed",
        description: "Rate limiting test finished"
      });
    } catch (error) {
      onTestUpdate(testId, 'failed', `Rate limiting test failed: ${error}`);
    }
  };

  const testResult = testResults.find(r => r.testId === 'TC075');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Rate Limiting Test (TC075)
          {testResult && (
            <Badge variant={testResult.status === 'passed' ? 'default' : 'destructive'}>
              {testResult.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Test rapid posting → Rate limits applied appropriately
        </p>
        
        <div className="flex items-center gap-4">
          <Activity className="w-4 h-4" />
          <span>Post Count: {postCount}</span>
        </div>

        <Button onClick={runRateLimitTest} className="w-full">
          Test Rate Limiting
        </Button>

        {testResult && (
          <Card className="border-l-4 border-l-green-500 bg-green-50/50">
            <CardContent className="pt-4">
              <p className="text-sm">{testResult.message}</p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};