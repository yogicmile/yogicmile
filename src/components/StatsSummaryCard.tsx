import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Coins, 
  Target, 
  Flame,
  Award
} from 'lucide-react';
import footprintIcon from '@/assets/footprint-icon.png';

interface StatsSummaryCardProps {
  totalCoins: number;
  totalSteps: number;
  redemptionRate: number;
  period: string;
}

const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  totalCoins,
  totalSteps,
  redemptionRate,
  period
}) => {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week': return 'this week';
      case 'month': return 'this month';
      case 'all': return 'all time';
      default: return 'this period';
    }
  };

  const getRedemptionStreak = () => {
    // Mock streak calculation
    return Math.floor(Math.random() * 15) + 1;
  };

  const getMotivationalMessage = () => {
    if (redemptionRate >= 90) {
      return "Exceptional mindful consistency! 🌟";
    } else if (redemptionRate >= 70) {
      return "Great dedication to your fitness! 💪";
    } else if (redemptionRate >= 50) {
      return "Keep up the mindful momentum! 🚶‍♀️";
    } else {
      return "Every step is a step towards wellness! 💫";
    }
  };

  const streak = getRedemptionStreak();
  const motivationalMessage = getMotivationalMessage();
  const averageStepsPerDay = period === 'week' ? Math.round(totalSteps / 7) : 
                            period === 'month' ? Math.round(totalSteps / 30) : 
                            Math.round(totalSteps / 365);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-5 h-5 text-primary" />
          Summary Statistics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your achievements {getPeriodLabel(period)}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-muted-foreground">Total Coins</span>
            </div>
            <div className="text-2xl font-bold text-yellow-700">
              {totalCoins}
            </div>
            <div className="text-xs text-muted-foreground">
              ≈ ₹{(totalCoins * 0.01).toFixed(2)}
            </div>
          </div>

          <div className="text-center p-3 bg-white/50 rounded-lg border">
            <div className="flex items-center justify-center gap-1 mb-1">
              <img src={footprintIcon} alt="steps" className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">Total Steps</span>
            </div>
            <div className="text-2xl font-bold text-primary">
              {totalSteps.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              ~{averageStepsPerDay}/day avg
            </div>
          </div>
        </div>

        {/* Redemption Rate */}
        <div className="p-3 bg-white/50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Redemption Rate</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {redemptionRate}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${redemptionRate}%` }}
            />
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            {redemptionRate}% of coins redeemed {getPeriodLabel(period)}
          </div>
        </div>

        {/* Streak Information */}
        <div className="p-3 bg-white/50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Redemption Streak</span>
            </div>
            <span className="text-lg font-bold text-orange-600">
              {streak} days
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Current consecutive redemption streak
          </div>
        </div>

        {/* Motivational Message */}
        <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="text-sm font-medium text-primary mb-1">
              {motivationalMessage}
            </div>
            <div className="text-xs text-muted-foreground">
              Keep walking mindfully and watch your rewards grow
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>Best day: {Math.max(100, Math.round(totalCoins / 7))} coins</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <img src={footprintIcon} alt="steps" className="w-3 h-3" />
            <span>Distance: ~{Math.round(totalSteps * 0.0008)} km</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsSummaryCard;