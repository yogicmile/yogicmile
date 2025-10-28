import { supabase } from '@/integrations/supabase/client';
import type { Community, CommunityMember } from '@/types/community';

export class CommunityService {
  /**
   * Create a new community
   */
  static async createCommunity(data: {
    name: string;
    description: string;
    privacy_setting: 'public' | 'private';
    category?: string;
    location?: string;
    cover_image_url?: string;
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: community, error } = await supabase
        .from('communities')
        .insert({
          ...data,
          creator_id: user.user.id,
          member_count: 1,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator as member
      await this.joinCommunity(community.id, user.user.id);

      return { success: true, community };
    } catch (error) {
      console.error('Failed to create community:', error);
      return { success: false, error };
    }
  }

  /**
   * Get community by ID with member info
   */
  static async getCommunity(communityId: string) {
    try {
      const { data: community, error } = await supabase
        .from('communities')
        .select(`
          *,
          creator:creator_id (
            id,
            full_name,
            mobile_number
          )
        `)
        .eq('id', communityId)
        .single();

      if (error) throw error;
      return { success: true, community };
    } catch (error) {
      console.error('Failed to get community:', error);
      return { success: false, error };
    }
  }

  /**
   * List communities with filters
   */
  static async listCommunities(filters?: {
    category?: string;
    location?: string;
    search?: string;
    privacy?: 'public' | 'private';
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('communities')
        .select('*, creator:creator_id(id, full_name)')
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.privacy) {
        query = query.eq('privacy_setting', filters.privacy);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data: communities, error } = await query;

      if (error) throw error;
      return { success: true, communities };
    } catch (error) {
      console.error('Failed to list communities:', error);
      return { success: false, error };
    }
  }

  /**
   * Join a community
   */
  static async joinCommunity(communityId: string, userId: string) {
    try {
      const { data: member, error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId,
          role: 'member',
        })
        .select()
        .single();

      if (error) throw error;

      // Update member count
      await supabase.rpc('increment_community_members', { community_id: communityId });

      return { success: true, member };
    } catch (error) {
      console.error('Failed to join community:', error);
      return { success: false, error };
    }
  }

  /**
   * Leave a community
   */
  static async leaveCommunity(communityId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update member count
      await supabase.rpc('decrement_community_members', { community_id: communityId });

      return { success: true };
    } catch (error) {
      console.error('Failed to leave community:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's communities
   */
  static async getUserCommunities(userId: string) {
    try {
      const { data: memberships, error } = await supabase
        .from('community_members')
        .select(`
          *,
          community:community_id (
            *,
            creator:creator_id (id, full_name)
          )
        `)
        .eq('user_id', userId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return { success: true, memberships };
    } catch (error) {
      console.error('Failed to get user communities:', error);
      return { success: false, error };
    }
  }

  /**
   * Create a forum post
   */
  static async createForumPost(data: {
    community_id: string;
    title: string;
    content: string;
    post_type?: string;
    media_urls?: string[];
  }) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: post, error } = await supabase
        .from('forum_posts')
        .insert({
          ...data,
          author_id: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, post };
    } catch (error) {
      console.error('Failed to create forum post:', error);
      return { success: false, error };
    }
  }

  /**
   * Get forum posts for a community
   */
  static async getForumPosts(communityId: string, limit = 20) {
    try {
      const { data: posts, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:author_id (id, full_name),
          comments:forum_comments(count)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, posts };
    } catch (error) {
      console.error('Failed to get forum posts:', error);
      return { success: false, error };
    }
  }

  /**
   * Add comment to forum post
   */
  static async addComment(postId: string, content: string) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: comment, error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          author_id: user.user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, comment };
    } catch (error) {
      console.error('Failed to add comment:', error);
      return { success: false, error };
    }
  }

  /**
   * Update community activity stats
   */
  static async updateCommunityStats(communityId: string) {
    try {
      const { data: stats, error } = await supabase
        .from('community_stats')
        .select('*')
        .eq('community_id', communityId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const updates = {
        community_id: communityId,
        total_posts: stats ? stats.total_posts + 1 : 1,
        last_activity_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('community_stats')
        .upsert(updates);

      if (upsertError) throw upsertError;
      return { success: true };
    } catch (error) {
      console.error('Failed to update community stats:', error);
      return { success: false, error };
    }
  }
}
