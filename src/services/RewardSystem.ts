import { supabase } from '@/integrations/supabase/client';

export class RewardSystem {
  /**
   * Calculate reward multipliers based on user activity
   */
  static async calculateMultiplier(userId: string) {
    try {
      const { data: user } = await supabase
        .from('user_phases')
        .select('current_phase')
        .eq('user_id', userId)
        .single();

      if (!user) return 1.0;

      let multiplier = 1.0;

      // Phase bonus (0.1x per phase)
      multiplier += (user.current_phase - 1) * 0.1;

      return parseFloat(multiplier.toFixed(2));
    } catch (error) {
      console.error('Failed to calculate multiplier:', error);
      return 1.0;
    }
  }

  /**
   * Award steps with rewards
   */
  static async awardSteps(userId: string, steps: number, source: string) {
    try {
      const multiplier = await this.calculateMultiplier(userId);
      const baseCoins = Math.floor(steps / 25); // 25 steps = 1 coin
      const finalCoins = Math.floor(baseCoins * multiplier);

      // Get current daily steps
      const { data: dailySteps } = await supabase
        .from('daily_steps')
        .select('steps, paisa_earned')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      // Upsert daily steps
      await supabase
        .from('daily_steps')
        .upsert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          steps: (dailySteps?.steps || 0) + steps,
          paisa_earned: (dailySteps?.paisa_earned || 0) + finalCoins,
          phase_id: 1,
          phase_rate: 1,
        });

      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        await supabase
          .from('wallet_balances')
          .update({
            total_balance: wallet.total_balance + finalCoins,
            total_earned: wallet.total_earned + finalCoins,
          })
          .eq('user_id', userId);
      }

      // Log transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: source,
        amount: finalCoins,
        description: `${steps} steps converted to coins (${multiplier}x multiplier)`,
        metadata: { steps, multiplier, source },
      });

      return { success: true, coins: finalCoins, multiplier };
    } catch (error) {
      console.error('Failed to award steps:', error);
      return { success: false, error };
    }
  }

  /**
   * Award bonus rewards
   */
  static async awardBonus(
    userId: string,
    bonusType: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ) {
    try {
      // Get current wallet balance
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        await supabase
          .from('wallet_balances')
          .update({
            total_balance: wallet.total_balance + amount,
            total_earned: wallet.total_earned + amount,
          })
          .eq('user_id', userId);
      }

      // Log bonus
      await supabase.from('bonus_logs').insert({
        user_id: userId,
        bonus_type: bonusType,
        amount_paisa: amount,
        description,
        date_earned: new Date().toISOString().split('T')[0],
      });

      // Log transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: bonusType,
        amount,
        description,
        metadata,
      });

      return { success: true, amount };
    } catch (error) {
      console.error('Failed to award bonus:', error);
      return { success: false, error };
    }
  }

  /**
   * Check and award milestone rewards
   */
  static async checkMilestones(userId: string) {
    try {
      const { data: userPhase } = await supabase
        .from('user_phases')
        .select('total_lifetime_steps, current_phase')
        .eq('user_id', userId)
        .single();

      if (!userPhase) return { success: false };

      const milestones = [
        { steps: 100000, reward: 500, name: '100K Steps' },
        { steps: 250000, reward: 1500, name: '250K Steps' },
        { steps: 500000, reward: 3000, name: '500K Steps' },
        { steps: 1000000, reward: 7500, name: '1M Steps' },
      ];

      const earned = [];

      for (const milestone of milestones) {
        if (userPhase.total_lifetime_steps >= milestone.steps) {
          // Check if already awarded
          const { data: existing } = await supabase
            .from('bonus_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('bonus_type', 'milestone')
            .eq('description', milestone.name)
            .single();

          if (!existing) {
            await this.awardBonus(
              userId,
              'milestone',
              milestone.reward,
              milestone.name,
              { milestone_steps: milestone.steps }
            );
            earned.push(milestone);
          }
        }
      }

      return { success: true, milestones: earned };
    } catch (error) {
      console.error('Failed to check milestones:', error);
      return { success: false, error };
    }
  }

  /**
   * Award streak bonus
   */
  static async awardStreakBonus(userId: string, streakDays: number) {
    try {
      // Award bonus every 7 days
      if (streakDays % 7 !== 0) return { success: true, awarded: false };

      const bonusAmount = Math.floor(streakDays / 7) * 100; // 100 coins per week

      await this.awardBonus(
        userId,
        'streak_bonus',
        bonusAmount,
        `${streakDays}-day streak bonus`,
        { streak_days: streakDays }
      );

      return { success: true, awarded: true, amount: bonusAmount };
    } catch (error) {
      console.error('Failed to award streak bonus:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user reward summary
   */
  static async getRewardSummary(userId: string) {
    try {
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: todaySteps } = await supabase
        .from('daily_steps')
        .select('steps, paisa_earned')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      const { data: recentBonuses } = await supabase
        .from('bonus_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const multiplier = await this.calculateMultiplier(userId);

      return {
        success: true,
        wallet,
        todaySteps,
        recentBonuses,
        multiplier,
      };
    } catch (error) {
      console.error('Failed to get reward summary:', error);
      return { success: false, error };
    }
  }

  /**
   * Award social engagement rewards
   */
  static async awardSocialEngagement(
    userId: string,
    engagementType: 'like' | 'comment' | 'share' | 'post',
    targetId: string
  ) {
    try {
      const rewards = {
        like: 1,
        comment: 3,
        share: 5,
        post: 10,
      };

      const amount = rewards[engagementType];

      await this.awardBonus(
        userId,
        'social_engagement',
        amount,
        `${engagementType} engagement reward`,
        { engagement_type: engagementType, target_id: targetId }
      );

      return { success: true, amount };
    } catch (error) {
      console.error('Failed to award social engagement:', error);
      return { success: false, error };
    }
  }
}
