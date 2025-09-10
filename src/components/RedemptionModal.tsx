import { useState, useEffect } from 'react';
import { X, Gift, Clock, CheckCircle, AlertCircle, Wifi, Share2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCountdownTimer } from '@/hooks/use-countdown-timer';
import { useHapticFeedback } from '@/hooks/use-animations';
import { cn } from '@/lib/utils';

interface RedemptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedeem: () => Promise<boolean>;
  coinBalance: number;
  todaysCoins: number;
  todaysSteps: number;
  rewardAmount?: number;
}

type ModalState = 'redeem' | 'loading' | 'success' | 'error' | 'already-redeemed' | 'no-coins';

export const RedemptionModal = ({
  open,
  onOpenChange,
  onRedeem,
  coinBalance,
  todaysCoins,
  todaysSteps,
  rewardAmount = 10
}: RedemptionModalProps) => {
  const [modalState, setModalState] = useState<ModalState>('redeem');
  const [errorMessage, setErrorMessage] = useState('');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const { formatTime, isTimeUp, isCritical, isUrgent } = useCountdownTimer();
  const { triggerHaptic } = useHapticFeedback();

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      if (todaysCoins === 0) {
        setModalState('no-coins');
      } else if (coinBalance > 0 && todaysCoins === 0) {
        setModalState('already-redeemed');
      } else {
        setModalState('redeem');
      }
      setErrorMessage('');
    }
  }, [open, todaysCoins, coinBalance]);

  // Success particles animation
  useEffect(() => {
    if (modalState === 'success') {
      const newParticles = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);
      
      const timer = setTimeout(() => setParticles([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [modalState]);

  const handleConfirmRedeem = async () => {
    setModalState('loading');
    triggerHaptic('light');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const success = await onRedeem();
      
      if (success) {
        setModalState('success');
        triggerHaptic('heavy');
        setTimeout(() => {
          onOpenChange(false);
        }, 4000);
      } else {
        setModalState('error');
        setErrorMessage('Unable to redeem coins. Please try again.');
        triggerHaptic('medium');
      }
    } catch (error) {
      setModalState('error');
      setErrorMessage('Network error. Please check your connection.');
      triggerHaptic('medium');
    }
  };

  const getTimerClass = () => {
    if (isTimeUp) return 'text-destructive';
    if (isCritical) return 'text-destructive';
    if (isUrgent) return 'text-warning';
    return 'text-tier-1-paisa';
  };

  const getTimerRingClass = () => {
    if (isTimeUp) return 'stroke-destructive';
    if (isCritical) return 'stroke-destructive';
    if (isUrgent) return 'stroke-warning';
    return 'stroke-tier-1-paisa';
  };

  const renderRedeemContent = () => (
    <>
      {/* Header */}
      <div className="relative text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-tier-1-paisa" />
          <h2 className="font-display text-xl font-bold">Redeem Your Daily Coins</h2>
        </div>
        <p className="text-muted-foreground text-sm">Convert your mindful steps into rewards</p>
      </div>

      {/* Today's Earnings Display */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          {/* Animated Coin Circle */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-tier-1-paisa via-tier-2-rupaya to-tier-1-paisa animate-spin opacity-20"></div>
            <div className="relative w-full h-full bg-background rounded-full border-4 border-tier-1-paisa/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-tier-1-paisa">{todaysCoins}</div>
                <div className="text-xs text-muted-foreground">coins</div>
              </div>
            </div>
            {/* Rotating coin icons */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 text-tier-1-paisa animate-pulse"
                style={{
                  top: `${50 + 40 * Math.sin((i * 60 + 45) * Math.PI / 180)}%`,
                  left: `${50 + 40 * Math.cos((i * 60 + 45) * Math.PI / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.2}s`
                }}
              >
                🪙
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="text-lg font-semibold">Today's Value: ₹{(todaysCoins / 100).toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">Rate: 100 coins = ₹1</div>
          <div className="text-sm text-muted-foreground">From {todaysSteps.toLocaleString()} mindful steps taken today</div>
        </div>
      </div>

      {/* Urgency Timer */}
      <div className="bg-secondary/30 rounded-xl p-4 mb-6 border-l-4 border-tier-1-paisa">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Clock className={cn("w-5 h-5", getTimerClass())} />
            <span className="font-medium">Redeem before midnight</span>
          </div>
          <div className={cn("font-bold text-lg", getTimerClass(), isCritical && "animate-pulse")}>
            {formatTime()}
          </div>
        </div>
        
        {/* Progress Ring */}
        <div className="relative w-16 h-16 mx-auto mb-3">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="hsl(var(--border))"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              className={cn(getTimerRingClass(), "transition-all duration-1000")}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * 0.2}`}
            />
          </svg>
        </div>
        
        <div className="text-center text-sm space-y-1">
          <div className="flex items-center justify-center gap-1 text-warning">
            <AlertCircle className="w-4 h-4" />
            <span>Redeem before midnight or coins reset to zero</span>
          </div>
          <div className="text-muted-foreground">Don't let your hard work disappear!</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleConfirmRedeem}
          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya hover:from-tier-1-paisa/90 hover:to-tier-2-rupaya/90 animate-pulse"
        >
          <Gift className="w-5 h-5 mr-2" />
          Confirm Redeem
        </Button>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Set Reminder
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            ⚡ Auto-redeem
          </Button>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          Keep walking, redeem later
        </Button>
      </div>
      
      <div className="text-center text-xs text-muted-foreground mt-4">
        <div>🔒 Coins will be added to your secure wallet</div>
        <div>Use for vouchers, bills, or cash withdrawal</div>
      </div>
    </>
  );

  const renderLoadingContent = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tier-1-paisa/20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tier-1-paisa border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h3 className="font-semibold mb-2">Processing your redemption...</h3>
      <p className="text-muted-foreground text-sm">Securing your coins</p>
    </div>
  );

  const renderSuccessContent = () => (
    <div className="text-center py-8 relative overflow-hidden">
      {/* Success Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-bounce pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.id * 0.2}s`,
            animationDuration: '1s',
          }}
        >
          {['🎉', '✨', '🪙', '💫', '⭐'][particle.id % 5]}
        </div>
      ))}
      
      <div className="relative z-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-success animate-pulse" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Coins Successfully Redeemed!</h3>
        <p className="text-muted-foreground mb-4">
          {todaysCoins} coins (₹{(todaysCoins / 100).toFixed(2)}) added to wallet
        </p>
        <p className="text-tier-1-paisa font-medium mb-6">Your mindful walking pays off! 🌟</p>
        
        <div className="space-y-2">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            View Wallet
          </Button>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Continue Walking
          </Button>
          <Button variant="ghost" size="sm" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share Achievement
          </Button>
        </div>
      </div>
    </div>
  );

  const renderErrorContent = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
        <Wifi className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-semibold mb-2">Connection Issue</h3>
      <p className="text-muted-foreground text-sm mb-4">{errorMessage}</p>
      <p className="text-sm text-tier-1-paisa mb-6">Your coins are safe</p>
      
      <div className="space-y-2">
        <Button onClick={handleConfirmRedeem} className="w-full">
          Try Again
        </Button>
        <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
          Redeem Later
        </Button>
      </div>
    </div>
  );

  const renderAlreadyRedeemedContent = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/20 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-success" />
      </div>
      <h3 className="font-semibold mb-2">Already redeemed today!</h3>
      <p className="text-muted-foreground text-sm mb-4">Redeemed earlier today</p>
      <p className="text-tier-1-paisa font-medium mb-6">Come back tomorrow for new coins</p>
      
      <Button onClick={() => onOpenChange(false)} className="w-full">
        Continue Walking
      </Button>
    </div>
  );

  const renderNoCoinsContent = () => (
    <div className="text-center py-8">
      <div className="text-6xl mb-4">🚶‍♀️</div>
      <h3 className="font-semibold mb-2">No coins to redeem yet</h3>
      <p className="text-muted-foreground text-sm mb-6">Start walking to earn your first coins</p>
      
      <Button onClick={() => onOpenChange(false)} className="w-full">
        Start Walking
      </Button>
    </div>
  );

  const getContent = () => {
    switch (modalState) {
      case 'loading':
        return renderLoadingContent();
      case 'success':
        return renderSuccessContent();
      case 'error':
        return renderErrorContent();
      case 'already-redeemed':
        return renderAlreadyRedeemedContent();
      case 'no-coins':
        return renderNoCoinsContent();
      default:
        return renderRedeemContent();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto p-6">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
        </button>
        
        {getContent()}
      </DialogContent>
    </Dialog>
  );
};