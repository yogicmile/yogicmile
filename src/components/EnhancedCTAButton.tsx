import { useState } from 'react';
import { Gift, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHapticFeedback, useCelebration } from '@/hooks/use-animations';
import { RedemptionModal } from '@/components/RedemptionModal';

interface EnhancedCTAButtonProps {
  onClaim: () => Promise<boolean>;
  disabled?: boolean;
  coinBalance: number;
  rewardAmount?: number;
  todaysCoins?: number;
  todaysSteps?: number;
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error' | 'confirmation';

export const EnhancedCTAButton = ({ 
  onClaim, 
  disabled = false, 
  coinBalance,
  rewardAmount = 10,
  todaysCoins = 10,
  todaysSteps = 5000
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

  const handleConfirmClaim = async (): Promise<boolean> => {
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
        return true;
      } else {
        setButtonState('error');
        setErrorMessage('Unable to claim reward. Please try again.');
        triggerHaptic('medium');
        
        // Reset to idle after error display
        setTimeout(() => {
          setButtonState('idle');
          setErrorMessage('');
        }, 3000);
        return false;
      }
    } catch (error) {
      setButtonState('error');
      setErrorMessage('Network error. Please check your connection.');
      triggerHaptic('medium');
      
      setTimeout(() => {
        setButtonState('idle');
        setErrorMessage('');
      }, 3000);
      return false;
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

      {/* Redemption Modal */}
      <RedemptionModal
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        onRedeem={handleConfirmClaim}
        coinBalance={coinBalance}
        todaysCoins={todaysCoins}
        todaysSteps={todaysSteps}
        rewardAmount={rewardAmount}
      />
    </>
  );
};