import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SpinWheel } from '@/components/SpinWheel';
import { useToast } from '@/hooks/use-toast';
import { useFitnessData } from '@/hooks/use-fitness-data';

export const SpinWheelPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fitnessData = useFitnessData();
  const [canSpin, setCanSpin] = useState(true);
  
  // Mock daily steps - in real app this would come from user data
  const dailySteps = fitnessData.dailyProgress.currentSteps;

  const handleSpinComplete = (reward: any) => {
    setCanSpin(false);
    toast({
      title: "Congratulations! 🎉",
      description: `You won: ${reward.description}`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b px-4 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-surface/80"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎡</div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lucky Spin</h1>
              <p className="text-sm text-muted-foreground">Spin & Win Rewards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* How It Works */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            How Lucky Spin Works
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-tier-gold">•</span>
              <span>Complete your daily step goals to earn spins</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-tier-gold">•</span>
              <span>Win coins, bonus multipliers, or special rewards</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-tier-gold">•</span>
              <span>Each spin has different probabilities for various prizes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-tier-gold">•</span>
              <span>Get one free spin per day when you reach your step goal</span>
            </div>
          </div>
        </Card>

        {/* Current Status */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">📊</span>
            Today's Progress
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-tier-gold/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-tier-gold">{dailySteps.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Steps Today</div>
            </div>
            <div className="bg-tier-sage/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-tier-sage">{canSpin ? '1' : '0'}</div>
              <div className="text-xs text-muted-foreground">Spins Available</div>
            </div>
          </div>
        </Card>

        {/* Spin Wheel */}
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <SpinWheel 
              dailySteps={dailySteps}
              canSpin={canSpin}
              onSpinComplete={handleSpinComplete}
            />
          </div>
        </Card>

        {/* Recent Wins */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🏆</span>
            Recent Wins
          </h2>
          <div className="space-y-3">
            {[
              { prize: '+50 Coins', time: '2 hours ago', icon: '🪙' },
              { prize: '2x Multiplier', time: 'Yesterday', icon: '⚡' },
              { prize: '+25 Coins', time: '2 days ago', icon: '🪙' },
            ].map((win, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{win.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{win.prize}</div>
                    <div className="text-xs text-muted-foreground">{win.time}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-6 bg-gradient-to-r from-tier-gold/5 to-tier-sage/5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Pro Tips
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div>• Complete your daily steps early to unlock your spin</div>
            <div>• Higher step counts may unlock bonus spins in the future</div>
            <div>• Check back daily for your free spin opportunity</div>
          </div>
        </Card>
      </div>
    </div>
  );
};