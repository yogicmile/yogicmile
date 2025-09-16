-- Create notification system tables
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  walking_reminders_enabled BOOLEAN DEFAULT true,
  coin_expiry_alerts BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  location_deals_enabled BOOLEAN DEFAULT true,
  reminder_frequency TEXT DEFAULT 'daily' CHECK (reminder_frequency IN ('daily', 'weekly', 'custom')),
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '07:00:00',
  timezone TEXT DEFAULT 'UTC',
  fcm_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) <= 160),
  type TEXT NOT NULL CHECK (type IN ('reminder', 'achievement', 'deal', 'custom', 'coin_expiry')),
  target_criteria JSONB DEFAULT '{}',
  schedule_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
  created_by_admin UUID NOT NULL REFERENCES auth.users(id),
  image_url TEXT,
  deep_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'opened')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.notifications_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  image_url TEXT,
  deep_link TEXT,
  read_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_inbox ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings
CREATE POLICY "Users can manage their own notification settings" 
ON public.notification_settings 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications (admin only)
CREATE POLICY "Admin users can manage notifications" 
ON public.notifications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin', 'content_admin')
));

-- RLS Policies for notification_logs
CREATE POLICY "Users can view their own notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification logs" 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for notifications_inbox
CREATE POLICY "Users can manage their own inbox" 
ON public.notifications_inbox 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX idx_notifications_inbox_user_id ON notifications_inbox(user_id);
CREATE INDEX idx_notifications_inbox_read_status ON notifications_inbox(user_id, read_status);
CREATE INDEX idx_notifications_schedule_time ON notifications(schedule_time);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Update triggers
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_inbox_updated_at
  BEFORE UPDATE ON notifications_inbox
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();