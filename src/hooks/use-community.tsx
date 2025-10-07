import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LeaderboardService } from '@/services/LeaderboardService';
import type { 
  UserProfile, 
  Friendship, 
  FriendshipWithProfile,
  LeaderboardEntry,
  Challenge,
  ChallengeParticipant,
  Message,
  ForumPost,
  ForumComment,
  CommunityStats,
  ActivityFeedItem
} from '@/types/community';

export const useCommunity = () => {
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([]);
  const { toast } = useToast();

  // Initialize user profile
  const initializeUserProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || 'Yogic Walker'
          })
          .select()
          .single();

        if (createError) throw createError;
        setUserProfile(newProfile as UserProfile);
      } else if (error) {
        throw error;
      } else {
        setUserProfile(profile as UserProfile);
      }
    } catch (error) {
      console.error('Error initializing user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userProfile.user_id)
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data as UserProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile, toast]);

  // Search users
  const searchUsers = useCallback(async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`display_name.ilike.%${query}%,location_city.ilike.%${query}%`)
        .eq('profile_visibility', 'public')
        .limit(20);

      if (error) throw error;

      return (data || []) as UserProfile[];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  // Friend requests
  const sendFriendRequest = useCallback(async (addresseeId: string, message?: string) => {
    if (!userProfile) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: userProfile.user_id,
          addressee_id: addresseeId,
          request_message: message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request sent!"
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userProfile, toast]);

  const respondToFriendRequest = useCallback(async (friendshipId: string, accept: boolean) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('friendships')
        .update({
          status: accept ? 'accepted' : 'blocked',
          accepted_at: accept ? new Date().toISOString() : null
        })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: accept ? "Friend request accepted!" : "Friend request declined"
      });

      // Refresh friends list
      loadFriends();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load friends and friend requests
  const loadFriends = useCallback(async () => {
    if (!userProfile) return;

    try {
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${userProfile.user_id},addressee_id.eq.${userProfile.user_id}`)
        .order('created_at', { ascending: false });

      if (friendshipsError) throw friendshipsError;

      // Get unique user IDs from friendships
      const userIds = new Set<string>();
      friendshipsData?.forEach(friendship => {
        userIds.add(friendship.requester_id);
        userIds.add(friendship.addressee_id);
      });

      // Fetch all related profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create profile lookup map
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile as UserProfile]) || []
      );

      // Attach profiles to friendships
      const friendshipsWithProfiles = friendshipsData?.map(friendship => ({
        ...friendship,
        requester_profile: profilesMap.get(friendship.requester_id),
        addressee_profile: profilesMap.get(friendship.addressee_id),
      })) || [];

      setFriends(friendshipsWithProfiles as FriendshipWithProfile[]);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends list",
        variant: "destructive"
      });
    }
  }, [userProfile, toast]);

  // Get leaderboards
  const getLeaderboards = useCallback(async (period: 'weekly' | 'monthly' | 'all_time', category: 'global' | 'friends' | 'local') => {
    try {
      let query = supabase
        .from('leaderboards')
        .select('*')
        .eq('period', period)
        .eq('category', category)
        .order('rank_position', { ascending: true })
        .limit(100);

      // If friends category and user has profile, filter by friends
      if (category === 'friends' && userProfile) {
        const friendIds = friends
          .filter(f => f.status === 'accepted')
          .map(f => f.requester_id === userProfile.user_id ? f.addressee_id : f.requester_id);
        
        if (friendIds.length > 0) {
          query = query.in('user_id', friendIds);
        } else {
          // No friends yet, return empty
          return [];
        }
      }

      const { data: leaderboardData, error: leaderboardError } = await query;

      if (leaderboardError) throw leaderboardError;

      // Get unique user IDs from leaderboard
      const userIds = [...new Set(leaderboardData?.map(entry => entry.user_id) || [])];
      
      // Fetch user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('user_id', userIds);
      
      if (profilesError) throw profilesError;

      // Create profile lookup map
      const profilesMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile as UserProfile]) || []
      );

      // Attach profiles to leaderboard entries
      const leaderboardWithProfiles = leaderboardData?.map(entry => ({
        ...entry,
        user_profile: profilesMap.get(entry.user_id),
      })) || [];

      return leaderboardWithProfiles;
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      return [];
    }
  }, [userProfile, friends]);

  // Get community stats
  const getCommunityStats = useCallback(async (): Promise<CommunityStats> => {
    try {
      const [usersResult, challengesResult, postsResult, friendshipsResult] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('challenges').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('friendships').select('id', { count: 'exact', head: true }).eq('status', 'accepted')
      ]);

      const { data: topContributors } = await supabase
        .from('user_profiles')
        .select('*')
        .order('community_activity_score', { ascending: false })
        .limit(5);

      return {
        total_users: usersResult.count || 0,
        active_challenges: challengesResult.count || 0,
        total_posts: postsResult.count || 0,
        total_friendships: friendshipsResult.count || 0,
        weekly_new_users: 0, // Would need more complex query
        top_contributors: (topContributors || []) as UserProfile[]
      };
    } catch (error) {
      console.error('Error loading community stats:', error);
      return {
        total_users: 0,
        active_challenges: 0,
        total_posts: 0,
        total_friendships: 0,
        weekly_new_users: 0,
        top_contributors: []
      };
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeUserProfile();
  }, [initializeUserProfile]);

  // Load friends when profile is ready
  useEffect(() => {
    if (userProfile) {
      loadFriends();
    }
  }, [userProfile, loadFriends]);

  // Set up real-time subscriptions for community updates
  useEffect(() => {
    if (!userProfile) return;

    // Subscribe to friendship changes
    const friendshipsChannel = supabase
      .channel('friendships-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
          filter: `requester_id=eq.${userProfile.user_id},addressee_id=eq.${userProfile.user_id}`,
        },
        () => {
          loadFriends(); // Refresh friends list on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendshipsChannel);
    };
  }, [userProfile, loadFriends]);

  return {
    loading,
    userProfile,
    friends,
    initializeUserProfile,
    updateUserProfile,
    searchUsers,
    sendFriendRequest,
    respondToFriendRequest,
    loadFriends,
    getLeaderboards,
    getCommunityStats,
    populateLeaderboards: LeaderboardService.manualPopulate, // Expose for manual trigger
  };
};