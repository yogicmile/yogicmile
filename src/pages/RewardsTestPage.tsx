import React from 'react';
import { ArrowLeft, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RewardsTestPanel } from '@/components/RewardsTestPanel';
import { useNavigate } from 'react-router-dom';

export const RewardsTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <TestTube className="w-5 h-5 text-tier-1-paisa" />
                Rewards Testing
              </h1>
              <p className="text-sm text-muted-foreground">
                Validate rewards catalog and redemption system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {/* Test Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Redemption Scenarios</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• ₹100 Amazon voucher = 10,000 paisa</li>
                  <li>• ₹500 Flipkart voucher = 50,000 paisa</li>
                  <li>• ₹1000 bill payment = 100,000 paisa</li>
                  <li>• Local restaurant coupon = 5,000 paisa</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Validation Tests</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Catalog display with prices</li>
                  <li>• Successful redemption flow</li>
                  <li>• Unique voucher code generation</li>
                  <li>• Redemption history tracking</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Error Handling</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Insufficient balance blocks</li>
                  <li>• Expired voucher rejection</li>
                  <li>• Out of stock handling</li>
                  <li>• Stock conflict resolution</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Panel */}
        <RewardsTestPanel />
      </div>
    </div>
  );
};