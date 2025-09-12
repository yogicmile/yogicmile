import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpinReward {
  type: string;
  amount: number;
  description: string;
  probability: number;
  color: string;
}

const spinRewards: SpinReward[] = [
  { type: 'paisa', amount: 10, description: '+10 paisa', probability: 30, color: 'hsl(var(--tier-1-paisa))' },
  { type: 'paisa', amount: 25, description: '+25 paisa', probability: 25, color: 'hsl(var(--tier-2-coin))' },
  { type: 'paisa', amount: 50, description: '+50 paisa', probability: 20, color: 'hsl(var(--tier-3-token))' },
  { type: 'paisa', amount: 100, description: '+100 paisa', probability: 10, color: 'hsl(var(--tier-4-gem))' },
  { type: 'phase_bonus', amount: 100, description: '+100 steps to phase', probability: 5, color: 'hsl(var(--tier-5-diamond))' },
  { type: 'double_coins', amount: 100, description: 'Double next 100 steps', probability: 5, color: 'hsl(var(--tier-6-crown))' },
  { type: 'try_again', amount: 0, description: 'Try Again', probability: 3, color: 'hsl(var(--muted))' },
  { type: 'better_luck', amount: 0, description: 'Better Luck Tomorrow', probability: 2, color: 'hsl(var(--muted-foreground))' },
];

interface SpinWheelProps {
  dailySteps: number;
  canSpin: boolean;
  onSpinComplete: (reward: SpinReward) => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ dailySteps, canSpin, onSpinComplete }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<SpinReward | null>(null);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  const getRandomReward = useCallback(() => {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const reward of spinRewards) {
      cumulative += reward.probability;
      if (random <= cumulative) {
        return reward;
      }
    }
    
    return spinRewards[0]; // Fallback
  }, []);

  const handleSpin = async () => {
    if (!canSpin || isSpinning || dailySteps < 5000) return;

    if (isGuest) {
      toast({
        title: "Sign up required",
        description: "Create an account to use the spin wheel!",
        variant: "destructive",
      });
      return;
    }

    setIsSpinning(true);
    
    const reward = getRandomReward();
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const finalRotation = rotation + (spins * 360) + (Math.random() * 360);
    
    setRotation(finalRotation);
    
    // Simulate spin duration
    setTimeout(async () => {
      setIsSpinning(false);
      setLastResult(reward);
      
      if (user) {
        try {
          // Save spin result to database
          const today = new Date().toISOString().split('T')[0];
          await supabase.from('spin_results').insert({
            user_id: user.id,
            date: today,
            reward_type: reward.type,
            reward_amount: reward.amount,
            reward_description: reward.description,
          });

          // Apply reward if applicable
          if (reward.type === 'paisa' && reward.amount > 0) {
            await supabase.from('transactions').insert({
              user_id: user.id,
              type: 'spin_wheel',
              amount: reward.amount,
              description: `Spin wheel bonus: ${reward.description}`,
            });

            // Update wallet balance
            const { data: currentBalance } = await supabase
              .from('wallet_balances')
              .select('total_balance, total_earned')
              .eq('user_id', user.id)
              .single();

            if (currentBalance) {
              await supabase.from('wallet_balances')
                .update({ 
                  total_balance: currentBalance.total_balance + reward.amount,
                  total_earned: currentBalance.total_earned + reward.amount,
                  last_updated: new Date().toISOString()
                })
                .eq('user_id', user.id);
            }
          }

          toast({
            title: "Spin complete!",
            description: `You won: ${reward.description}`,
            variant: reward.amount > 0 ? "default" : "destructive",
          });
        } catch (error) {
          console.error('Error saving spin result:', error);
        }
      }
      
      onSpinComplete(reward);
    }, 3000);
  };

  const canSpinToday = canSpin && dailySteps >= 5000;

  return (
    <Card className="p-6">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold mb-2">🎡 Daily Spin Wheel</h3>
        <p className="text-sm text-muted-foreground">
          Walk 5,000+ steps to unlock your daily spin!
        </p>
      </div>

      {/* Requirements Badge */}
      <div className="flex justify-center mb-4">
        <Badge variant={canSpinToday ? "default" : "secondary"}>
          {dailySteps >= 5000 ? `✅ ${dailySteps.toLocaleString()} steps` : `${dailySteps.toLocaleString()}/5,000 steps`}
        </Badge>
      </div>

      {/* Spin Wheel Visualization */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <div 
          className="w-full h-full rounded-full border-8 border-primary relative overflow-hidden transition-transform duration-3000 ease-out"
          style={{ 
            transform: `rotate(${rotation}deg)`,
            background: `conic-gradient(
              ${spinRewards.map((reward, index) => {
                const startAngle = (index * 360) / spinRewards.length;
                const endAngle = ((index + 1) * 360) / spinRewards.length;
                return `${reward.color} ${startAngle}deg ${endAngle}deg`;
              }).join(', ')}
            )`
          }}
        >
          {/* Wheel segments with text */}
          {spinRewards.map((reward, index) => {
            const angle = (360 / spinRewards.length) * index;
            return (
              <div
                key={index}
                className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white"
                style={{
                  transform: `rotate(${angle + 22.5}deg)`,
                  transformOrigin: 'center',
                }}
              >
                <span className="transform -rotate-90">{reward.description}</span>
              </div>
            );
          })}
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              disabled={!canSpinToday || isSpinning || isGuest}
              className="px-8 py-3 text-lg font-bold"
              size="lg"
            >
              {isSpinning ? '🎰 Spinning...' : 
               isGuest ? '🔒 Sign up to spin' :
               !canSpinToday ? '🚶‍♀️ Walk more to unlock' : 
               '🎰 Spin Now!'}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle>Daily Spin Wheel</DialogTitle>
            </DialogHeader>
            
            <div className="p-6">
              <p className="mb-4">Ready to spin for your daily bonus?</p>
              <Button 
                onClick={handleSpin}
                disabled={isSpinning}
                className="w-full"
                size="lg"
              >
                {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="mt-4 p-3 bg-success/10 rounded-lg text-center">
          <p className="text-sm font-medium">
            🎉 Last spin: {lastResult.description}
          </p>
        </div>
      )}

      {/* Guest Mode Message */}
      {isGuest && (
        <div className="mt-4 p-3 bg-warning/10 rounded-lg text-center">
          <p className="text-sm text-warning-foreground">
            🎯 Sign up to unlock the spin wheel and save your rewards!
          </p>
        </div>
      )}
    </Card>
  );
};