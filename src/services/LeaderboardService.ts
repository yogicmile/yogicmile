import { supabase } from '@/integrations/supabase/client';

/**
 * Service to populate and update leaderboards based on daily_steps data
 */
export class LeaderboardService {
  /**
   * Populate leaderboards from daily_steps data
   * This should be run periodically (e.g., nightly cron job)
   */
  static async populateLeaderboards() {
    try {
      // Get current date ranges
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);
      
      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - 1);

      // Weekly leaderboard - aggregate last 7 days
      await this.populateWeeklyLeaderboard(weekStart.toISOString().split('T')[0]);

      // Monthly leaderboard - aggregate last 30 days
      await this.populateMonthlyLeaderboard(monthStart.toISOString().split('T')[0]);

      // All-time leaderboard - aggregate all data
      await this.populateAllTimeLeaderboard();

      console.log('Leaderboards populated successfully');
    } catch (error) {
      console.error('Error populating leaderboards:', error);
      throw error;
    }
  }

  private static async populateWeeklyLeaderboard(startDate: string) {
    // Get weekly stats from daily_steps
    const { data: weeklyData, error } = await supabase
      .from('daily_steps')
      .select('user_id, steps, paisa_earned')
      .gte('date', startDate);

    if (error) throw error;

    // Aggregate by user
    const userStats = new Map<string, { steps: number; coins: number }>();
    weeklyData?.forEach(day => {
      const current = userStats.get(day.user_id) || { steps: 0, coins: 0 };
      userStats.set(day.user_id, {
        steps: current.steps + day.steps,
        coins: current.coins + day.paisa_earned,
      });
    });

    // Convert to array and sort
    const rankings = Array.from(userStats.entries())
      .map(([user_id, stats]) => ({ user_id, ...stats }))
      .sort((a, b) => b.steps - a.steps);

    // Delete existing weekly leaderboards
    await supabase
      .from('leaderboards')
      .delete()
      .eq('period', 'weekly')
      .eq('category', 'global');

    // Insert new rankings
    const leaderboardEntries = rankings.map((entry, index) => ({
      period: 'weekly' as const,
      category: 'global' as const,
      user_id: entry.user_id,
      rank_position: index + 1,
      steps: entry.steps,
      coins_earned: entry.coins,
      weeks_active: 1,
    }));

    if (leaderboardEntries.length > 0) {
      await supabase.from('leaderboards').insert(leaderboardEntries);
    }
  }

  private static async populateMonthlyLeaderboard(startDate: string) {
    // Get monthly stats from daily_steps
    const { data: monthlyData, error } = await supabase
      .from('daily_steps')
      .select('user_id, steps, paisa_earned')
      .gte('date', startDate);

    if (error) throw error;

    // Aggregate by user
    const userStats = new Map<string, { steps: number; coins: number }>();
    monthlyData?.forEach(day => {
      const current = userStats.get(day.user_id) || { steps: 0, coins: 0 };
      userStats.set(day.user_id, {
        steps: current.steps + day.steps,
        coins: current.coins + day.paisa_earned,
      });
    });

    // Convert to array and sort
    const rankings = Array.from(userStats.entries())
      .map(([user_id, stats]) => ({ user_id, ...stats }))
      .sort((a, b) => b.steps - a.steps);

    // Delete existing monthly leaderboards
    await supabase
      .from('leaderboards')
      .delete()
      .eq('period', 'monthly')
      .eq('category', 'global');

    // Insert new rankings
    const leaderboardEntries = rankings.map((entry, index) => ({
      period: 'monthly' as const,
      category: 'global' as const,
      user_id: entry.user_id,
      rank_position: index + 1,
      steps: entry.steps,
      coins_earned: entry.coins,
      weeks_active: 4,
    }));

    if (leaderboardEntries.length > 0) {
      await supabase.from('leaderboards').insert(leaderboardEntries);
    }
  }

  private static async populateAllTimeLeaderboard() {
    // Get all-time stats from user_phases
    const { data: allTimeData, error } = await supabase
      .from('user_phases')
      .select('user_id, total_lifetime_steps');

    if (error) throw error;

    // Sort by lifetime steps
    const rankings = (allTimeData || [])
      .filter(user => user.total_lifetime_steps > 0)
      .sort((a, b) => b.total_lifetime_steps - a.total_lifetime_steps);

    // Delete existing all-time leaderboards
    await supabase
      .from('leaderboards')
      .delete()
      .eq('period', 'all_time')
      .eq('category', 'global');

    // Get coins earned for each user
    const userIds = rankings.map(r => r.user_id);
    const { data: walletData } = await supabase
      .from('wallet_balances')
      .select('user_id, total_earned')
      .in('user_id', userIds);

    const coinsMap = new Map(
      walletData?.map(w => [w.user_id, w.total_earned]) || []
    );

    // Insert new rankings
    const leaderboardEntries = rankings.map((entry, index) => ({
      period: 'all_time' as const,
      category: 'global' as const,
      user_id: entry.user_id,
      rank_position: index + 1,
      steps: entry.total_lifetime_steps,
      coins_earned: coinsMap.get(entry.user_id) || 0,
      weeks_active: 0,
    }));

    if (leaderboardEntries.length > 0) {
      await supabase.from('leaderboards').insert(leaderboardEntries);
    }
  }

  /**
   * Manually trigger leaderboard population (for testing)
   */
  static async manualPopulate() {
    return this.populateLeaderboards();
  }
}
