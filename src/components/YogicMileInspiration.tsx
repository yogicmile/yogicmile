import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sunrise, Heart, Leaf, Star, Gift, Users } from 'lucide-react';

interface YogicMileInspirationProps {
  currentTier: number;
  currentStreak: number;
  className?: string;
}

export const YogicMileInspiration: React.FC<YogicMileInspirationProps> = ({
  currentTier,
  currentStreak,
  className = ""
}) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showIntention, setShowIntention] = useState(false);
  const [dailyIntention, setDailyIntention] = useState('');

  // Mindful walking quotes and tips
  const inspirationalContent = [
    {
      quote: "Every step is a meditation in motion",
      tip: "Focus on the sensation of your feet touching the ground",
      icon: <Sunrise className="w-4 h-4" />,
      color: "text-golden-accent"
    },
    {
      quote: "Walk with gratitude for your body's wisdom",
      tip: "Notice three beautiful things during your walk today",
      icon: <Heart className="w-4 h-4" />,
      color: "text-sage-green"
    },
    {
      quote: "Nature walks restore your inner balance",
      tip: "Take breaks to breathe deeply and connect with surroundings",
      icon: <Leaf className="w-4 h-4" />,
      color: "text-deep-teal"
    },
    {
      quote: "Your journey lights the way for others",
      tip: "Set walking reminders to build sustainable habits",
      icon: <Star className="w-4 h-4" />,
      color: "text-soft-lavender"
    }
  ];

  const intentions = [
    "I walk with awareness and presence",
    "Each step brings me closer to inner peace",
    "I honor my body through mindful movement",
    "My journey inspires others to begin theirs",
    "I walk in gratitude for this moment",
    "Every step is sacred and purposeful"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(prev => (prev + 1) % inspirationalContent.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [inspirationalContent.length]);

  const handleSetIntention = () => {
    const randomIntention = intentions[Math.floor(Math.random() * intentions.length)];
    setDailyIntention(randomIntention);
    setShowIntention(true);
  };

  const current = inspirationalContent[currentQuote];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Daily Intention Setting */}
      {!showIntention ? (
        <Card className="bg-gradient-to-br from-soft-lavender/10 to-serene-blue/10 border-soft-lavender/20">
          <div className="p-4 text-center">
            <div className="text-2xl mb-2">🧘‍♀️</div>
            <h3 className="font-semibold text-soft-lavender mb-2">Set Your Walking Intention</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Begin your mindful journey with purpose
            </p>
            <Button
              onClick={handleSetIntention}
              variant="outline"
              className="border-soft-lavender text-soft-lavender hover:bg-soft-lavender hover:text-white"
            >
              Set Intention
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-golden-accent/10 to-warm-coral/10 border-golden-accent/20">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xl">🌟</div>
              <span className="font-semibold text-golden-accent">Today's Intention</span>
            </div>
            <blockquote className="text-sm font-medium text-foreground italic leading-relaxed mb-3">
              "{dailyIntention}"
            </blockquote>
            <div className="flex justify-between items-center">
              <Badge variant="secondary" className="text-xs">
                Carry this with you today
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIntention(false)}
                className="text-xs"
              >
                Change
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Rotating Inspirational Content */}
      <Card className="bg-gradient-to-br from-sage-green/10 to-deep-teal/10 border-sage-green/20">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className={current.color}>
              {current.icon}
            </div>
            <span className="font-semibold text-sage-green">Mindful Walking Wisdom</span>
          </div>
          
          <blockquote 
            className="text-sm font-medium text-foreground italic leading-relaxed mb-3 transition-all duration-500"
            key={currentQuote}
          >
            "{current.quote}"
          </blockquote>
          
          <div className="bg-white/30 rounded-lg p-3 border border-sage-green/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm">💡</div>
              <span className="text-xs font-semibold text-sage-green">Today's Tip</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {current.tip}
            </p>
          </div>
        </div>
      </Card>

      {/* Mindful Features */}
      <div className="grid grid-cols-2 gap-3">
        {/* Breathing Reminder */}
        <Card className="bg-gradient-to-br from-serene-blue/10 to-soft-lavender/10 border-serene-blue/20 cursor-pointer hover:scale-105 transition-transform">
          <div className="p-3 text-center">
            <div className="text-xl mb-2 animate-pulse">🫁</div>
            <h4 className="text-xs font-semibold text-serene-blue mb-1">Breathing Space</h4>
            <p className="text-xs text-muted-foreground">Pause & breathe mindfully</p>
          </div>
        </Card>

        {/* Gratitude Practice */}
        <Card className="bg-gradient-to-br from-warm-coral/10 to-golden-accent/10 border-warm-coral/20 cursor-pointer hover:scale-105 transition-transform">
          <div className="p-3 text-center">
            <div className="text-xl mb-2">🙏</div>
            <h4 className="text-xs font-semibold text-warm-coral mb-1">Gratitude Walk</h4>
            <p className="text-xs text-muted-foreground">Walk with appreciation</p>
          </div>
        </Card>
      </div>

      {/* Community Connection */}
      <Card className="bg-gradient-to-br from-deep-teal/10 to-sage-green/10 border-deep-teal/20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-deep-teal" />
              <span className="font-semibold text-deep-teal">Mindful Community</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Phase {currentTier}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Walkers today:</span>
              <span className="font-medium text-deep-teal">2,347 active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Your streak rank:</span>
              <span className="font-medium text-deep-teal">Top 15%</span>
            </div>
          </div>

          <div className="mt-3 bg-white/30 rounded-lg p-3 border border-deep-teal/20">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-3 h-3 text-warm-coral" />
              <span className="text-xs font-semibold text-warm-coral">Eco Impact</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your mindful walking has contributed to planting 3 trees this month 🌱
            </p>
          </div>
        </div>
      </Card>

      {/* Seasonal Challenge */}
      <Card className="bg-gradient-to-br from-golden-accent/10 to-warm-coral/10 border-golden-accent/20">
        <div className="p-4 text-center">
          <div className="text-2xl mb-2">
            {(() => {
              const month = new Date().getMonth(); // 0-11
              if ([2, 3, 4].includes(month)) return "☀️"; // Summer
              if ([5, 6, 7, 8].includes(month)) return "🌧️"; // Rainy
              return "❄️"; // Winter
            })()}
          </div>
          <h3 className="font-semibold text-golden-accent mb-2">
            {(() => {
              const month = new Date().getMonth(); // 0-11
              if ([2, 3, 4].includes(month)) return "Summer Vitality Challenge";
              if ([5, 6, 7, 8].includes(month)) return "Monsoon Mindfulness Challenge";
              return "Winter Wellness Challenge";
            })()}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {(() => {
              const month = new Date().getMonth(); // 0-11
              if ([2, 3, 4].includes(month)) return "Walk under the warm sun and embrace your inner energy";
              if ([5, 6, 7, 8].includes(month)) return "Find peace in the rhythm of raindrops and fresh monsoon air";
              return "Stay active in the cool breeze and practice winter mindfulness";
            })()}
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              15 days remaining
            </Badge>
            <Badge variant="secondary" className="text-xs bg-golden-accent/20 text-golden-accent">
              2x rewards
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};