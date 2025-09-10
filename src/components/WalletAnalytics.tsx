import { useState } from 'react';
import { TrendingUp, PieChart, Calendar, Target, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  type: string;
  amount: number;
  date: string;
  source?: string;
  item?: string;
}

interface WalletAnalyticsProps {
  totalEarnings: number;
  weeklyEarnings: number;
  transactionHistory: Transaction[];
}

export const WalletAnalytics = ({
  totalEarnings,
  weeklyEarnings,
  transactionHistory
}: WalletAnalyticsProps) => {
  const [activeInsight, setActiveInsight] = useState<'earning' | 'spending'>('earning');

  // Calculate insights from transaction data
  const earningInsights = {
    bestDay: 'Monday',
    averageDaily: Math.round(weeklyEarnings / 7),
    improvement: '+15%',
    streakDays: 12
  };

  const spendingInsights = {
    topCategory: 'Food & Dining',
    monthlySpending: 450,
    savingsRate: 65,
    favoriteVoucher: 'Amazon'
  };

  const achievements = [
    { title: 'Early Bird', description: 'Earned coins 5 days in a row', icon: '🌅', completed: true },
    { title: 'Big Spender', description: 'Spent ₹500+ this month', icon: '💸', completed: false },
    { title: 'Saver', description: 'Saved 50% of earnings', icon: '💰', completed: true },
    { title: 'Explorer', description: 'Used 5 different vouchers', icon: '🗺️', completed: false }
  ];

  const monthlyData = [
    { month: 'Sep', earned: 380, spent: 150 },
    { month: 'Aug', earned: 420, spent: 200 },
    { month: 'Jul', earned: 350, spent: 180 },
    { month: 'Jun', earned: 290, spent: 120 }
  ];

  return (
    <div className="space-y-6">
      {/* Insight Toggle */}
      <div className="flex bg-secondary/30 rounded-xl p-1">
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeInsight === 'earning' 
              ? 'bg-tier-1-paisa text-tier-1-paisa-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveInsight('earning')}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Earning Insights
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeInsight === 'spending' 
              ? 'bg-tier-1-paisa text-tier-1-paisa-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveInsight('spending')}
        >
          <PieChart className="w-4 h-4 inline mr-2" />
          Spending Insights
        </button>
      </div>

      {/* Earning Insights */}
      {activeInsight === 'earning' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Best Day</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-tier-1-paisa">{earningInsights.bestDay}</div>
                <p className="text-xs text-muted-foreground">Most active day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xl font-bold text-success">₹{earningInsights.averageDaily}</div>
                <p className="text-xs text-muted-foreground">Per day this week</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyData.map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{data.month} 2024</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-success">+₹{data.earned}</div>
                        <div className="text-xs text-muted-foreground">Earned</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-muted-foreground">-₹{data.spent}</div>
                        <div className="text-xs text-muted-foreground">Spent</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Spending Insights */}
      {activeInsight === 'spending' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Category</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-tier-3-token">{spendingInsights.topCategory}</div>
                <p className="text-xs text-muted-foreground">35% of spending</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Savings Rate</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg font-bold text-tier-1-paisa">{spendingInsights.savingsRate}%</div>
                <p className="text-xs text-muted-foreground">Above average!</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spending Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Food & Dining', amount: 180, percentage: 40, color: 'bg-red-500' },
                  { name: 'Shopping', amount: 135, percentage: 30, color: 'bg-blue-500' },
                  { name: 'Bills & Utilities', amount: 90, percentage: 20, color: 'bg-green-500' },
                  { name: 'Others', amount: 45, percentage: 10, color: 'bg-gray-500' }
                ].map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.name}</span>
                      <span className="font-semibold">₹{category.amount}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`${category.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4" />
            Wallet Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement, index) => (
              <div 
                key={index}
                className={`p-3 rounded-xl border-2 transition-all ${
                  achievement.completed 
                    ? 'bg-tier-1-paisa/10 border-tier-1-paisa/20' 
                    : 'bg-secondary/30 border-border/50'
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  {achievement.completed && (
                    <Badge variant="secondary" className="mt-2 bg-success/10 text-success">
                      ✓ Completed
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gamified Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-tier-1-paisa">Top 25%</div>
              <div className="text-xs text-muted-foreground">Earner Rank</div>
            </div>
            <div>
              <div className="text-lg font-bold text-tier-3-token">156</div>
              <div className="text-xs text-muted-foreground">Friends Ahead</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">89%</div>
              <div className="text-xs text-muted-foreground">Better Than</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};