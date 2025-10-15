# Referral System: "Uncapped Phase Progression"

## Overview
The 10% Step Gift Referral System rewards users for referring friends by gifting them bonus steps that accelerate phase progression without directly earning paisa.

## How It Works

### For Referrers (Person A):
1. **Signup Bonus (One-Time):**
   - Get ₹1.00 cash instantly
   - Get 5,000 bonus steps for phase progression
   - Valid for 30 days

2. **Daily Step Gift (30 Days):**
   - When your referee walks 10,000+ steps
   - You get 10% of their steps as bonus steps
   - Example: Referee walks 10,000 steps → You get 1,000 bonus steps
   - These bonus steps boost your phase progression

3. **Community Motivation Bonus:**
   - When someone motivates your referee
   - You get 500 bonus steps per motivation
   - Maximum 10 motivations per day = 5,000 bonus steps max

### Key Concepts

**Personal Steps:**
- Your own walking
- Capped at 12,000 steps/day
- Earns paisa based on your current phase rate

**Bonus Steps:**
- From referrals and motivations
- UNCAPPED (no daily limit)
- Only count toward phase progression
- Don't earn paisa directly
- Help you advance phases faster

**The Power of Compounding:**
```
Week 1 (Phase 1): 10,000 personal steps = ₹4.00/day
Week 4 (Phase 3 from bonus steps): 10,000 personal steps = ₹12.00/day
Month 3 (Phase 5): 10,000 personal steps = ₹28.00/day
```

## Database Schema

### Tables Created:
1. **`step_bonuses_log`** - Audit trail of all bonus steps awarded
2. **`motivation_logs`** - Tracks community motivations
3. **`daily_steps`** - Updated with personal_steps, bonus_steps columns
4. **`referrals_new`** - Updated with gift tracking columns

### Key Functions:
1. **`process_referral_signup()`** - Handles new referral signup with bonuses
2. **`process_daily_step_gift()`** - Processes 10% daily step gifts
3. **`process_motivation_bonus()`** - Handles motivation-based bonuses

## Technical Implementation

### Edge Function:
- **Function:** `process-daily-step-gifts`
- **Schedule:** Runs daily at 1:00 AM IST
- **Purpose:** Automatically processes previous day's step gifts for all active referrals

### Security Features:
- Row Level Security (RLS) enabled on all tables
- Users can only view their own bonus logs
- Referral bonus period expires after 30 days
- Daily motivation limits prevent abuse (10/day per referee)

## Cost Analysis

### Per Active Referrer (3 months):
- Direct Cost: ₹1.00 signup bonus
- Indirect Cost: ~₹869 from accelerated phase progression
- **Total Cost: ~₹870 over 3 months** (~₹290/month)

### ROI:
- Creates viral growth through referrals
- Builds genuine community engagement
- Encourages consistent daily walking
- Natural fraud prevention (bonus steps don't earn paisa)

## Usage Examples

### Example 1: Single Referral
```
Day 1: Person B signs up with Person A's code
→ Person A gets ₹1.00 + 5,000 bonus steps

Days 2-30: Person B walks 10,000 steps daily
→ Person A gets 1,000 bonus steps/day (10% of 10,000)
→ After 30 days: 30,000 additional bonus steps
→ Total: 35,000 bonus steps = significant phase boost
```

### Example 2: Multiple Referrals + Motivations
```
Person A refers 3 friends (B, C, D)
All 3 walk 10,000 steps daily

Daily Bonus Steps:
- From B: 1,000 steps
- From C: 1,000 steps  
- From D: 1,000 steps
- From 5 community motivations: 2,500 steps
Total: 5,500 bonus steps/day

After 1 month:
- Personal walking: 300,000 steps
- Bonus steps: 165,000 steps
- Total phase progress: 465,000 steps
→ Could advance from Phase 1 to Phase 3+
```

## Analytics

### View: `referral_gift_analytics`
Monitor the performance of the referral system:
```sql
SELECT * FROM referral_gift_analytics 
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

Tracks:
- Active referrers per day
- Total steps gifted
- Potential paisa value
- Average phase at time of gift

## Best Practices

1. **For Referrers:**
   - Stay active yourself to maximize earnings from higher phases
   - Share your referral code with health-conscious friends
   - Motivate your referees to keep them active

2. **For Referees:**
   - Walk 10,000+ steps daily to trigger gifts for your referrer
   - Engage with community to earn your referrer motivation bonuses
   - Consistent activity benefits everyone

3. **For Administrators:**
   - Monitor `referral_gift_analytics` for system health
   - Check edge function logs for processing issues
   - Watch for abuse patterns in `step_bonuses_log`

## Troubleshooting

### Gifts Not Processing:
1. Check if referral bonus period expired (30 days)
2. Verify referee walked 10,000+ steps
3. Check edge function logs for errors
4. Ensure `bonus_expires_at` is in future

### Motivation Limits:
- Maximum 10 motivations per referee per day
- Check `motivation_logs` for daily count
- System automatically enforces limits

### Phase Progression Not Updating:
- Verify `user_phases.total_steps` includes bonus steps
- Check `daily_steps` table for bonus_steps column
- Ensure frontend properly displays total steps (personal + bonus)

## Future Enhancements

Potential improvements:
- Dynamic gift percentages based on referee consistency
- Tiered referral rewards (bronze, silver, gold referrers)
- Referral leaderboards
- Special events with increased gift rates
- Family plan integration with shared steps
