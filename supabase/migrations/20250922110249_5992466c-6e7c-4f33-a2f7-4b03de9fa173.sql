-- Insert sample location-based ads and coupons for comprehensive testing
-- This will help test the location-based advertising system

-- Insert test ads for different locations
INSERT INTO public.ads (text, advertiser, image_url, link_url, regions, active_from, active_to) VALUES
('Mumbai Food Festival - 50% off at top restaurants!', 'Mumbai Food Fest', 'https://example.com/mumbai-food.jpg', 'https://mumbai-food-fest.com', ARRAY['Mumbai', 'Maharashtra'], NOW(), NOW() + INTERVAL '30 days'),
('Delhi Metro Mall - Shopping extravaganza with mega discounts', 'Metro Mall Delhi', 'https://example.com/delhi-mall.jpg', 'https://metromall-delhi.com', ARRAY['Delhi', 'New Delhi'], NOW(), NOW() + INTERVAL '30 days'),
('Bangalore Tech Park Cafeteria - Fresh meals for techies', 'TechCafe Bangalore', 'https://example.com/bangalore-cafe.jpg', 'https://techcafe-blr.com', ARRAY['Bangalore', 'Karnataka'], NOW(), NOW() + INTERVAL '30 days'),
('Pune Student Hub - Discounts for college students', 'Student Central Pune', 'https://example.com/pune-student.jpg', 'https://studenthub-pune.com', ARRAY['Pune', 'Maharashtra'], NOW(), NOW() + INTERVAL '30 days'),
('National Fitness Challenge - Join millions across India', 'FitIndia Movement', 'https://example.com/fit-india.jpg', 'https://fitindia.gov.in', ARRAY['India'], NOW(), NOW() + INTERVAL '60 days');

-- Insert test coupons for different locations
INSERT INTO public.coupons (title, description, merchant_name, discount_percent, min_steps_required, regions, expiry_date) VALUES
('Mumbai Pizza Palace Special', 'Buy 2 large pizzas, get 1 free - Mumbai exclusive!', 'Pizza Palace Mumbai', 50, 5000, ARRAY['Mumbai', 'Maharashtra'], NOW() + INTERVAL '15 days'),
('Delhi Gym Membership Deal', 'Join our premium gym with 6 months free - Delhi NCR', 'PowerFit Delhi', 60, 8000, ARRAY['Delhi', 'New Delhi', 'Gurgaon', 'Noida'], NOW() + INTERVAL '20 days'),
('Bangalore Co-working Space', 'Free day pass for co-working - Bangalore tech hubs', 'WorkSpace Bangalore', 100, 3000, ARRAY['Bangalore', 'Karnataka'], NOW() + INTERVAL '10 days'),
('Pune College Bookstore', 'Student books and supplies - 25% off everything', 'Campus Books Pune', 25, 2000, ARRAY['Pune', 'Maharashtra'], NOW() + INTERVAL '25 days'),
('Hyderabad Coffee Corner', 'Premium coffee and snacks - local favorite', 'Coffee Corner HYD', 30, 1500, ARRAY['Hyderabad', 'Telangana'], NOW() + INTERVAL '12 days'),
('National Health Supplements', 'Protein powders and vitamins - pan India delivery', 'HealthFirst India', 40, 10000, ARRAY['India'], NOW() + INTERVAL '45 days');

-- Update existing ads with better location targeting
UPDATE public.ads SET regions = ARRAY['Mumbai', 'Maharashtra', 'India'] WHERE advertiser = 'QuickEats';
UPDATE public.ads SET regions = ARRAY['Hyderabad', 'Telangana', 'India'] WHERE advertiser = 'FitLife Gym';
UPDATE public.ads SET regions = ARRAY['Bangalore', 'Hyderabad', 'Karnataka', 'Telangana'] WHERE advertiser = 'ZenYoga Studio';