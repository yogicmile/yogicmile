import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Sparkles, Share, X } from 'lucide-react';
import { RARITY_STYLES } from '@/types/gamification';
import type { Achievement, UserAchievement } from '@/types/gamification';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement?: Achievement;
  userAchievement?: UserAchievement;
  celebrationType?: 'achievement' | 'milestone' | 'challenge' | 'level_up';
  customTitle?: string;
  customDescription?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function CelebrationModal({
  isOpen,
  onClose,
  achievement,
  userAchievement,
  celebrationType = 'achievement',
  customTitle,
  customDescription,
  autoClose = true,
  autoCloseDelay = 5000
}: CelebrationModalProps) {
  const [animationStage, setAnimationStage] = useState<'entering' | 'showing' | 'exiting'>('entering');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Generate particle effects
  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      }));
      setParticles(newParticles);
      setAnimationStage('entering');

      // Animation sequence
      const enterTimeout = setTimeout(() => setAnimationStage('showing'), 200);
      
      const autoCloseTimeout = autoClose ? setTimeout(() => {
        setAnimationStage('exiting');
        setTimeout(onClose, 300);
      }, autoCloseDelay) : null;

      return () => {
        clearTimeout(enterTimeout);
        if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
      };
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const rarityStyle = achievement ? RARITY_STYLES[achievement.rarity] : RARITY_STYLES.common;

  const getIcon = () => {
    switch (celebrationType) {
      case 'achievement':
        return <Trophy className="w-16 h-16 text-warning" />;
      case 'milestone':
        return <Star className="w-16 h-16 text-primary" />;
      case 'challenge':
        return <Sparkles className="w-16 h-16 text-success" />;
      case 'level_up':
        return <Trophy className="w-16 h-16 text-purple-500" />;
      default:
        return <Trophy className="w-16 h-16 text-warning" />;
    }
  };

  const getTitle = () => {
    if (customTitle) return customTitle;
    
    switch (celebrationType) {
      case 'achievement':
        return achievement ? `Achievement Unlocked!` : 'Achievement Unlocked!';
      case 'milestone':
        return 'Milestone Reached!';
      case 'challenge':
        return 'Challenge Complete!';
      case 'level_up':
        return 'Level Up!';
      default:
        return 'Congratulations!';
    }
  };

  const getDescription = () => {
    if (customDescription) return customDescription;
    if (achievement) return achievement.description;
    return 'You\'ve accomplished something amazing!';
  };

  const handleShare = () => {
    // Implement sharing logic
    if (navigator.share) {
      navigator.share({
        title: getTitle(),
        text: `I just unlocked: ${achievement?.name || 'a new achievement'} in Yogic Mile!`,
        url: window.location.origin
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className={`
          max-w-md border-0 bg-gradient-to-br from-background via-background to-background/95
          transition-all duration-500 transform
          ${animationStage === 'entering' ? 'scale-75 opacity-0 rotate-12' : ''}
          ${animationStage === 'showing' ? 'scale-100 opacity-100 rotate-0' : ''}
          ${animationStage === 'exiting' ? 'scale-110 opacity-0 -rotate-6' : ''}
        `}
      >
        {/* Confetti Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className={`
                absolute w-2 h-2 bg-gradient-to-br ${rarityStyle.background} rounded-full
                animate-bounce opacity-80
              `}
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>

        {/* Background Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${rarityStyle.background} opacity-10 rounded-lg`} />

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 hover:bg-background/80"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="relative text-center space-y-6 py-4">
          {/* Icon with Glow Effect */}
          <div className={`relative mx-auto w-fit animate-pulse`}>
            <div className={`absolute inset-0 blur-xl bg-gradient-to-br ${rarityStyle.background} opacity-50 scale-150`} />
            <div className="relative">
              {getIcon()}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
              {getTitle()}
            </h2>
            
            {achievement && (
              <div className="flex items-center justify-center gap-2">
                <Badge className={`bg-gradient-to-r ${rarityStyle.background} text-white border-0 text-sm px-3 py-1`}>
                  {achievement.name}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {rarityStyle.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {getDescription()}
          </p>

          {/* Reward (if achievement) */}
          {achievement && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium">Reward Earned</h3>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🪙</span>
                <span className="text-lg font-bold text-warning">
                  {achievement.coin_reward} coins
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className={`bg-gradient-to-r ${rarityStyle.background} text-white border-0 hover:opacity-90`}
            >
              Awesome!
            </Button>
          </div>

          {/* Auto-close indicator */}
          {autoClose && (
            <div className="text-xs text-muted-foreground">
              Auto-closing in {Math.ceil(autoCloseDelay / 1000)}s
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}