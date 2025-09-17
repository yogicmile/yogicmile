import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  search_keywords: string[];
  views_count: number;
  helpful_votes: number;
  unhelpful_votes: number;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  attachments?: any;
  assigned_to?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  embed_code: string;
  thumbnail_url?: string;
  duration: number;
  views_count: number;
  helpful_votes: number;
  unhelpful_votes: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportChat {
  id: string;
  user_id: string;
  message: string;
  sender_type: string;
  admin_id?: string;
  timestamp: string;
  status: string;
  priority: string;
  is_read: boolean;
}

export const useSupportSystem = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);  
  const [tutorials, setTutorials] = useState<VideoTutorial[]>([]);
  const [chats, setChats] = useState<SupportChat[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // FAQ Functions
  const fetchFAQs = async (category?: string, searchQuery?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch FAQ data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const voteFAQ = async (faqId: string, voteType: 'helpful' | 'unhelpful') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Insert or update vote
      const { error } = await supabase
        .from('faq_votes')
        .upsert({ 
          faq_id: faqId, 
          user_id: user.id, 
          vote_type: voteType 
        });

      if (error) throw error;

      // Update FAQ vote counts manually
      const updateField = voteType === 'helpful' ? 'helpful_votes' : 'unhelpful_votes';
        await supabase
          .from('faqs')
          .update({ [updateField]: (currentFaq[updateField] || 0) + 1 })
          .eq('id', faqId);

      if (updateError) console.warn('Failed to update vote count:', updateError);

      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded.',
      });

      // Refresh FAQs
      fetchFAQs();
    } catch (error) {
      console.error('Error voting on FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to record your vote',
        variant: 'destructive',
      });
    }
  };

  // Ticket Functions
  const fetchUserTickets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch support tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: {
    category: string;
    subject: string;
    description: string;
    priority: string;
    attachment_url?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          title: ticketData.subject,
          category: ticketData.category,
          description: ticketData.description,
          priority: ticketData.priority,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been created successfully.',
      });

      fetchUserTickets();
      return data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create support ticket',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Tutorial Functions
  const fetchTutorials = async (category?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('video_tutorials')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTutorials(data || []);
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch video tutorials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const trackTutorialView = async (tutorialId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('tutorial_views')
        .insert({
          tutorial_id: tutorialId,
          user_id: user?.id,
        });

      if (error) throw error;

      // Update tutorial view count manually
      const { data: currentTutorial } = await supabase
        .from('video_tutorials')
        .select('views_count')
        .eq('id', tutorialId)
        .single();
      
      if (currentTutorial) {
        await supabase
          .from('video_tutorials')
          .update({ views_count: currentTutorial.views_count + 1 })
          .eq('id', tutorialId);
      }
    } catch (error) {
      console.error('Error tracking tutorial view:', error);
    }
  };

  // Chat Functions
  const fetchUserChats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_chats')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch chat history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async (message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('support_chats')
        .insert({
          user_id: user.id,
          message,
          sender_type: 'user',
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-response for common queries
      if (message.toLowerCase().includes('balance') || message.toLowerCase().includes('wallet')) {
        setTimeout(() => {
          supabase.from('support_chats').insert({
            user_id: user.id,
            message: 'I can help you check your wallet balance! You can view your current balance in the Wallet section of the app. Is there anything specific about your balance you\'d like to know?',
            sender_type: 'admin',
            admin_id: 'auto-response',
          });
        }, 1000);
      }

      fetchUserChats();
      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    // Data
    faqs,
    tickets,
    tutorials,
    chats,
    loading,

    // FAQ Functions
    fetchFAQs,
    voteFAQ,

    // Ticket Functions
    fetchUserTickets,
    createTicket,

    // Tutorial Functions
    fetchTutorials,
    trackTutorialView,

    // Chat Functions
    fetchUserChats,
    sendChatMessage,
  };
};