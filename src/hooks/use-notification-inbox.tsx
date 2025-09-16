import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NotificationInboxItem {
  id: string;
  user_id: string;
  notification_id?: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'deal' | 'custom' | 'coin_expiry';
  image_url?: string;
  deep_link?: string;
  read_status: boolean;
  created_at: string;
  updated_at: string;
}

export type NotificationFilter = 'all' | 'unread' | 'achievements' | 'deals';

export const useNotificationInbox = () => {
  const { user, isGuest } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationInboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && !isGuest) {
      loadNotifications();
      subscribeToNotifications();
    } else {
      setIsLoading(false);
    }
  }, [user, isGuest]);

  useEffect(() => {
    updateUnreadCount();
  }, [notifications]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('notifications_inbox')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setNotifications((data || []) as NotificationInboxItem[]);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: "Load Error",
        description: "Failed to load notification inbox",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notification-inbox-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications_inbox',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as NotificationInboxItem;
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications_inbox',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as NotificationInboxItem;
          setNotifications(prev => 
            prev.map(n => 
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications_inbox')
        .update({ read_status: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read_status: true } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast({
        title: "Update Failed",
        description: "Could not mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAsUnread = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications_inbox')
        .update({ read_status: false, updated_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read_status: false } : n
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      toast({
        title: "Update Failed",
        description: "Could not mark notification as unread",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications_inbox')
        .update({ read_status: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read_status', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read_status: true }))
      );

      toast({
        title: "All Marked as Read",
        description: "All notifications have been marked as read",
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast({
        title: "Update Failed",
        description: "Could not mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications_inbox')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev =>
        prev.filter(n => n.id !== notificationId)
      );

      toast({
        title: "Notification Deleted",
        description: "Notification has been removed from your inbox",
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete notification",
        variant: "destructive",
      });
    }
  };

  const addTestNotification = async () => {
    if (!user) return;

    const testNotifications = [
      {
        title: "🎉 Achievement Unlocked!",
        message: "You've reached 5,000 steps today!",
        type: 'achievement' as const,
      },
      {
        title: "💰 Coin Expiry Alert",
        message: "Your ₹2.50 expires at midnight!",
        type: 'coin_expiry' as const,
      },
      {
        title: "🛍️ New Deal Available",
        message: "20% off at Café Bliss near you!",
        type: 'deal' as const,
      },
      {
        title: "🚶‍♀️ Walking Reminder",
        message: "Time for a mindful walk!",
        type: 'reminder' as const,
      },
    ];

    const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];

    try {
      const { error } = await supabase
        .from('notifications_inbox')
        .insert({
          user_id: user.id,
          title: randomNotification.title,
          message: randomNotification.message,
          type: randomNotification.type,
          read_status: false,
        });

      if (error) throw error;

      toast({
        title: "Test Notification Added",
        description: "A test notification has been added to your inbox",
      });
    } catch (error) {
      console.error('Failed to add test notification:', error);
      toast({
        title: "Add Failed",
        description: "Could not add test notification",
        variant: "destructive",
      });
    }
  };

  const updateUnreadCount = () => {
    const count = notifications.filter(n => !n.read_status).length;
    setUnreadCount(count);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read_status);
      case 'achievements':
        return notifications.filter(n => n.type === 'achievement');
      case 'deals':
        return notifications.filter(n => n.type === 'deal');
      default:
        return notifications;
    }
  };

  const handleNotificationClick = (notification: NotificationInboxItem) => {
    // Mark as read if unread
    if (!notification.read_status) {
      markAsRead(notification.id);
    }

    // Handle deep link navigation
    if (notification.deep_link) {
      try {
        const url = new URL(notification.deep_link, window.location.origin);
        window.location.href = url.pathname + url.search;
      } catch (error) {
        console.error('Invalid deep link:', notification.deep_link);
      }
    }
  };

  return {
    notifications: getFilteredNotifications(),
    allNotifications: notifications,
    isLoading,
    filter,
    setFilter,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    addTestNotification,
    refreshNotifications: loadNotifications,
    handleNotificationClick,
  };
};