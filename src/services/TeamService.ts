import { supabase } from '@/integrations/supabase/client';

export class TeamService {
  /**
   * Create a virtual team
   */
  static async createTeam(data: {
    name: string;
    description: string;
    team_type: 'family' | 'friends' | 'workplace' | 'custom';
    goal_type: 'steps' | 'distance' | 'challenges';
    goal_value: number;
    max_members?: number;
    privacy_setting: 'public' | 'private';
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: team, error } = await supabase
        .from('virtual_teams')
        .insert({
          name: data.name,
          description: data.description,
          creator_id: user.user.id,
          is_public: data.privacy_setting === 'public',
          max_members: data.max_members || 10,
          team_goal_steps: data.goal_value,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-add captain as member
      await this.joinTeam(team.id, user.user.id, 'captain');

      return { success: true, team };
    } catch (error) {
      console.error('Failed to create team:', error);
      return { success: false, error };
    }
  }

  /**
   * Join a team
   */
  static async joinTeam(teamId: string, userId: string, role: 'captain' | 'member' = 'member') {
    try {
      const { data: member, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, member };
    } catch (error) {
      console.error('Failed to join team:', error);
      return { success: false, error };
    }
  }

  /**
   * Leave a team
   */
  static async leaveTeam(teamId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to leave team:', error);
      return { success: false, error };
    }
  }

  /**
   * Update team progress
   */
  static async updateTeamProgress(teamId: string) {
    try {
      // Get all team members
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members) return { success: false };

      const userIds = members.map(m => m.user_id);

      // Get today's steps for all members
      const { data: todaySteps } = await supabase
        .from('daily_steps')
        .select('steps')
        .in('user_id', userIds)
        .eq('date', new Date().toISOString().split('T')[0]);

      const totalSteps = todaySteps?.reduce((sum, s) => sum + s.steps, 0) || 0;

      // Update team progress in virtual_teams table
      await supabase
        .from('virtual_teams')
        .update({
          team_progress_steps: totalSteps,
        })
        .eq('id', teamId);

      // Check if goal reached
      const { data: team } = await supabase
        .from('virtual_teams')
        .select('team_goal_steps')
        .eq('id', teamId)
        .single();

      if (team && totalSteps >= team.team_goal_steps) {
        await this.celebrateTeamGoal(teamId);
      }

      return { success: true, totalSteps };
    } catch (error) {
      console.error('Failed to update team progress:', error);
      return { success: false, error };
    }
  }

  /**
   * Celebrate team goal achievement
   */
  static async celebrateTeamGoal(teamId: string) {
    try {
      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members) return { success: false };

      // Award bonus to all members
      const bonusPerMember = 100;

      for (const member of members) {
        // Get current wallet balance
        const { data: wallet } = await supabase
          .from('wallet_balances')
          .select('total_balance, total_earned')
          .eq('user_id', member.user_id)
          .single();

        if (wallet) {
          await supabase
            .from('wallet_balances')
            .update({
              total_balance: wallet.total_balance + bonusPerMember,
              total_earned: wallet.total_earned + bonusPerMember,
            })
            .eq('user_id', member.user_id);
        }

        await supabase.from('transactions').insert({
          user_id: member.user_id,
          type: 'team_goal',
          amount: bonusPerMember,
          description: 'Team goal achievement bonus',
          metadata: { team_id: teamId },
        });
      }

      return { success: true, membersRewarded: members.length };
    } catch (error) {
      console.error('Failed to celebrate team goal:', error);
      return { success: false, error };
    }
  }

  /**
   * Get team leaderboard
   */
  static async getTeamLeaderboard(teamId: string, period: 'today' | 'week' | 'month' = 'today') {
    try {
      const dateFilter = this.getDateFilter(period);

      const { data: members } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);

      if (!members) return { success: false };

      const userIds = members.map(m => m.user_id);

      const { data: leaderboard, error } = await supabase
        .from('daily_steps')
        .select('user_id, steps, paisa_earned')
        .in('user_id', userIds)
        .gte('date', dateFilter)
        .order('steps', { ascending: false });

      if (error) throw error;

      // Aggregate by user
      const userTotals = new Map();
      leaderboard?.forEach(entry => {
        const current = userTotals.get(entry.user_id) || { steps: 0, coins: 0 };
        userTotals.set(entry.user_id, {
          steps: current.steps + entry.steps,
          coins: current.coins + entry.paisa_earned,
        });
      });

      const rankings = Array.from(userTotals.entries()).map(([userId, stats]) => ({
        user_id: userId,
        ...stats,
      }));

      return { success: true, leaderboard: rankings };
    } catch (error) {
      console.error('Failed to get team leaderboard:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's teams
   */
  static async getUserTeams(userId: string) {
    try {
      const { data: memberships, error } = await supabase
        .from('team_members')
        .select(`
          *,
          team:team_id (
            *,
            captain:captain_id (id, full_name)
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return { success: true, memberships };
    } catch (error) {
      console.error('Failed to get user teams:', error);
      return { success: false, error };
    }
  }

  /**
   * Send team invitation
   */
  static async sendInvitation(teamId: string, inviteeUserId: string) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Use localStorage since team_invitations table doesn't exist
      const invitation = {
        id: crypto.randomUUID(),
        team_id: teamId,
        inviter_id: user.user.id,
        invitee_id: inviteeUserId,
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      const invitations = JSON.parse(localStorage.getItem('team_invitations') || '[]');
      invitations.push(invitation);
      localStorage.setItem('team_invitations', JSON.stringify(invitations));

      return { success: true, invitation };
    } catch (error) {
      console.error('Failed to send invitation:', error);
      return { success: false, error };
    }
  }

  /**
   * Helper: Get date filter for period
   */
  private static getDateFilter(period: 'today' | 'week' | 'month'): string {
    const today = new Date();
    switch (period) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return weekAgo.toISOString().split('T')[0];
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        return monthAgo.toISOString().split('T')[0];
    }
  }
}
