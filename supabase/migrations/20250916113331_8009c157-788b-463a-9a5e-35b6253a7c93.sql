-- Create ads table for dynamic advertising system
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  text TEXT NOT NULL,
  regions TEXT[] NOT NULL DEFAULT '{}',
  advertiser TEXT NOT NULL,
  active_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  active_to TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupons table for local deals
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  min_steps_required INTEGER NOT NULL DEFAULT 0,
  regions TEXT[] NOT NULL DEFAULT '{}',
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  merchant_name TEXT NOT NULL,
  image_url TEXT,
  terms TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad_logs table for impression/click tracking
CREATE TABLE public.ad_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('impression', 'click')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page TEXT NOT NULL,
  location JSONB,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon_redemptions table for usage tracking
CREATE TABLE public.coupon_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'redeemed' CHECK (status IN ('redeemed', 'used', 'expired')),
  redemption_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ads
CREATE POLICY "Authenticated users can view active ads" 
ON public.ads 
FOR SELECT 
USING (status = 'active' AND active_from <= now() AND active_to >= now());

-- RLS Policies for coupons
CREATE POLICY "Authenticated users can view active coupons" 
ON public.coupons 
FOR SELECT 
USING (status = 'active' AND expiry_date >= now());

-- RLS Policies for ad_logs
CREATE POLICY "Users can insert their own ad logs" 
ON public.ad_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own ad logs" 
ON public.ad_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS Policies for coupon_redemptions
CREATE POLICY "Users can insert their own coupon redemptions" 
ON public.coupon_redemptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own coupon redemptions" 
ON public.coupon_redemptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX idx_ads_regions ON public.ads USING GIN(regions);
CREATE INDEX idx_ads_status_active ON public.ads(status, active_from, active_to);
CREATE INDEX idx_coupons_regions ON public.coupons USING GIN(regions);
CREATE INDEX idx_coupons_status_expiry ON public.coupons(status, expiry_date);
CREATE INDEX idx_ad_logs_user_timestamp ON public.ad_logs(user_id, timestamp DESC);
CREATE INDEX idx_coupon_redemptions_user ON public.coupon_redemptions(user_id, timestamp DESC);

-- Insert mock ad data
INSERT INTO public.ads (image_url, link_url, text, regions, advertiser, active_from, active_to) VALUES
('https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=320&h=50&fit=crop', 'https://example.com/gym', 'Hyderabad Gym Membership 50% off - Transform your fitness journey!', '{"Hyderabad", "Telangana"}', 'FitLife Gym', now(), now() + INTERVAL '60 days'),
('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=320&h=50&fit=crop', 'https://example.com/food', 'Mumbai Food Delivery Free - Order now and save big!', '{"Mumbai", "Maharashtra"}', 'QuickEats', now(), now() + INTERVAL '45 days'),
('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=50&fit=crop', 'https://example.com/fitness', 'India Wide Fitness App - Join millions of users!', '{"India"}', 'FitIndia App', now(), now() + INTERVAL '90 days'),
('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=320&h=50&fit=crop', 'https://example.com/yoga', 'Yoga Classes Near You - Find inner peace and strength', '{"Hyderabad", "Bangalore"}', 'ZenYoga Studio', now(), now() + INTERVAL '30 days'),
('https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=320&h=50&fit=crop', 'https://example.com/protein', 'Protein Powder Sale - Fuel your workouts with 40% off', '{"Telangana", "Karnataka", "India"}', 'NutriSupply', now(), now() + INTERVAL '15 days');

-- Insert mock coupon data
INSERT INTO public.coupons (title, description, discount_percent, min_steps_required, regions, expiry_date, merchant_name, image_url, terms) VALUES
('Coffee Corner Hyderabad: 20% off', 'Get 20% discount on all beverages and snacks', 20, 5000, '{"Hyderabad"}', now() + INTERVAL '30 days', 'Coffee Corner', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100&h=100&fit=crop', 'Valid on orders above ₹200. Cannot be combined with other offers.'),
('Pizza Palace Mumbai: Buy 1 Get 1', 'Buy any large pizza and get medium pizza free', 50, 8000, '{"Mumbai"}', now() + INTERVAL '45 days', 'Pizza Palace', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop', 'Valid on dine-in only. Medium pizza must be of equal or lesser value.'),
('Fitness Store India: ₹100 off', 'Flat ₹100 discount on fitness equipment and accessories', 0, 10000, '{"India"}', now() + INTERVAL '60 days', 'Fitness Store', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop', 'Minimum purchase ₹1000. Valid on select items only.'),
('Local Pharmacy Discount: 15% off medicines', 'Save 15% on all prescription and OTC medicines', 15, 3000, '{"Hyderabad", "Secunderabad"}', now() + INTERVAL '90 days', 'HealthPlus Pharmacy', 'https://images.unsplash.com/photo-1576602976047-174e57218743?w=100&h=100&fit=crop', 'Valid with valid prescription. Maximum discount ₹500.');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();