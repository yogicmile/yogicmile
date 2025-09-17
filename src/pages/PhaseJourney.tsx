import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, CheckCircle, Share2, TrendingUp, Calendar, Target, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useYogicMileData } from '@/hooks/use-mock-data';

interface TierInfo {
  id: number;
  symbol: string;
  name: string;
  spiritualName: string;
  stepGoal: number;
  timeLimit: number;
  dailyAverage: number;
  rewardRate: number;
  spiritualBenefit: string;
  status: 'completed' | 'current' | 'locked';
  completedDate?: string;
  completionDays?: number;
  coinsEarned?: number;
}

const PhaseJourney: React.FC = () => {
  const navigate = useNavigate();
  const yogicData = useYogicMileData();
  const [selectedTier, setSelectedTier] = useState<TierInfo | null>(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [animatedTiers, setAnimatedTiers] = useState<number[]>([]);

  const allTiers: TierInfo[] = [
    {
      id: 1,
      symbol: '🟡',
      name: 'Paisa Phase',
      spiritualName: 'Foundation Level',
      stepGoal: 200000,
      timeLimit: 30,
      dailyAverage: 6667,
      rewardRate: 1, // 1 paisa per 25 steps
      spiritualBenefit: 'Build foundation of fitness and commitment to daily goals',
      status: 'current',
      coinsEarned: 8000 // 200K steps ÷ 25 × 1 paisa = 8000 paisa
    },
    {
      id: 2,
      symbol: '🪙',
      name: 'Coin Phase',
      spiritualName: 'Consistency Level',
      stepGoal: 300000,
      timeLimit: 45,
      dailyAverage: 6667,
      rewardRate: 2, // 2 paisa per 25 steps
      spiritualBenefit: 'Develop consistent practice and healthy habits',
      status: 'locked'
    },
    {
      id: 3,
      symbol: '🎟️',
      name: 'Token Phase',
      spiritualName: 'Strength Level',
      stepGoal: 400000,
      timeLimit: 60,
      dailyAverage: 6667,
      rewardRate: 3, // 3 paisa per 25 steps
      spiritualBenefit: 'Strengthen willpower and physical resilience',
      status: 'locked'
    },
    {
      id: 4,
      symbol: '💎',
      name: 'Gem Phase',
      spiritualName: 'Focus Level',
      stepGoal: 500000,
      timeLimit: 75,
      dailyAverage: 6667,
      rewardRate: 5, // 5 paisa per 25 steps
      spiritualBenefit: 'Achieve clear focus and determined goals',
      status: 'locked'
    },
    {
      id: 5,
      symbol: '💠',
      name: 'Diamond Phase',
      spiritualName: 'Strong Focus',
      stepGoal: 600000,
      timeLimit: 80,
      dailyAverage: 7500,
      rewardRate: 7, // 7 paisa per 25 steps
      spiritualBenefit: 'Build strong focus and determination',
      status: 'locked'
    },
    {
      id: 6,
      symbol: '👑',
      name: 'Crown Phase',
      spiritualName: 'Self Mastery',
      stepGoal: 1000000,
      timeLimit: 120,
      dailyAverage: 8334,
      rewardRate: 10, // 10 paisa per 25 steps
      spiritualBenefit: 'Master self-discipline and personal goals',
      status: 'locked'
    },
    {
      id: 7,
      symbol: '🏵️',
      name: 'Emperor Phase',
      spiritualName: 'Peak Performance',
      stepGoal: 1700000,
      timeLimit: 200,
      dailyAverage: 8500,
      rewardRate: 15, // 15 paisa per 25 steps
      spiritualBenefit: 'Reach peak performance and expertise',
      status: 'locked'
    },
    {
      id: 8,
      symbol: '🏅',
      name: 'Legend Phase',
      spiritualName: 'Elite Status',
      stepGoal: 2000000,
      timeLimit: 250,
      dailyAverage: 8000,
      rewardRate: 20, // 20 paisa per 25 steps
      spiritualBenefit: 'Achieve elite fitness status and recognition',
      status: 'locked'
    },
    {
      id: 9,
      symbol: '🏆',
      name: 'Immortal Phase',
      spiritualName: 'Ultimate Achievement',
      stepGoal: 3000000,
      timeLimit: 365,
      dailyAverage: 8219,
      rewardRate: 30, // 30 paisa per 25 steps
      spiritualBenefit: 'Reach ultimate fitness achievement and legacy status',
      status: 'locked'
    }
  ];

  useEffect(() => {
    // Animate tiers in sequence
    const animateSequence = async () => {
      for (let i = 0; i < allTiers.length; i++) {
        setTimeout(() => {
          setAnimatedTiers(prev => [...prev, i]);
        }, i * 150);
      }
    };
    animateSequence();
  }, []);

  const handleTierClick = (tier: TierInfo) => {
    if (tier.status !== 'locked') {
      setSelectedTier(tier);
      setShowTierModal(true);
    }
  };

  const getTierCardStyle = (tier: TierInfo) => {
    switch (tier.status) {
      case 'current':
        return 'border-golden-accent bg-gradient-to-br from-golden-accent/10 to-serene-blue/5 shadow-lg animate-glow-pulse';
      case 'completed':
        return 'border-sage-green bg-gradient-to-br from-sage-green/10 to-deep-teal/5 shadow-md';
      case 'locked':
        return 'border-border/30 bg-gradient-to-br from-gray-50 to-gray-100 opacity-60';
      default:
        return '';
    }
  };

  const currentTier = allTiers.find(t => t.status === 'current');
  const currentProgress = currentTier ? (yogicData.tierProgress.currentTierSteps / currentTier.stepGoal) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-soft-lavender/5 to-serene-blue/5">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border/30 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full bg-gradient-to-br from-golden-accent to-warm-coral flex items-center justify-center text-white font-bold text-sm"
            >
              YM
            </div>
            <Button variant="ghost" size="sm" className="p-2">
              <Share2 size={18} />
            </Button>
          </div>
        </div>
        
        <div className="text-center mt-2 max-w-md mx-auto">
          <h1 className="text-xl font-bold text-foreground">Your Evolution Journey</h1>
          <p className="text-sm text-muted-foreground">9 Phases of Mindful Transformation</p>
          <Badge variant="secondary" className="mt-2">
            Currently in Phase {yogicData.user.currentTier} of 9
          </Badge>
        </div>
      </header>

      {/* Tier Cards */}
      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {allTiers.map((tier, index) => (
          <Card 
            key={tier.id}
            className={`relative overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] ${getTierCardStyle(tier)} ${
              animatedTiers.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            onClick={() => handleTierClick(tier)}
          >
            <div className="p-6">
              {/* Tier Status Icon */}
              <div className="absolute top-4 right-4">
                {tier.status === 'completed' && (
                  <CheckCircle className="w-6 h-6 text-sage-green" />
                )}
                {tier.status === 'locked' && (
                  <Lock className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              {/* Tier Symbol and Name */}
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className={`text-6xl transition-all duration-300 ${
                    tier.status === 'current' ? 'animate-breathe filter drop-shadow-lg' : ''
                  }`}
                  style={{
                    filter: tier.status === 'current' 
                      ? 'drop-shadow(0 0 20px rgba(255, 213, 79, 0.6))' 
                      : 'none'
                  }}
                >
                  {tier.symbol}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground italic">{tier.spiritualName}</p>
                  <Badge 
                    variant={tier.status === 'current' ? 'default' : 'secondary'} 
                    className="mt-1"
                  >
                    Phase {tier.id}
                  </Badge>
                </div>
              </div>

              {/* Requirements */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <Target className="w-4 h-4 text-serene-blue mx-auto mb-1" />
                  <div className="text-lg font-bold text-serene-blue">
                    {(tier.stepGoal / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-muted-foreground">steps goal</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3 text-center">
                  <Calendar className="w-4 h-4 text-soft-lavender mx-auto mb-1" />
                  <div className="text-lg font-bold text-soft-lavender">
                    {tier.timeLimit}
                  </div>
                  <div className="text-xs text-muted-foreground">days limit</div>
                </div>
              </div>

              {/* Reward Rate */}
              <div className="bg-gradient-to-r from-golden-accent/20 to-warm-coral/20 rounded-xl p-4 mb-4 border border-golden-accent/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-golden-accent">
                      {tier.rewardRate} paisa per 25 steps
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Daily potential (12K cap): ₹{(() => {
                        const dailyCappedSteps = Math.min(tier.dailyAverage, 12000);
                        const units = Math.floor(dailyCappedSteps / 25);
                        const paisa = units * tier.rewardRate;
                        return (paisa / 100).toFixed(2);
                      })()}
                    </div>
                  </div>
                  <Zap className="w-6 h-6 text-golden-accent" />
                </div>
              </div>

              {/* Current Tier Progress */}
              {tier.status === 'current' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-golden-accent font-bold">
                      {Math.round(currentProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-golden-accent to-warm-coral rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{yogicData.tierProgress.currentTierSteps.toLocaleString()} steps</span>
                    <span>{tier.stepGoal.toLocaleString()} steps</span>
                  </div>
                  <div className="bg-serene-blue/10 rounded-lg p-3 border border-serene-blue/20">
                    <p className="text-sm text-serene-blue font-medium">
                      🕰️ {yogicData.tierProgress.daysRemaining} days remaining
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You're {Math.round(currentProgress)}% towards {allTiers[tier.id]?.name || 'next phase'}
                    </p>
                  </div>
                </div>
              )}

              {/* Completed Tier Info */}
              {tier.status === 'completed' && (
                <div className="bg-sage-green/10 rounded-lg p-3 border border-sage-green/20">
                  <p className="text-sm font-medium text-sage-green mb-2">✅ Phase Complete!</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Completed: </span>
                      <span className="font-medium">{tier.completedDate || 'Sep 15, 2024'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration: </span>
                      <span className="font-medium">{tier.completionDays || 28} days</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Locked Tier Preview */}
              {tier.status === 'locked' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    🔒 Unlock by reaching Phase {tier.id - 1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Earn up to {Math.round(((tier.rewardRate / allTiers[0].rewardRate) - 1) * 100)}% more coins per step
                  </p>
                </div>
              )}

              {/* Spiritual Benefit */}
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  "{tier.spiritualBenefit}"
                </p>
              </div>
            </div>
          </Card>
        ))}

        {/* Journey Statistics Panel */}
        <Card className="bg-gradient-to-br from-soft-lavender/10 to-serene-blue/10 border-soft-lavender/20 mt-8">
          <div className="p-6">
            <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-soft-lavender" />
              Journey Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-serene-blue">
                  {Math.floor(yogicData.user.totalLifetimeSteps / 1000)}K
                </div>
                <div className="text-xs text-muted-foreground">Total Steps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-golden-accent">
                  ₹{(yogicData.wallet.mockData.totalBalance / 100).toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">Coins Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sage-green">
                  {yogicData.insights.weekStats.averageDaily.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Daily Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warm-coral">
                  {yogicData.user.streakDays}
                </div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Motivational Footer */}
        <div className="text-center py-8 space-y-4">
          <div className="text-4xl mb-3">💪</div>
          <blockquote className="text-base font-medium text-foreground italic leading-relaxed max-w-sm mx-auto">
            "The journey of a thousand miles begins with a single step. Every phase brings you closer to your goals."
          </blockquote>
          <div className="bg-golden-accent/10 rounded-xl p-4 border border-golden-accent/20">
            <p className="text-sm text-golden-accent font-medium">
              🌟 Join 10,000+ mindful walkers on their journey
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Every step counts towards enlightenment
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-serene-blue to-deep-teal hover:from-serene-blue/90 hover:to-deep-teal/90 text-white font-medium px-8 py-3 rounded-2xl"
          >
            Continue Journey
          </Button>
        </div>
      </main>

      {/* Tier Detail Modal */}
      <Dialog open={showTierModal} onOpenChange={setShowTierModal}>
        <DialogContent className="max-w-sm mx-auto">
          {selectedTier && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <span className="text-3xl">{selectedTier.symbol}</span>
                  <div>
                    <div>{selectedTier.name}</div>
                    <div className="text-sm font-normal text-muted-foreground">
                      {selectedTier.spiritualName}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-serene-blue/10 rounded-lg p-3 text-center border border-serene-blue/20">
                    <Target className="w-4 h-4 text-serene-blue mx-auto mb-1" />
                    <div className="text-lg font-bold text-serene-blue">
                      {selectedTier.stepGoal.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">steps required</div>
                  </div>
                  <div className="bg-soft-lavender/10 rounded-lg p-3 text-center border border-soft-lavender/20">
                    <Calendar className="w-4 h-4 text-soft-lavender mx-auto mb-1" />
                    <div className="text-lg font-bold text-soft-lavender">
                      {selectedTier.dailyAverage.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">daily average</div>
                  </div>
                </div>
                
                <div className="bg-golden-accent/10 rounded-xl p-4 border border-golden-accent/20">
                  <h4 className="font-semibold text-golden-accent mb-2">Rewards & Benefits</h4>
                  <p className="text-sm mb-2">
                    <strong>{selectedTier.rewardRate} paisa per 25 steps</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Daily earning potential (12K cap): ₹{(() => {
                      const dailyCappedSteps = Math.min(selectedTier.dailyAverage, 12000);
                      const units = Math.floor(dailyCappedSteps / 25);
                      const paisa = units * selectedTier.rewardRate;
                      return (paisa / 100).toFixed(2);
                    })()}
                  </p>
                </div>
                
                <div className="bg-soft-lavender/10 rounded-lg p-4 border border-soft-lavender/20">
                  <h4 className="font-semibold text-soft-lavender mb-2">Spiritual Growth</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedTier.spiritualBenefit}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhaseJourney;