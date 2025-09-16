import { useState, useEffect } from 'react';
import { Play, Clock, Zap, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BonusState {
  hasWatchedToday: boolean;
  todaysSteps: number;
  todaysEarnings: number; // in paisa
  nextResetTime: Date;
}

export const BonusRewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bonusState, setBonusState] = useState<BonusState>({
    hasWatchedToday: false,
    todaysSteps: 0,
    todaysEarnings: 0,
    nextResetTime: new Date()
  });
  const [showVideoAd, setShowVideoAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBonusState();
    }
  }, [user]);

  const fetchBonusState = async () => {
    if (!user) return;

    try {
      // Get today's steps and earnings
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysData } = await supabase
        .from('daily_steps')
        .select('steps, paisa_earned')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // Check if user has already watched video ad today
      const { data: bonusLog } = await supabase
        .from('bonus_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('bonus_type', 'daily_double')
        .eq('date_earned', today)
        .single();

      // Calculate next reset time (tomorrow at midnight)
      const nextReset = new Date();
      nextReset.setDate(nextReset.getDate() + 1);
      nextReset.setHours(0, 0, 0, 0);

      setBonusState({
        hasWatchedToday: !!bonusLog,
        todaysSteps: todaysData?.steps || 0,
        todaysEarnings: todaysData?.paisa_earned || 0,
        nextResetTime: nextReset
      });
    } catch (error) {
      console.error('Error fetching bonus state:', error);
    }
  };

  const startVideoAd = () => {
    if (bonusState.hasWatchedToday || bonusState.todaysEarnings === 0) return;
    
    setShowVideoAd(true);
    setIsWatching(true);
    setAdProgress(0);
    setCanSkip(false);

    // Simulate video ad progress
    const interval = setInterval(() => {
      setAdProgress(prev => {
        const newProgress = prev + (100 / 30); // 30 seconds total
        
        if (newProgress >= 17) { // Allow skip after 5 seconds (17% of 30 seconds)
          setCanSkip(true);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          completeVideoAd();
          return 100;
        }
        
        return newProgress;
      });
    }, 1000);
  };

  const skipAd = () => {
    if (!canSkip) return;
    completeVideoAd();
  };

  const completeVideoAd = async () => {
    setIsWatching(false);
    
    try {
      const doubleBonus = bonusState.todaysEarnings; // Double the earnings
      
      // Log the bonus
      const { error: bonusError } = await supabase
        .from('bonus_logs')
        .insert({
          user_id: user?.id,
          bonus_type: 'daily_double',
          amount_paisa: doubleBonus,
          description: `Video bonus: Double today's earnings (${bonusState.todaysSteps} steps)`
        });

      if (bonusError) throw bonusError;

      // Update wallet balance
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned')
        .eq('user_id', user?.id)
        .single();

      if (wallet) {
        await supabase
          .from('wallet_balances')
          .update({
            total_balance: wallet.total_balance + doubleBonus,
            total_earned: wallet.total_earned + doubleBonus,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', user?.id);
      }

      // Add transaction record
      await supabase.from('transactions').insert({
        user_id: user?.id,
        type: 'bonus',
        amount: doubleBonus,
        description: `Video bonus: Double today's paisa`,
        item_name: 'Daily Double Bonus'
      });

      setBonusState(prev => ({ ...prev, hasWatchedToday: true }));
      
      toast({
        title: "🎉 Double Bonus Earned!",
        description: `+₹${(doubleBonus / 100).toFixed(2)} added to your wallet!`,
      });

      setShowVideoAd(false);
    } catch (error) {
      console.error('Error completing video ad bonus:', error);
      toast({
        title: "Bonus failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const diff = bonusState.nextResetTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const canWatchAd = bonusState.todaysEarnings > 0 && !bonusState.hasWatchedToday;
  const doubleAmount = bonusState.todaysEarnings;

  return (
    <>
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="w-5 h-5 text-yellow-600" />
            Daily Double Bonus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bonusState.hasWatchedToday ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">✅</div>
              <div className="font-semibold text-green-700 mb-2">
                Bonus Already Claimed Today!
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Come back tomorrow for another double bonus
              </p>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Resets in {getTimeUntilReset()}
              </Badge>
            </div>
          ) : canWatchAd ? (
            <div className="text-center space-y-3">
              <div className="bg-white/50 rounded-lg p-3 mb-3">
                <div className="text-sm text-muted-foreground">Today's Earnings:</div>
                <div className="text-xl font-bold text-primary">
                  {bonusState.todaysSteps.toLocaleString()} steps = {bonusState.todaysEarnings} paisa
                </div>
                <div className="text-sm text-yellow-700">
                  Video bonus: <strong>{doubleAmount} paisa (₹{(doubleAmount/100).toFixed(2)})</strong>
                </div>
              </div>
              
              <Button 
                onClick={startVideoAd}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Video → Double Today's Paisa!
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Watch a 30-second ad to double your daily earnings (limit once per day)
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">👣</div>
              <div className="font-semibold text-muted-foreground mb-2">
                Start Walking to Unlock Bonus
              </div>
              <p className="text-sm text-muted-foreground">
                Earn paisa by walking, then watch a video to double your earnings!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Ad Modal */}
      <Dialog open={showVideoAd} onOpenChange={setShowVideoAd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isWatching ? "Video Ad Playing..." : "Thanks for Watching!"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {isWatching ? (
              <>
                <div className="bg-gray-900 rounded-lg p-8 text-center text-white">
                  <div className="text-6xl mb-4">🎥</div>
                  <div className="text-lg font-semibold mb-2">Advertisement</div>
                  <div className="text-sm opacity-80">
                    Sponsored Content Playing...
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(adProgress)}%</span>
                  </div>
                  <Progress value={adProgress} className="w-full" />
                </div>
                
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {Math.max(0, Math.round(30 - (adProgress * 30 / 100)))}s remaining
                  </div>
                  {canSkip && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={skipAd}
                    >
                      Skip Ad
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">🎉</div>
                <div className="text-xl font-bold text-green-600 mb-2">
                  Thanks for Watching!
                </div>
                <div className="text-lg mb-4">
                  +₹{(doubleAmount / 100).toFixed(2)} bonus earned
                </div>
                <Button 
                  onClick={() => setShowVideoAd(false)}
                  className="w-full"
                >
                  Claim Bonus
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};