-- Create support system tables
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on FAQs
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policy for FAQs
CREATE POLICY "Anyone can view published FAQs" 
ON public.faqs 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "System can manage FAQs" 
ON public.faqs 
FOR ALL 
USING (true);

-- Create support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ticket_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  attachment_url TEXT,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on support tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for support tickets
CREATE POLICY "Users can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create video tutorials table
CREATE TABLE IF NOT EXISTS public.video_tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  video_url TEXT,
  embed_code TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on video tutorials
ALTER TABLE public.video_tutorials ENABLE ROW LEVEL SECURITY;

-- Create policy for video tutorials
CREATE POLICY "Anyone can view published tutorials" 
ON public.video_tutorials 
FOR SELECT 
USING (is_published = true);

-- Create support chat table
CREATE TABLE IF NOT EXISTS public.support_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL, -- 'user' or 'support' or 'bot'
  sender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on support chats
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

-- Create policies for support chats
CREATE POLICY "Users can view their own chats" 
ON public.support_chats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create chat messages" 
ON public.support_chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TKT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('ticket_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1000;

-- Create trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number = generate_ticket_number();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ticket_number_trigger
BEFORE INSERT ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION set_ticket_number();

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, tags) VALUES
('How do I check my wallet balance?', 'Navigate to the Wallet section from the main menu. Your current balance will be displayed at the top of the screen, showing both available coins and pending rewards.', 'Rewards & Wallet', ARRAY['wallet', 'balance', 'coins']),
('Why are my steps not being tracked correctly?', 'Ensure you have granted the app permission to access your health data. Go to Settings > Privacy > Health and verify the app has read access to Steps data. Also check that background app refresh is enabled.', 'Step Tracking', ARRAY['steps', 'tracking', 'permissions', 'health']),
('How do I redeem a voucher or coupon?', 'Go to the Rewards section and browse available coupons. Select the coupon you want and tap "Redeem". You will receive a redemption code that can be used at the merchant according to their terms and conditions.', 'Coupons & Ads', ARRAY['redeem', 'voucher', 'coupon', 'rewards']),
('How do I send a friend request?', 'Go to the Community section, search for friends by username or phone number, and tap the "Add Friend" button next to their profile. They will receive a notification about your friend request.', 'Account & Login', ARRAY['friends', 'community', 'social']),
('What are the different phases in the app?', 'The app has multiple earning phases that unlock as you progress. Each phase has different coin earning rates per step. You advance phases by consistently meeting daily step goals and maintaining activity streaks.', 'Rewards & Wallet', ARRAY['phases', 'progression', 'earnings']),
('How do I reset my password?', 'On the login screen, tap "Forgot Password" and enter your registered email address. You will receive a password reset link via email. Follow the instructions in the email to create a new password.', 'Account & Login', ARRAY['password', 'reset', 'login', 'security']);

-- Insert sample video tutorials
INSERT INTO public.video_tutorials (title, description, category, embed_code, duration_seconds, thumbnail_url) VALUES
('Getting Started with Step Rewards', 'Learn how to set up your account and start earning rewards from your daily steps.', 'Getting Started', '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>', 180, 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),
('Understanding Your Wallet', 'Complete guide to managing your coin balance and redeeming rewards.', 'Wallet & Rewards', '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>', 240, 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),
('Troubleshooting Step Tracking', 'Fix common issues with step counting and health app permissions.', 'Troubleshooting', '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>', 300, 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'),
('Maximizing Your Earnings', 'Tips and strategies to earn more coins from your daily activities.', 'Tips & Tricks', '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>', 420, 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg');