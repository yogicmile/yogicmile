-- Create remaining support system tables (avoiding existing support_tickets and ticket_responses)

-- FAQ table with categories and search functionality
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  search_keywords TEXT[] DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_published BOOLEAN DEFAULT true
);

-- Support chat table
CREATE TABLE public.support_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'user' or 'admin'
  admin_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active',
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false
);

-- Video tutorials table
CREATE TABLE public.video_tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  embed_code TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  views_count INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Support analytics table
CREATE TABLE public.support_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_tickets INTEGER DEFAULT 0,
  resolved_tickets INTEGER DEFAULT 0,
  avg_response_time INTEGER, -- in minutes
  satisfaction_score NUMERIC(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FAQ votes tracking
CREATE TABLE public.faq_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faq_id UUID NOT NULL,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(faq_id, user_id)
);

-- Tutorial views tracking
CREATE TABLE public.tutorial_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorial_id UUID NOT NULL,
  user_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- FAQs - everyone can read published FAQs
CREATE POLICY "Anyone can view published FAQs" 
ON public.faqs FOR SELECT 
USING (is_published = true);

-- Support chats - users can manage their own chats
CREATE POLICY "Users can view their own chats" 
ON public.support_chats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat messages" 
ON public.support_chats FOR INSERT 
WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

CREATE POLICY "Admin users can manage chats" 
ON public.support_chats FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- Video tutorials - everyone can view published tutorials
CREATE POLICY "Anyone can view published tutorials" 
ON public.video_tutorials FOR SELECT 
USING (is_published = true);

-- Support analytics - admin only
CREATE POLICY "Admin users can view analytics" 
ON public.support_analytics FOR ALL 
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'super_admin')
));

-- FAQ votes - users can vote
CREATE POLICY "Users can manage their own FAQ votes" 
ON public.faq_votes FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Tutorial views - users can view their own viewing history
CREATE POLICY "Users can view their own tutorial views" 
ON public.tutorial_views FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can track their tutorial views" 
ON public.tutorial_views FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add foreign key constraints
ALTER TABLE public.faq_votes ADD CONSTRAINT fk_faq_votes_faq_id 
  FOREIGN KEY (faq_id) REFERENCES public.faqs(id) ON DELETE CASCADE;

ALTER TABLE public.tutorial_views ADD CONSTRAINT fk_tutorial_views_tutorial_id 
  FOREIGN KEY (tutorial_id) REFERENCES public.video_tutorials(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_support_chats_user_id ON public.support_chats(user_id);
CREATE INDEX idx_faqs_category ON public.faqs(category);
CREATE INDEX idx_video_tutorials_category ON public.video_tutorials(category);

-- Create triggers for updated_at columns
CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_video_tutorials_updated_at
  BEFORE UPDATE ON public.video_tutorials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQ data
INSERT INTO public.faqs (category, question, answer, search_keywords) VALUES
('Account & Login', 'How do I create an account?', 'You can create an account by entering your mobile number and verifying it with the OTP we send you. No email required!', ARRAY['signup', 'account', 'mobile', 'otp', 'verification']),
('Account & Login', 'I forgot my password, how do I reset it?', 'Yogic Mile uses OTP-based login, so there are no passwords to remember. Simply enter your mobile number and verify with the OTP.', ARRAY['password', 'reset', 'forgot', 'otp', 'mobile']),
('Rewards & Wallet', 'How do I earn coins?', 'You earn coins by walking! Every 25 steps = 1 paisa. Your earning rate increases as you progress through different phases.', ARRAY['earn', 'coins', 'steps', 'walking', 'paisa', 'phases']),
('Rewards & Wallet', 'What is the minimum amount I can redeem?', 'You can redeem rewards starting from as low as ₹1. Check our rewards store for available options.', ARRAY['minimum', 'redeem', 'amount', 'rupees', 'rewards']),
('Step Tracking', 'Why are my steps not syncing?', 'Make sure you have given permission to access your health data. Go to Settings > Privacy > Health > Yogic Mile and enable all permissions.', ARRAY['steps', 'sync', 'health', 'permissions', 'tracking']),
('Step Tracking', 'What is the daily step limit?', 'You can earn coins for up to 12,000 steps per day. This limit resets every day at midnight.', ARRAY['daily', 'limit', 'steps', '12000', 'cap']),
('Coupons & Ads', 'How do I use local deal coupons?', 'Browse available coupons in the Rewards section. Each coupon shows terms and conditions. Present the coupon code at the merchant to avail the discount.', ARRAY['coupons', 'local', 'deals', 'discount', 'merchant', 'redeem']);

-- Insert sample video tutorials
INSERT INTO public.video_tutorials (title, description, category, embed_code, duration) VALUES
('Getting Started with Yogic Mile', 'A complete walkthrough of the Yogic Mile app features and how to get started earning coins from your daily walks.', 'Getting Started', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 180),
('Setting Up Health App Permissions', 'Learn how to connect Yogic Mile with your phones health app to automatically track your steps.', 'Step Tracking', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 120),
('Understanding Wallet and Phases', 'Discover how the wallet system works and how you can progress through different earning phases.', 'Wallet Usage', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 200);