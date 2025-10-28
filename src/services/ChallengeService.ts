import { supabase } from '@/integrations/supabase/client';

export class ChallengeService {
  /**
   * Create a new challenge
   */
  static async createChallenge(data: {
    title: string;
    description: string;
    goal_type: 'steps' | 'distance' | 'duration' | 'photo';
    target_value: number;
    start_date: string;
    end_date: string;
    privacy_setting: 'public' | 'private' | 'friends';
    reward_type?: string;
    reward_items?: any[];
    community_id?: string;
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: challenge, error } = await supabase
        .from('challenges')
        .insert({
          title: data.title,
          description: data.description,
          goal_type: data.goal_type,
          target_value: data.target_value,
          start_date: data.start_date,
          end_date: data.end_date,
          creator_id: user.user.id,
          privacy_setting: data.privacy_setting,
          reward_type: data.reward_type || 'coins',
          reward_items: data.reward_items || [],
          community_id: data.community_id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator
      await this.joinChallenge(challenge.id, user.user.id);

      return { success: true, challenge };
    } catch (error) {
      console.error('Failed to create challenge:', error);
      return { success: false, error };
    }
  }

  /**
   * Join a challenge
   */
  static async joinChallenge(challengeId: string, userId: string) {
    try {
      const { data: participant, error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, participant };
    } catch (error) {
      console.error('Failed to join challenge:', error);
      return { success: false, error };
    }
  }

  /**
   * Submit challenge progress (updates current_contribution)
   */
  static async submitProgress(data: {
    challenge_id: string;
    progress_value: number;
    progress_type: 'steps' | 'distance' | 'duration' | 'photo';
    photo_url?: string;
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Update participant progress directly
      await this.updateParticipantProgress(data.challenge_id, user.user.id, data.progress_value);

      // If photo proof required, save it
      if (data.photo_url) {
        await supabase.from('challenge_completion_photos').insert({
          challenge_id: data.challenge_id,
          user_id: user.user.id,
          photo_url: data.photo_url,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to submit progress:', error);
      return { success: false, error };
    }
  }

  /**
   * Update participant's total progress
   */
  static async updateParticipantProgress(challengeId: string, userId: string, additionalProgress: number) {
    try {
      const { data: participant } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (!participant) throw new Error('Participant not found');

      const newProgress = (participant.current_contribution || 0) + additionalProgress;

      // Check if goal is reached
      const { data: challenge } = await supabase
        .from('challenges')
        .select('target_value, reward_items')
        .eq('id', challengeId)
        .single();

      const isCompleted = challenge && newProgress >= challenge.target_value;

      const { error } = await supabase
        .from('challenge_participants')
        .update({
          current_contribution: newProgress,
          status: isCompleted ? 'completed' : 'active',
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;

      // Award rewards if completed
      if (isCompleted) {
        await this.awardChallengeCompletion(challengeId, userId);
      }

      return { success: true, isCompleted, newProgress };
    } catch (error) {
      console.error('Failed to update participant progress:', error);
      return { success: false, error };
    }
  }

  /**
   * Award rewards for challenge completion
   */
  static async awardChallengeCompletion(challengeId: string, userId: string) {
    try {
      const { data: challenge } = await supabase
        .from('challenges')
        .select('reward_items, reward_type, title')
        .eq('id', challengeId)
        .single();

      if (!challenge || !challenge.reward_items) {
        return { success: true };
      }

      // Type guard and calculate total reward amount
      const items = challenge.reward_items as any[];
      if (!Array.isArray(items) || items.length === 0) {
        return { success: true };
      }

      const rewardAmount = items.reduce((sum: number, item: any) => {
        return sum + (item.amount || 0);
      }, 0);

      if (rewardAmount <= 0) return { success: true };

      // Fetch current balance and update
      const { data: wallet } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned')
        .eq('user_id', userId)
        .single();

      if (wallet) {
        await supabase
          .from('wallet_balances')
          .update({
            total_balance: wallet.total_balance + rewardAmount,
            total_earned: wallet.total_earned + rewardAmount,
          })
          .eq('user_id', userId);
      }

      // Log transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'challenge_reward',
        amount: rewardAmount,
        description: `Completed: ${challenge.title}`,
        metadata: { challenge_id: challengeId },
      });

      return { success: true, reward: rewardAmount };
    } catch (error) {
      console.error('Failed to award challenge completion:', error);
      return { success: false, error };
    }
  }

  /**
   * Get active challenges
   */
  static async getActiveChallenges(filters?: {
    type?: string;
    privacy?: string;
    community_id?: string;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('challenges')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false }) as any;

      if (filters?.type) query = query.eq('challenge_type', filters.type);
      if (filters?.privacy) query = query.eq('privacy_setting', filters.privacy);
      if (filters?.community_id) query = query.eq('community_id', filters.community_id);
      if (filters?.limit) query = query.limit(filters.limit);

      const { data: challenges, error } = await query;

      if (error) throw error;
      return { success: true, challenges };
    } catch (error) {
      console.error('Failed to get active challenges:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's challenges
   */
  static async getUserChallenges(userId: string) {
    try {
      const { data: participations, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          challenge:challenge_id (
            *,
            creator:creator_id (id, full_name)
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return { success: true, participations };
    } catch (error) {
      console.error('Failed to get user challenges:', error);
      return { success: false, error };
    }
  }

  /**
   * Get challenge leaderboard
   */
  static async getChallengeLeaderboard(challengeId: string, limit = 10) {
    try {
      const { data: leaderboard, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('current_contribution', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, leaderboard };
    } catch (error) {
      console.error('Failed to get challenge leaderboard:', error);
      return { success: false, error };
    }
  }

  /**
   * Validate photo challenge submission
   */
  static async validatePhotoSubmission(challengeId: string, photoUrl: string, userId: string) {
    try {
      // Check if user already submitted
      const { data: existing } = await supabase
        .from('challenge_completion_photos')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return { success: false, error: 'Photo already submitted' };
      }

      // Submit progress
      return await this.submitProgress({
        challenge_id: challengeId,
        progress_value: 1,
        progress_type: 'photo',
        photo_url: photoUrl,
      });
    } catch (error) {
      console.error('Failed to validate photo submission:', error);
      return { success: false, error };
    }
  }
}
