import React, { useEffect, useState } from 'react';
import { X, Share2, Trophy, Sparkles, Flame, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CelebrationEvent {
  type: 'tier_upgrade' | 'rate_increase' | 'milestone' | 'streak' | 'daily_goal';
  tier?: number;
  newRate?: number;
  milestone?: string;
  isVisible: boolean;
  message: string;
  subMessage?: string;
  icon: string;
}

interface MilestoneCelebrationsProps {
  event: CelebrationEvent | null;
  onDismiss: () => void;
  onShare?: () => void;
  className?: string;
}

export const MilestoneCelebrations: React.FC<MilestoneCelebrationsProps> = ({
  event,
  onDismiss,
  onShare,
  className = ""
}) => {
  const [animationStage, setAnimationStage] = useState<'entering' | 'displaying' | 'exiting'>('entering');
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; color: string }>>([]);
  const [spiritualQuote, setSpiritualQuote] = useState('');

  useEffect(() => {
    if (event?.isVisible) {
      // Generate particles for animation
      const particleColors = {
        tier_upgrade: ['#FFD700', '#FFA500', '#FF8C00'],
        rate_increase: ['#4FC3F7', '#26A69A', '#66BB6A'],
        milestone: ['#B39DDB', '#9C27B0', '#673AB7'],
        streak: ['#FF7043', '#FF5722', '#D84315'],
        daily_goal: ['#66BB6A', '#4CAF50', '#2E7D32']
      };

      const colors = particleColors[event.type] || particleColors.milestone;
      const newParticles = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1500,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);

      // Set spiritual quote based on event type
      const quotes = {
        tier_upgrade: "As you ascend, your light illuminates the path for others 🌟",
        rate_increase: "Growth is the reward for consistent dedication 📈",
        milestone: "Each milestone is an important marker on your journey 🛤️",
        streak: "Your commitment burns like an eternal flame 🔥",
        daily_goal: "Today's achievement becomes tomorrow's foundation 🏗️"
      };
      setSpiritualQuote(quotes[event.type] || quotes.milestone);

      // Animation sequence
      setAnimationStage('entering');
      
      const displayTimer = setTimeout(() => {
        setAnimationStage('displaying');
      }, 800);

      const autoCloseTimer = setTimeout(() => {
        setAnimationStage('exiting');
        setTimeout(onDismiss, 500);
      }, 6000);

      return () => {
        clearTimeout(displayTimer);
        clearTimeout(autoCloseTimer);
      };
    }
  }, [event, onDismiss]);

  const handleShare = () => {
    const shareText = `🎉 ${event?.message} on my Step Rewards journey! Walking towards fitness goals. #StepRewards #WalkingFitness`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Yogic Mile Achievement',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      onShare?.();
    }
  };

  const getBackgroundGradient = () => {
    switch (event?.type) {
      case 'tier_upgrade':
        return 'from-golden-accent via-warm-coral to-golden-accent';
      case 'rate_increase':
        return 'from-serene-blue via-deep-teal to-serene-blue';
      case 'milestone':
        return 'from-soft-lavender via-serene-blue to-soft-lavender';
      case 'streak':
        return 'from-warm-coral via-golden-accent to-warm-coral';
      case 'daily_goal':
        return 'from-sage-green via-deep-teal to-sage-green';
      default:
        return 'from-golden-accent to-warm-coral';
    }
  };

  const getCelebrationIcon = () => {
    switch (event?.type) {
      case 'tier_upgrade':
        return <Trophy className="w-12 h-12 text-golden-accent" />;
      case 'rate_increase':
        return <Sparkles className="w-12 h-12 text-serene-blue" />;
      case 'milestone':
        return <CheckCircle className="w-12 h-12 text-soft-lavender" />;
      case 'streak':
        return <Flame className="w-12 h-12 text-warm-coral" />;
      case 'daily_goal':
        return <CheckCircle className="w-12 h-12 text-sage-green" />;
      default:
        return <Sparkles className="w-12 h-12 text-golden-accent" />;
    }
  };

  if (!event?.isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-500 ${
        animationStage === 'exiting' ? 'opacity-0' : 'opacity-100'
      } ${className}`}
    >
      {/* Animated Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full animate-bounce ${
              animationStage === 'entering' ? 'opacity-0 scale-0' : 'opacity-80 scale-100'
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              animationDelay: `${particle.delay}ms`,
              animationDuration: '3s',
              transition: 'all 0.8s ease-out'
            }}
          />
        ))}

        {/* Spiritual mandala pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div 
            className={`w-96 h-96 rounded-full border-8 border-white transition-all duration-2000 ${
              animationStage === 'displaying' ? 'scale-110 rotate-180' : 'scale-100 rotate-0'
            }`}
            style={{
              borderImage: `conic-gradient(from 0deg, transparent, white, transparent) 1`,
              animation: animationStage === 'displaying' ? 'spin 10s linear infinite' : ''
            }}
          />
        </div>
      </div>

      {/* Main Celebration Card */}
      <Card 
        className={`bg-gradient-to-br ${getBackgroundGradient()} border-2 border-white/30 backdrop-blur-md rounded-3xl p-8 max-w-sm mx-4 relative overflow-hidden transition-all duration-1000 ${
          animationStage === 'entering' 
            ? 'scale-80 opacity-0 translate-y-8 rotate-3' 
            : animationStage === 'exiting'
            ? 'scale-110 opacity-0 -translate-y-4 -rotate-2'
            : 'scale-100 opacity-100 translate-y-0 rotate-0'
        }`}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full p-2"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Celebration Content */}
        <div className="text-center space-y-6">
          {/* Main Icon */}
          <div className="relative">
            <div 
              className={`transition-all duration-1000 ${
                animationStage === 'entering' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
              }`}
            >
              {event.icon && (
                <div 
                  className="text-8xl mb-4 transition-all duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))',
                    animation: animationStage === 'displaying' ? 'breathe 2s ease-in-out infinite' : ''
                  }}
                >
                  {event.icon}
                </div>
              )}
              
              {/* Additional Icon Overlay */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                {getCelebrationIcon()}
              </div>
            </div>

            {/* Glow Ring */}
            <div 
              className={`absolute inset-0 rounded-full transition-all duration-2000 ${
                animationStage === 'entering' ? 'scale-0 opacity-0' : 'scale-150 opacity-20'
              }`}
              style={{
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%)',
                animation: animationStage === 'displaying' ? 'pulse 2s ease-in-out infinite' : ''
              }}
            />
          </div>

          {/* Main Message */}
          <div 
            className={`transition-all duration-1000 delay-300 ${
              animationStage === 'entering' ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'
            }`}
          >
            <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
              {event.message}
            </h2>
            {event.subMessage && (
              <p className="text-lg text-white/90 font-medium">
                {event.subMessage}
              </p>
            )}
          </div>

          {/* Tier Upgrade Details */}
          {event.type === 'tier_upgrade' && event.tier && event.newRate && (
            <div 
              className={`bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 transition-all duration-1000 delay-500 ${
                animationStage === 'entering' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">Phase {event.tier}</div>
                  <div className="text-sm text-white/80">New Tier</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{event.newRate}₹</div>
                  <div className="text-sm text-white/80">per 100 steps</div>
                </div>
              </div>
            </div>
          )}

          {/* Spiritual Quote */}
          <div 
            className={`transition-all duration-1000 delay-700 ${
              animationStage === 'entering' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <blockquote className="text-sm text-white/90 italic leading-relaxed">
              "{spiritualQuote}"
            </blockquote>
          </div>

          {/* Action Buttons */}
          <div 
            className={`flex gap-3 transition-all duration-1000 delay-900 ${
              animationStage === 'entering' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <Button
              onClick={handleShare}
              variant="secondary"
              className="flex-1 bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={onDismiss}
              variant="default"
              className="flex-1 bg-white text-gray-900 hover:bg-white/90"
            >
              Continue
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
          {/* Corner decorations */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
        </div>
      </Card>
    </div>
  );
};