import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface CoinHistoryEntry {
  id: string;
  date: Date;
  steps: number;
  coinsEarned: number;
  status: 'redeemed' | 'expired' | 'pending';
}

interface CoinsHistoryChartProps {
  data: CoinHistoryEntry[];
}

const CoinsHistoryChart: React.FC<CoinsHistoryChartProps> = ({ data }) => {
  const last7Days = data.slice(0, 7).reverse();
  const maxCoins = Math.max(...last7Days.map(d => d.coinsEarned), 100);
  const averageCoins = Math.round(last7Days.reduce((sum, d) => sum + d.coinsEarned, 0) / last7Days.length);
  const bestDay = Math.max(...last7Days.map(d => d.coinsEarned));

  const getDayLabel = (date: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">7-Day Earning Trend</CardTitle>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>Average: {averageCoins} coins/day</span>
          </div>
          <div>Best: {bestDay} coins</div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-40 flex items-end justify-between gap-2">
          {last7Days.map((entry, index) => {
            const height = (entry.coinsEarned / maxCoins) * 120;
            return (
              <div key={entry.id} className="flex-1 flex flex-col items-center">
                <div className="relative group cursor-pointer">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all hover:from-primary/80 hover:to-primary/40"
                    style={{ height: `${Math.max(height, 8)}px` }}
                  />
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {entry.coinsEarned} coins
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-foreground"></div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mt-2 text-center">
                  {getDayLabel(entry.date)}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
          <span>0</span>
          <span>{Math.round(maxCoins / 2)}</span>
          <span>{maxCoins}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinsHistoryChart;