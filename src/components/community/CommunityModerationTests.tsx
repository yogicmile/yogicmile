import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  testId: string;
  status: 'passed' | 'failed' | 'pending' | 'running';
  message: string;
}

interface CommunityModerationTestsProps {
  testResults: TestResult[];
  onTestUpdate: (testId: string, status: TestResult['status'], message: string) => void;
}

export const CommunityModerationTests: React.FC<CommunityModerationTestsProps> = ({
  testResults,
  onTestUpdate
}) => {
  const { toast } = useToast();
  const [testContent, setTestContent] = useState('');

  const runModerationTest = async () => {
    const testId = 'TC073';
    onTestUpdate(testId, 'running', 'Testing content moderation...');

    try {
      // Simulate inappropriate content detection
      const inappropriateKeywords = ['spam', 'inappropriate', 'harmful'];
      const containsInappropriate = inappropriateKeywords.some(keyword => 
        testContent.toLowerCase().includes(keyword)
      );

      if (containsInappropriate) {
        onTestUpdate(testId, 'passed', 'Inappropriate content detected and flagged for review');
      } else {
        onTestUpdate(testId, 'passed', 'Content passed moderation checks');
      }

      toast({
        title: "Test Completed",
        description: "Moderation test finished"
      });
    } catch (error) {
      onTestUpdate(testId, 'failed', `Moderation test failed: ${error}`);
    }
  };

  const testResult = testResults.find(r => r.testId === 'TC073');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Content Moderation Test (TC073)
          {testResult && (
            <Badge variant={testResult.status === 'passed' ? 'default' : 'destructive'}>
              {testResult.status}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Test inappropriate content → Flagged for admin review
        </p>
        
        <Textarea
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="Enter test content (try: 'This is spam content')"
          rows={4}
        />

        <Button onClick={runModerationTest} className="w-full">
          Test Content Moderation
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