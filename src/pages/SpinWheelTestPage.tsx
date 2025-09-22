import React from 'react';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpinWheelTestPanel } from '@/components/SpinWheelTestPanel';
import { useNavigate } from 'react-router-dom';

export const SpinWheelTestPage = () => {
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
                <RotateCw className="w-5 h-5 text-primary" />
                Spin Wheel Testing
              </h1>
              <p className="text-sm text-muted-foreground">
                Validate wheel mechanics, rewards, timers, and fairness
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Basic Functionality</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Spin availability check</li>
                  <li>• Spin execution & animation</li>
                  <li>• User interface responsiveness</li>
                  <li>• Accessibility compliance</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Reward System</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Coin rewards (10, 25, 50, 100 paisa)</li>
                  <li>• Bonus spin rewards</li>
                  <li>• Immediate wallet updates</li>
                  <li>• Reward persistence</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Timer System</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 24-hour cooldown periods</li>
                  <li>• Countdown timer accuracy</li>
                  <li>• Premium user bonuses</li>
                  <li>• Timezone handling</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Fairness Tests</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Probability distribution</li>
                  <li>• Anti-manipulation measures</li>
                  <li>• Rapid attempt handling</li>
                  <li>• Statistical validation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reward Probabilities */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Expected Reward Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-tier-1-paisa/10 rounded-lg">
                <div className="text-2xl font-bold text-tier-1-paisa">30%</div>
                <div className="text-sm">10 paisa</div>
              </div>
              <div className="text-center p-4 bg-tier-2-rupaya/10 rounded-lg">
                <div className="text-2xl font-bold text-tier-2-rupaya">25%</div>
                <div className="text-sm">25 paisa</div>
              </div>
              <div className="text-center p-4 bg-tier-3-token/10 rounded-lg">
                <div className="text-2xl font-bold text-tier-3-token">20%</div>
                <div className="text-sm">50 paisa</div>
              </div>
              <div className="text-center p-4 bg-tier-4-gem/10 rounded-lg">
                <div className="text-2xl font-bold text-tier-4-gem">15%</div>
                <div className="text-sm">100 paisa</div>
              </div>
              <div className="text-center p-4 bg-tier-5-diamond/10 rounded-lg">
                <div className="text-2xl font-bold text-tier-5-diamond">10%</div>
                <div className="text-sm">Bonus Spin</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Panel */}
        <SpinWheelTestPanel />
      </div>
    </div>
  );
};