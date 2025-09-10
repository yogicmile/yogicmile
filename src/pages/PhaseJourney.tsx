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

  // Mock tier data for all 9 phases
  const allTiers: TierInfo[] = [
    {
      id: 1,
      symbol: '🟡',
      name: 'Paisa Phase',
      spiritualName: 'Foundation of Discipline',
      stepGoal: 200000,
      timeLimit: 30,
      dailyAverage: 6667,
      rewardRate: 1,
      spiritualBenefit: 'Build foundation of discipline and commitment to the path',
      status: 'current',
      coinsEarned: 1250
    },
    {
      id: 2,
      symbol: '🪙',
      name: 'Coin Phase',
      spiritualName: 'Consistent Practice',
      stepGoal: 300000,
      timeLimit: 45,
      dailyAverage: 6667,
      rewardRate: 2,
      spiritualBenefit: 'Develop consistent practice and mindful awareness',
      status: 'locked'
    },
    {
      id: 3,
      symbol: '🎯',
      name: 'Token Phase',
      spiritualName: 'Strengthened Willpower',
      stepGoal: 500000,
      timeLimit: 60,
      dailyAverage: 8334,
      rewardRate: 3,
      spiritualBenefit: 'Strengthen willpower and mental resilience',
      status: 'locked'
    },
    {
      id: 4,
      symbol: '💎',
      name: 'Gem Phase',
      spiritualName: 'Inner Clarity',
      stepGoal: 750000,
      timeLimit: 75,
      dailyAverage: 10000,
      rewardRate: 5,
      spiritualBenefit: 'Achieve inner clarity and focused intention',
      status: 'locked'
    },
    {
      id: 5,
      symbol: '💠',
      name: 'Diamond Phase',
      spiritualName: 'Unshakeable Focus',
      stepGoal: 1000000,
      timeLimit: 90,
      dailyAverage: 11111,
      rewardRate: 7,
      spiritualBenefit: 'Cultivate unshakeable focus and determination',
      status: 'locked'
    },
    {
      id: 6,
      symbol: '👑',
      name: 'Crown Phase',
      spiritualName: 'Mastery of Self',
      stepGoal: 1500000,
      timeLimit: 120,
      dailyAverage: 12500,
      rewardRate: 10,
      spiritualBenefit: 'Master self-discipline and inner sovereignty',
      status: 'locked'
    },
    {
      id: 7,
      symbol: '⚡',
      name: 'Emperor Phase',
      spiritualName: 'Transcendent Power',
      stepGoal: 2000000,
      timeLimit: 150,
      dailyAverage: 13333,
      rewardRate: 15,
      spiritualBenefit: 'Access transcendent power and wisdom',
      status: 'locked'
    },
    {
      id: 8,
      symbol: '🌟',
      name: 'Legend Phase',
      spiritualName: 'Enlightened Being',
      stepGoal: 3000000,
      timeLimit: 200,
      dailyAverage: 15000,
      rewardRate: 20,
      spiritualBenefit: 'Become an enlightened being of pure awareness',
      status: 'locked'
    },
    {
      id: 9,
      symbol: '🔥',
      name: 'Immortal Phase',
      spiritualName: 'Eternal Consciousness',
      stepGoal: 5000000,
      timeLimit: 300,
      dailyAverage: 16667,
      rewardRate: 30,
      spiritualBenefit: 'Achieve eternal consciousness and cosmic unity',
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
                      {tier.rewardRate} paisa per 100 steps
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Daily potential: ₹{Math.round((tier.dailyAverage / 100) * tier.rewardRate)}
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
                    Earn up to {Math.round(((tier.rewardRate / allTiers[0].rewardRate) - 1) * 100)}% more coins
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
                  ₹{yogicData.wallet.mockData.totalBalance}
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
          <div className="text-4xl mb-3">🧘‍♀️</div>
          <blockquote className="text-base font-medium text-foreground italic leading-relaxed max-w-sm mx-auto">
            "The journey of a thousand miles begins with a single step. Every phase brings you closer to enlightenment."
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
                    <strong>{selectedTier.rewardRate} paisa per 100 steps</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Daily earning potential: ₹{Math.round((selectedTier.dailyAverage / 100) * selectedTier.rewardRate)}
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