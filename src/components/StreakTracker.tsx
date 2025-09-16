import { useState, useEffect } from 'react';
import { Flame, Target, Trophy, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useYogicData } from '@/hooks/use-yogic-data';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  todaysSteps: number;
  lastActivity: string | null;
  bonusEligible: boolean;
  streakBonusEarned: string | null;
}

export const StreakTracker = () => {
  const { user } = useAuth();
  const yogicData = useYogicData();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    todaysSteps: 0,
    lastActivity: null,
    bonusEligible: true,
    streakBonusEarned: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user, yogicData.dailyProgress.currentSteps]);

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get or create streak record
      let { data: streak } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!streak) {
        // Create new streak record
        const { data: newStreak, error } = await supabase
          .from('streaks')
          .insert({
            user_id: user.id,
            current_streak_days: 0,
            longest_streak: 0,
            last_activity_date: null,
            bonus_eligibility: true
          })
          .select()
          .single();

        if (error) throw error;
        streak = newStreak;
      }

      // Get today's steps
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySteps } = await supabase
        .from('daily_steps')
        .select('steps')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      setStreakData({
        currentStreak: streak.current_streak_days,
        longestStreak: streak.longest_streak,
        todaysSteps: todaySteps?.steps || yogicData.dailyProgress.currentSteps,
        lastActivity: streak.last_activity_date,
        bonusEligible: streak.bonus_eligibility,
        streakBonusEarned: streak.streak_bonus_earned_date
      });

      // Update streak if user reached 5000+ steps today
      const hasReachedGoal = (todaySteps?.steps || yogicData.dailyProgress.currentSteps) >= 5000;
      if (hasReachedGoal && streak.last_5k_steps_date !== today) {
        await updateStreak(streak, true);
      }

    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = async (currentStreak: any, reachedGoal: boolean) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreakDays = currentStreak.current_streak_days;

    if (reachedGoal) {
      // Check if this continues a streak
      if (currentStreak.last_5k_steps_date === yesterdayStr) {
        newStreakDays += 1;
      } else {
        newStreakDays = 1; // Start new streak
      }

      // Check if user earned 7-day streak bonus
      if (newStreakDays === 7 && currentStreak.streak_bonus_earned_date !== today) {
        await awardStreakBonus();
        
        // Reset streak counter after awarding bonus
        newStreakDays = 0;
      }

      await supabase
        .from('streaks')
        .update({
          current_streak_days: newStreakDays,
          longest_streak: Math.max(newStreakDays, currentStreak.longest_streak),
          last_5k_steps_date: today,
          last_activity_date: today,
          streak_bonus_earned_date: newStreakDays === 7 ? today : currentStreak.streak_bonus_earned_date
        })
        .eq('user_id', user.id);

      setStreakData(prev => ({
        ...prev,
        currentStreak: newStreakDays,
        longestStreak: Math.max(newStreakDays, prev.longestStreak)
      }));
    }
  };

  const awardStreakBonus = async () => {
    if (!user) return;

    try {
      const bonusAmount = 500; // 500 paisa = ₹5.00

      // Log the streak bonus
      await supabase.from('bonus_logs').insert({
        user_id: user.id,
        bonus_type: 'streak',
        amount_paisa: bonusAmount,
        description: '7-day walking streak bonus'
      });

      // Update wallet balance
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned')
        .eq('user_id', user.id)
        .single();

      if (wallet) {
        await supabase
          .from('wallet_balances')
          .update({
            total_balance: wallet.total_balance + bonusAmount,
            total_earned: wallet.total_earned + bonusAmount
          })
          .eq('user_id', user.id);
      }

      // Add transaction record
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'bonus',
        amount: bonusAmount,
        description: '7-day streak bonus',
        item_name: 'Streak Bonus'
      });

    } catch (error) {
      console.error('Error awarding streak bonus:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Streak Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-secondary/20 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (streakData.currentStreak / 7) * 100;
  const daysRemaining = 7 - streakData.currentStreak;
  const hasReachedTodaysGoal = streakData.todaysSteps >= 5000;
  const streakIcon = streakData.currentStreak >= 3 ? '🔥' : '📈';

  return (
    <Card className={`border-orange-200 ${streakData.currentStreak >= 3 ? 'bg-gradient-to-br from-orange-50 to-red-50' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          {streakIcon} Streak Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Streak Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {streakData.currentStreak}/7 Days
          </div>
          <Progress value={progressPercentage} className="w-full mb-2" />
          <p className="text-sm text-muted-foreground">
            {daysRemaining > 0 
              ? `${daysRemaining} more days to earn ₹5 bonus` 
              : 'Ready for streak bonus!'
            }
          </p>
        </div>

        {/* Today's Progress */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Goal:</span>
            <Badge variant={hasReachedTodaysGoal ? "default" : "secondary"}>
              {hasReachedTodaysGoal ? "✓ Complete" : "In Progress"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">
              {streakData.todaysSteps.toLocaleString()} / 5,000 steps
            </span>
            <Target className={`w-5 h-5 ${hasReachedTodaysGoal ? 'text-green-500' : 'text-gray-400'}`} />
          </div>
          <Progress 
            value={(streakData.todaysSteps / 5000) * 100} 
            className="w-full mt-2" 
          />
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-primary">
              {streakData.longestStreak}
            </div>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
          <div>
            <div className="text-xl font-bold text-green-600">
              ₹5.00
            </div>
            <p className="text-xs text-muted-foreground">Streak Reward</p>
          </div>
        </div>

        {/* Motivation Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          {streakData.currentStreak === 0 ? (
            <p className="text-sm text-blue-800">
              🚀 Start your streak! Walk 5,000+ steps today
            </p>
          ) : streakData.currentStreak < 7 ? (
            <p className="text-sm text-blue-800">
              💪 Great progress! {daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'} for your ₹5 bonus
            </p>
          ) : (
            <p className="text-sm text-green-800">
              🏆 Streak complete! Keep walking to start a new streak
            </p>
          )}
        </div>

        {/* Reminder */}
        {!hasReachedTodaysGoal && (
          <div className="text-center">
            <p className="text-xs text-orange-600 font-medium">
              💡 Walk {(5000 - streakData.todaysSteps).toLocaleString()} more steps to maintain streak!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};