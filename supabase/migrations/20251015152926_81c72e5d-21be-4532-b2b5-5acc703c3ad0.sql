-- Update referral step requirement to 10,000 steps for "Health is Wealth" campaign
-- This promotes healthier habits aligned with the philosophy: "Health is Wealth"

-- Update default for new referrals
ALTER TABLE public.referrals_new 
ALTER COLUMN minimum_steps_required SET DEFAULT 10000;

-- Update existing pending referrals to use new step requirement
-- (Optional: Comment out the UPDATE if you want to grandfather existing referrals at 1,000 steps)
UPDATE public.referrals_new 
SET minimum_steps_required = 10000 
WHERE status = 'pending' AND minimum_steps_required = 1000;