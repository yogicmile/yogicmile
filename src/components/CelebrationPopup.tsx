import { useEffect, useState } from 'react';
import { X, Gift, Zap, Flame, Users, Trophy } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CelebrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'referral' | 'video_bonus' | 'streak_milestone' | 'streak_complete' | 'welcome_bonus' | 'phase_upgrade';
  title: string;
  message: string;
  amount?: number; // in paisa
  autoClose?: boolean;
  autoCloseDelay?: number; // in milliseconds
}

export const CelebrationPopup = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  amount,
  autoClose = true,
  autoCloseDelay = 3000
}: CelebrationPopupProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      
      if (autoClose) {
        const timer = setTimeout(() => {
          onClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setShowConfetti(false);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'referral':
        return <Users className="w-12 h-12 text-blue-500" />;
      case 'video_bonus':
        return <Zap className="w-12 h-12 text-yellow-500" />;
      case 'streak_milestone':
        return <Flame className="w-12 h-12 text-orange-500" />;
      case 'streak_complete':
        return <Trophy className="w-12 h-12 text-gold-500" />;
      case 'welcome_bonus':
        return <Gift className="w-12 h-12 text-green-500" />;
      case 'phase_upgrade':
        return <Trophy className="w-12 h-12 text-purple-500" />;
      default:
        return <Gift className="w-12 h-12 text-primary" />;
    }
  };

  const getEmoji = () => {
    switch (type) {
      case 'referral':
        return '👥';
      case 'video_bonus':
        return '⚡';
      case 'streak_milestone':
        return '🔥';
      case 'streak_complete':
        return '🏆';
      case 'welcome_bonus':
        return '🎁';
      case 'phase_upgrade':
        return '👑';
      default:
        return '🎉';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'referral':
        return 'from-blue-50 to-indigo-50';
      case 'video_bonus':
        return 'from-yellow-50 to-orange-50';
      case 'streak_milestone':
        return 'from-orange-50 to-red-50';
      case 'streak_complete':
        return 'from-yellow-50 to-amber-50';
      case 'welcome_bonus':
        return 'from-green-50 to-emerald-50';
      case 'phase_upgrade':
        return 'from-purple-50 to-pink-50';
      default:
        return 'from-blue-50 to-purple-50';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 shadow-none">
        <div className={cn(
          "relative bg-gradient-to-br rounded-2xl border shadow-2xl overflow-hidden",
          getBgColor()
        )}>
          {/* Confetti Animation */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "absolute animate-bounce text-2xl",
                    i % 4 === 0 && "animate-pulse",
                    i % 4 === 1 && "animate-spin",
                    i % 4 === 2 && "animate-bounce",
                    i % 4 === 3 && "animate-ping"
                  )}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                >
                  {['🎉', '✨', '🎊', '💰', '👏', '🚀'][Math.floor(Math.random() * 6)]}
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Main Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Emoji Header */}
            <div className="text-6xl mb-4 animate-bounce">
              {getEmoji()}
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              {getIcon()}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {title}
            </h2>

            {/* Amount Display */}
            {amount && amount > 0 && (
              <div className="text-4xl font-bold text-green-600 mb-2">
                +₹{(amount / 100).toFixed(2)}
              </div>
            )}

            {/* Message */}
            <p className="text-gray-700 mb-6 text-lg">
              {message}
            </p>

            {/* Action Button */}
            <Button 
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-semibold"
            >
              Awesome! 🎉
            </Button>

            {/* Auto-close indicator */}
            {autoClose && (
              <p className="text-xs text-gray-500 mt-4">
                Auto-closing in {Math.ceil(autoCloseDelay / 1000)} seconds...
              </p>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -translate-x-10 -translate-y-10" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 translate-y-16" />
          <div className="absolute top-1/2 left-0 w-16 h-16 bg-white/5 rounded-full -translate-x-8" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Convenience components for different celebration types
export const ReferralBonusPopup = ({ 
  isOpen, 
  onClose, 
  friendsName, 
  bonusAmount 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  friendsName?: string; 
  bonusAmount: number; 
}) => (
  <CelebrationPopup
    isOpen={isOpen}
    onClose={onClose}
    type="referral"
    title="Friend Joined!"
    message={`${friendsName || 'Your friend'} joined Step Rewards using your referral code!`}
    amount={bonusAmount}
  />
);

export const VideoBonusPopup = ({ 
  isOpen, 
  onClose, 
  bonusAmount 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  bonusAmount: number; 
}) => (
  <CelebrationPopup
    isOpen={isOpen}
    onClose={onClose}
    type="video_bonus"
    title="Double Bonus!"
    message="Thanks for watching! Your daily earnings have been doubled!"
    amount={bonusAmount}
  />
);

export const StreakMilestonePopup = ({ 
  isOpen, 
  onClose, 
  streakDays, 
  daysRemaining 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  streakDays: number; 
  daysRemaining: number; 
}) => (
  <CelebrationPopup
    isOpen={isOpen}
    onClose={onClose}
    type="streak_milestone"
    title={`${streakDays} Days in a Row!`}
    message={`Amazing consistency! Just ${daysRemaining} more ${daysRemaining === 1 ? 'day' : 'days'} for ₹5 bonus!`}
    autoCloseDelay={2500}
  />
);

export const StreakCompletePopup = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) => (
  <CelebrationPopup
    isOpen={isOpen}
    onClose={onClose}
    type="streak_complete"
    title="🔥 7-Day Streak!"
    message="Incredible dedication! You've earned the streak bonus!"
    amount={500} // ₹5.00
  />
);

export const WelcomeBonusPopup = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) => (
  <CelebrationPopup
    isOpen={isOpen}
    onClose={onClose}
    type="welcome_bonus"
    title="Welcome to Step Rewards!"
    message="Welcome bonus added to your wallet. Start walking to earn more!"
    amount={100} // ₹1.00
  />
);