import { useState } from 'react';
import { Gift, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHapticFeedback, useCelebration } from '@/hooks/use-animations';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EnhancedCTAButtonProps {
  onClaim: () => Promise<boolean>;
  disabled?: boolean;
  coinBalance: number;
  rewardAmount?: number;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error' | 'confirmation';

export const EnhancedCTAButton = ({ 
  onClaim, 
  disabled = false, 
  coinBalance,
  rewardAmount = 10 
}: EnhancedCTAButtonProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>('idle');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { triggerHaptic } = useHapticFeedback();
  const { isVisible: showCelebration, celebrate } = useCelebration();

  const handleClick = () => {
    if (disabled || buttonState === 'loading') return;
    
    triggerHaptic('medium');
    setShowConfirmation(true);
  };

  const handleConfirmClaim = async () => {
    setShowConfirmation(false);
    setButtonState('loading');
    triggerHaptic('light');

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = await onClaim();
      
      if (success) {
        setButtonState('success');
        celebrate();
        triggerHaptic('heavy');
        
        // Reset to idle after success animation
        setTimeout(() => {
          setButtonState('idle');
        }, 3000);
      } else {
        setButtonState('error');
        setErrorMessage('Unable to claim reward. Please try again.');
        triggerHaptic('medium');
        
        // Reset to idle after error display
        setTimeout(() => {
          setButtonState('idle');
          setErrorMessage('');
        }, 3000);
      }
    } catch (error) {
      setButtonState('error');
      setErrorMessage('Network error. Please check your connection.');
      triggerHaptic('medium');
      
      setTimeout(() => {
        setButtonState('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  const getButtonContent = () => {
    switch (buttonState) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            <span className="font-display">Processing...</span>
          </>
        );
      case 'success':
        return (
          <>
            <Check className="w-5 h-5 mr-2" />
            <span className="font-display">Claimed Successfully!</span>
          </>
        );
      case 'error':
        return (
          <>
            <X className="w-5 h-5 mr-2" />
            <span className="font-display">Try Again</span>
          </>
        );
      default:
        return (
          <>
            <Gift className="w-5 h-5 mr-2" />
            <span className="font-display">Redeem Today's Coins</span>
          </>
        );
    }
  };

  const getButtonClass = () => {
    const baseClass = "w-full transition-all duration-500 min-h-[52px] font-bold rounded-2xl backdrop-blur-sm";
    
    switch (buttonState) {
      case 'loading':
        return `${baseClass} bg-muted text-muted-foreground cursor-not-allowed opacity-80`;
      case 'success':
        return `${baseClass} bg-success text-success-foreground shadow-glow scale-105`;
      case 'error':
        return `${baseClass} bg-destructive text-destructive-foreground hover:bg-destructive/90`;
      default:
        return `${baseClass} cta-button ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
    }
  };

  const canClaim = buttonState === 'idle' && !disabled;

  return (
    <>
      <div className="relative">
        <Button
          onClick={handleClick}
          disabled={!canClaim}
          className={getButtonClass()}
          aria-label={`Claim ${rewardAmount} karma points`}
        >
          {getButtonContent()}
        </Button>
        
        {/* Success confetti effect */}
        {showCelebration && buttonState === 'success' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce text-2xl"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${20 + (i % 2) * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              >
                {['🎉', '✨', '🌟', '💫', '⭐', '🎊'][i]}
              </div>
            ))}
          </div>
        )}
        
        {/* Error message */}
        {buttonState === 'error' && errorMessage && (
          <div className="absolute -bottom-12 left-0 right-0 text-center">
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg py-2 px-3 backdrop-blur-sm">
              {errorMessage}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Gift className="w-6 h-6 text-tier-1-paisa" />
              Redeem Your Coins
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎁</div>
              <p className="text-lg font-semibold mb-2">Ready to redeem your daily coins?</p>
              <p className="text-muted-foreground text-sm">
                You'll receive <span className="font-bold text-tier-1-paisa">{rewardAmount} coins</span>
              </p>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Balance:</span>
                <span className="font-medium">{coinBalance} coins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Reward Amount:</span>
                <span className="font-medium text-tier-1-paisa">+{rewardAmount} coins</span>
              </div>
              <hr className="border-border/50" />
              <div className="flex justify-between font-semibold">
                <span>New Balance:</span>
                <span className="text-tier-1-paisa">{coinBalance + rewardAmount} coins</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmClaim}
                className="flex-1 bg-tier-1-paisa text-tier-1-paisa-foreground hover:bg-tier-1-paisa/90"
              >
                Redeem Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};