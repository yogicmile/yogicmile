import React from 'react';
import { Gift, Star, Zap, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const RewardsPage = () => {
  const rewards = [
    {
      id: 1,
      title: '₹10 Cashback',
      description: 'Minimum 1000 coins required',
      coins: 1000,
      category: 'cashback',
      icon: <Gift className="w-6 h-6" />,
      available: true
    },
    {
      id: 2,
      title: 'Spin Wheel',
      description: 'Win surprise rewards',
      coins: 500,
      category: 'game',
      icon: <Zap className="w-6 h-6" />,
      available: true
    },
    {
      id: 3,
      title: 'Premium Voucher',
      description: 'Exclusive store discounts',
      coins: 2000,
      category: 'voucher',
      icon: <Star className="w-6 h-6" />,
      available: false
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-tier-1-paisa" />
            <h1 className="text-2xl font-bold text-foreground">Rewards</h1>
          </div>
          <p className="text-muted-foreground">Redeem your coins for amazing rewards</p>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-tier-1-paisa to-tier-2-rupaya text-white">
          <CardContent className="p-4 text-center">
            <p className="text-sm opacity-80">Your Balance</p>
            <p className="text-3xl font-bold">2,450 coins</p>
            <p className="text-sm opacity-80">₹24.50</p>
          </CardContent>
        </Card>

        {/* Available Rewards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Available Rewards</h2>
          {rewards.map((reward) => (
            <Card key={reward.id} className={`${!reward.available ? 'opacity-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      {reward.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{reward.coins} coins</Badge>
                        <Badge variant="outline" className="text-xs">
                          {reward.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    disabled={!reward.available}
                    variant={reward.available ? "default" : "secondary"}
                  >
                    {reward.available ? 'Redeem' : 'Locked'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon */}
        <Card className="border-dashed">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-semibold text-foreground">More Rewards Coming Soon!</h3>
            <p className="text-sm text-muted-foreground">Keep walking to unlock amazing offers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};