# YogicMile - Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** December 19, 2024  
**Product Owner:** YogicMile Team  
**Status:** Beta Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Audience](#3-target-audience)
4. [Feature Requirements](#4-feature-requirements)
5. [User Stories & Acceptance Criteria](#5-user-stories--acceptance-criteria)
6. [Technical Specifications](#6-technical-specifications)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Data Requirements](#8-data-requirements)
9. [Security Requirements](#9-security-requirements)
10. [Release Criteria](#10-release-criteria)
11. [Appendix](#11-appendix)

---

## 1. Executive Summary

### 1.1 Product Overview

| Attribute | Details |
|-----------|---------|
| **Product Name** | YogicMile |
| **Tagline** | "Walk. Earn. Evolve. Transcend." |
| **Product Type** | Mobile-First Fitness Rewards Application |
| **Primary Platform** | Android (Primary), iOS, Web |
| **Technology Stack** | React + Vite + Capacitor + TypeScript + Supabase |

### 1.2 Problem Statement

| Problem | Impact | YogicMile Solution |
|---------|--------|-------------------|
| Lack of walking motivation | 67% of adults don't meet daily step goals | Real paisa rewards for every 25 steps |
| Fitness app abandonment | 80% churn within 30 days | 9-phase progression system with increasing rewards |
| Privacy concerns | Users hesitant to share health data | On-device step counting, minimal data collection |
| Complex reward systems | Users confused by point systems | Simple paisa-based earnings (₹1 = 100 paisa) |

### 1.3 Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Daily Active Users (DAU) | 10,000+ by Month 6 | Supabase Analytics |
| Day-1 Retention | > 60% | Cohort Analysis |
| Day-7 Retention | > 40% | Cohort Analysis |
| Day-30 Retention | > 25% | Cohort Analysis |
| Avg Steps/User/Day | 6,000+ | daily_steps table |
| Phase 3+ Conversion | > 15% | user_phases table |
| Referral Rate | > 20% | referrals_new table |

---

## 2. Product Vision & Goals

### 2.1 Vision Statement

> "To make India the healthiest nation by rewarding every step with real money, transforming daily walking into a spiritual and financial journey."

### 2.2 Core Philosophy - 9 Spiritual Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE YOGIC JOURNEY                                     │
├──────────┬─────────────┬──────────────┬────────────────┬───────────────────┤
│  Phase   │    Name     │   Meaning    │  Rate/25 Steps │  Steps Required   │
├──────────┼─────────────┼──────────────┼────────────────┼───────────────────┤
│    1     │   Paisa     │  Foundation  │    1 paisa     │        0          │
│    2     │   Anna      │   Growth     │    2 paisa     │     200,000       │
│    3     │   Rupee     │  Stability   │    3 paisa     │     500,000       │
│    4     │    Gem      │   Value      │    4 paisa     │   1,000,000       │
│    5     │  Diamond    │   Clarity    │    5 paisa     │   2,000,000       │
│    6     │   Crown     │  Authority   │    6 paisa     │   5,000,000       │
│    7     │  Emperor    │   Mastery    │    7 paisa     │  10,000,000       │
│    8     │   Legend    │   Legacy     │    8 paisa     │  25,000,000       │
│    9     │  Immortal   │ Transcendence│    9 paisa     │  50,000,000       │
└──────────┴─────────────┴──────────────┴────────────────┴───────────────────┘
```

### 2.3 Business Goals

| Goal | Description | Timeline | KPI |
|------|-------------|----------|-----|
| **G1** | Launch Beta with core features | Q1 2025 | 1,000 beta users |
| **G2** | Achieve product-market fit | Q2 2025 | 40% D7 retention |
| **G3** | Scale user acquisition | Q3 2025 | 50,000 MAU |
| **G4** | Monetization activation | Q4 2025 | ₹5L monthly revenue |
| **G5** | Regional expansion | 2026 | 5 new states |

---

## 3. Target Audience

### 3.1 Primary Personas

#### Persona 1: College Student (Arjun, 21)

| Attribute | Details |
|-----------|---------|
| **Demographics** | Male, Urban, Middle Class |
| **Tech Savvy** | High - Android user, uses UPI daily |
| **Motivation** | Extra pocket money, fitness goals |
| **Pain Points** | Limited income, needs motivation to exercise |
| **Usage Pattern** | 2-3 sessions/day, morning walk + evening |
| **Goal** | Earn ₹500/month for expenses |
| **Device** | Budget Android (Redmi, Realme) |

#### Persona 2: Working Professional (Priya, 32)

| Attribute | Details |
|-----------|---------|
| **Demographics** | Female, Urban, Upper-Middle Class |
| **Tech Savvy** | Medium - iPhone user, busy schedule |
| **Motivation** | Health tracking, weight management |
| **Pain Points** | Sedentary job, no time for gym |
| **Usage Pattern** | Morning walk, lunch break, evening |
| **Goal** | 10,000 steps/day, progress tracking |
| **Device** | iPhone 13, Apple Watch |

#### Persona 3: Homemaker (Lakshmi, 45)

| Attribute | Details |
|-----------|---------|
| **Demographics** | Female, Semi-Urban, Middle Class |
| **Tech Savvy** | Low - Basic smartphone user |
| **Motivation** | Health improvement, family inspiration |
| **Pain Points** | Needs simple interface, vernacular support |
| **Usage Pattern** | Throughout the day during chores |
| **Goal** | Stay active, manage diabetes |
| **Device** | Entry-level Android (Samsung M series) |

### 3.2 User Segmentation

| Segment | Description | % of Users | Priority |
|---------|-------------|------------|----------|
| **Power Walkers** | 10,000+ steps/day consistently | 10% | High |
| **Regular Walkers** | 5,000-10,000 steps/day | 30% | High |
| **Casual Walkers** | 2,000-5,000 steps/day | 40% | Medium |
| **Occasional Walkers** | < 2,000 steps/day | 20% | Low |

---

## 4. Feature Requirements

### 4.1 Feature Priority Matrix

```
                    HIGH IMPACT
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    │  P2: SHOULD HAVE   │  P0: MUST HAVE     │
    │  ─────────────────  │  ─────────────────  │
    │  • Social Sharing  │  • Step Tracking   │
    │  • Leaderboards    │  • Paisa Earning   │
    │  • Achievements    │  • Phase System    │
    │  • Forums          │  • Wallet/Redeem   │
    │                    │  • Authentication  │
LOW ─┼────────────────────┼────────────────────┼─ HIGH
EFFORT│                    │                    │ EFFORT
    │  P3: NICE TO HAVE  │  P1: IMPORTANT     │
    │  ─────────────────  │  ─────────────────  │
    │  • AR Features     │  • Referral System │
    │  • Wear OS         │  • Challenges      │
    │  • Voice Commands  │  • GPS Routes      │
    │  • Family Plans    │  • Spin Wheel      │
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
                    LOW IMPACT
```

### 4.2 Feature List by Priority

#### P0: Must Have (MVP)

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F001 | Step Tracking | Native sensor + Google Fit/HealthKit fallback | ✅ Done |
| F002 | Background Tracking | Count steps when app is closed | ✅ Done |
| F003 | Paisa Earning | Convert steps to paisa (25 steps = phase rate) | ✅ Done |
| F004 | Phase Progression | 9-tier system with increasing rewards | ✅ Done |
| F005 | Wallet Balance | View earned paisa, total balance | ✅ Done |
| F006 | Daily Redemption | Claim daily earned paisa to wallet | ✅ Done |
| F007 | WhatsApp OTP Auth | Login/signup via mobile + OTP | ✅ Done |
| F008 | Email/Password Auth | Alternative authentication method | ✅ Done |
| F009 | Guest Mode | Try app without registration | ✅ Done |
| F010 | Profile Management | View/edit user profile | ✅ Done |

#### P1: Important (Post-MVP)

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F011 | Referral System | Earn bonuses for referring friends | ✅ Done |
| F012 | Daily Step Gift | Referrer gets 10% of referee's steps | ✅ Done |
| F013 | Spin Wheel | Gamified daily bonus rewards | ✅ Done |
| F014 | Challenges | Create/join step challenges | ✅ Done |
| F015 | GPS Route Tracking | Track walking routes with maps | ✅ Done |
| F016 | Achievements | Earn badges for milestones | ✅ Done |
| F017 | Streak Tracking | Bonus for consecutive active days | ✅ Done |
| F018 | Push Notifications | Reminders, achievements, challenges | ✅ Done |

#### P2: Should Have

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F019 | Leaderboards | Daily/Weekly/Monthly rankings | ✅ Done |
| F020 | Social Sharing | Share achievements on social media | ✅ Done |
| F021 | Friends System | Add friends, compare progress | ✅ Done |
| F022 | Community Forums | Discuss with other walkers | ✅ Done |
| F023 | Virtual Teams | Join/create walking teams | ✅ Done |
| F024 | Motivations | Cheer friends for bonus steps | ✅ Done |
| F025 | Coupon Redemption | Use paisa for merchant coupons | 🔄 Partial |

#### P3: Nice to Have

| ID | Feature | Description | Status |
|----|---------|-------------|--------|
| F026 | AR Mode | Augmented reality achievements | ⏳ Planned |
| F027 | Wear OS Support | Smartwatch companion app | ⏳ Planned |
| F028 | Voice Commands | "Hey YogicMile, how many steps?" | ⏳ Planned |
| F029 | Family Plans | Shared household accounts | ⏳ Planned |
| F030 | Multi-language | Hindi, Tamil, Telugu, etc. | ⏳ Planned |

---

## 5. User Stories & Acceptance Criteria

### 5.1 Epic 1: User Authentication

#### US-001: WhatsApp OTP Login

**As a** new user  
**I want to** login using my mobile number and WhatsApp OTP  
**So that** I can quickly access the app without creating a password

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: User can enter 10-digit Indian mobile number | Must |
| AC2: System validates mobile number format (+91XXXXXXXXXX) | Must |
| AC3: OTP is sent within 5 seconds of request | Must |
| AC4: OTP expires after 3 minutes | Must |
| AC5: User gets 3 OTP attempts before 1-hour block | Must |
| AC6: Successful OTP creates auth session | Must |
| AC7: User is redirected to dashboard after login | Must |
| AC8: Error messages are clear and actionable | Should |

**Technical Notes:**
- Edge function: `generate-whatsapp-otp`
- OTP hashing: bcrypt with 8 rounds
- Rate limiting: 3 attempts/15 min, 10 attempts/day
- Session: Supabase Auth JWT

---

#### US-002: Email/Password Registration

**As a** new user  
**I want to** register with email and password  
**So that** I have a traditional account for the app

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Email must be valid format | Must |
| AC2: Password minimum 8 characters | Must |
| AC3: Password requires: uppercase, lowercase, number, special char | Should |
| AC4: Email verification sent after registration | Must |
| AC5: User profile created with default values | Must |
| AC6: Wallet initialized with 0 balance | Must |
| AC7: User starts at Phase 1 (Paisa) | Must |

**Technical Notes:**
- Supabase Auth email/password flow
- Trigger: `handle_new_user()` creates profile, phase, wallet
- Password validation: client-side + Supabase policies

---

#### US-003: Guest Mode Access

**As a** curious user  
**I want to** try the app without registering  
**So that** I can experience the features before committing

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Guest can access dashboard | Must |
| AC2: Guest can track steps (stored locally) | Must |
| AC3: Guest sees simulated earnings | Must |
| AC4: Guest cannot redeem to real wallet | Must |
| AC5: Guest data migrates on registration | Should |
| AC6: Guest prompted to register after 3 days | Should |

**Technical Notes:**
- Service: `GuestDataManager.ts`
- Storage: localStorage with `yogicmile-guest-*` keys
- Migration: On signup, merge local data to Supabase

---

### 5.2 Epic 2: Step Tracking

#### US-004: Real-time Step Counting

**As a** walker  
**I want to** see my steps counted in real-time  
**So that** I know my progress throughout the day

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Steps update within 1 second of walking | Must |
| AC2: Step counter uses native TYPE_STEP_COUNTER sensor | Must |
| AC3: Fallback to Google Fit/HealthKit if sensor unavailable | Must |
| AC4: Daily step count resets at midnight local time | Must |
| AC5: Steps persist across app restarts | Must |
| AC6: Step count animates on update | Should |
| AC7: Haptic feedback on milestone (1000, 5000, 10000) | Should |

**Technical Notes:**
```typescript
// Android: BackgroundStepTrackingPlugin.kt
sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_FASTEST)

// iOS: BackgroundStepTracking.swift
pedometer.startUpdates(from: startOfDay) { data, error in
  self.notifyListeners("step", data: ["steps": data.numberOfSteps])
}
```

---

#### US-005: Background Step Tracking

**As a** walker  
**I want** my steps counted even when the app is closed  
**So that** I don't miss any earning opportunity

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Service runs continuously in background | Must |
| AC2: Foreground notification shows current steps | Must |
| AC3: Battery usage < 3% per day | Must |
| AC4: Survives device restart (boot receiver) | Must |
| AC5: Syncs to server every 15 minutes | Must |
| AC6: Works with battery optimization enabled | Should |
| AC7: User can disable/enable from settings | Must |

**Technical Notes:**
```kotlin
// StepCounterService.kt - Foreground Service
class StepCounterService : Service() {
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, createNotification())
        return START_STICKY
    }
}
```

---

#### US-006: GPS Speed Validation (Anti-Fraud)

**As a** system  
**I want to** validate walking speed via GPS  
**So that** users cannot cheat by shaking phones or using step simulators

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Walking speed must be < 12 km/h to count steps | Must |
| AC2: GPS accuracy must be < 50m to validate | Must |
| AC3: Suspicious patterns flagged in fraud_detection table | Must |
| AC4: User warned on first violation, penalized on repeat | Should |
| AC5: Speed check runs every 30 seconds during activity | Must |
| AC6: No GPS required for indoor walking (optional) | Should |

**Technical Notes:**
```typescript
// use-native-step-tracking.tsx
const validateSpeed = (speedKmh: number, accuracy: number) => {
  if (speedKmh > 12 || accuracy > 50) {
    flagFraudAttempt(userId, { speedKmh, accuracy });
    return false;
  }
  return true;
};
```

---

### 5.3 Epic 3: Earning System

#### US-007: Paisa Earning from Steps

**As a** walker  
**I want to** earn paisa for every 25 steps I walk  
**So that** my physical effort translates to real money

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: 25 steps = 1 paisa × phase_rate | Must |
| AC2: Daily earning cap at 12,000 steps | Must |
| AC3: Earnings calculated server-side | Must |
| AC4: Real-time "Pending Paisa" display | Must |
| AC5: Historical earnings visible in transactions | Must |
| AC6: Earnings match phase progression rate | Must |

**Technical Notes:**
```sql
-- Daily step earning calculation
paisa_earned = FLOOR(capped_steps / 25.0) * phase_rate

-- Example: Phase 3 user with 10,000 steps
-- paisa_earned = FLOOR(10000 / 25) * 3 = 400 * 3 = 1200 paisa = ₹12
```

---

#### US-008: Daily Coin Redemption

**As a** walker  
**I want to** claim my daily earned paisa to my wallet  
**So that** I can accumulate redeemable balance

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Redeem button shows pending amount | Must |
| AC2: Single-click redemption with confirmation | Must |
| AC3: Cannot redeem twice for same day | Must |
| AC4: Transaction logged with amount, date, type | Must |
| AC5: Wallet balance updates immediately | Must |
| AC6: Celebration animation on redemption | Should |
| AC7: Idempotent operation (no double-spend) | Must |

**Technical Notes:**
```sql
-- Atomic redemption function
SELECT * FROM redeem_daily_coins_atomic(
  p_user_id := 'uuid',
  p_date := CURRENT_DATE,
  p_idempotency_key := 'unique-key'
);
```

---

#### US-009: Phase Progression

**As a** dedicated walker  
**I want to** progress through phases by accumulating lifetime steps  
**So that** I earn more paisa per step over time

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: 9 phases with increasing earning rates (1-9 paisa) | Must |
| AC2: Phase up when lifetime steps reach threshold | Must |
| AC3: Each phase has time limit (60-365 days) | Must |
| AC4: Phase down if target not met in time | Should |
| AC5: Celebration modal on phase up | Should |
| AC6: Phase progress visible on dashboard | Must |
| AC7: Next phase requirements clearly shown | Must |

**Technical Notes:**
```typescript
// src/constants/phases.ts
export const PHASE_DEFINITIONS = [
  { id: 1, name: "Paisa", stepsRequired: 0, rate: 1, timeLimit: 60 },
  { id: 2, name: "Anna", stepsRequired: 200000, rate: 2, timeLimit: 90 },
  // ... up to Phase 9
];
```

---

### 5.4 Epic 4: Referral System

#### US-010: Refer a Friend

**As a** user  
**I want to** invite friends using my referral code  
**So that** I earn bonuses when they join and walk

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Unique referral code generated from mobile | Must |
| AC2: Shareable referral link with deep link | Must |
| AC3: QR code generation for offline sharing | Should |
| AC4: Share to WhatsApp, SMS, Copy Link options | Must |
| AC5: Track referral status (pending, active, expired) | Must |
| AC6: See list of referred friends | Should |

**Technical Notes:**
```sql
-- Referral code generation
referral_code = 'YM' || RIGHT(mobile_number, 4)  -- e.g., YM1234
```

---

#### US-011: Referrer Signup Bonus

**As a** referrer  
**I want to** receive bonuses when my friend signs up  
**So that** I'm rewarded for growing the community

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Receive ₹1 (100 paisa) cash bonus | Must |
| AC2: Receive 5,000 bonus steps instantly | Must |
| AC3: Bonus credited within 24 hours of signup | Must |
| AC4: Notification when friend joins | Should |
| AC5: Bonus expires if referee inactive 30 days | Should |

**Technical Notes:**
```sql
SELECT * FROM process_referral_signup(
  p_referee_user_id := 'uuid',
  p_referee_mobile := '+91XXXXXXXXXX',
  p_referral_code := 'YM1234'
);
-- Returns: { cash_bonus: 100, steps_gifted: 5000 }
```

---

#### US-012: Daily Step Gift from Referee

**As a** referrer  
**I want to** receive 10% of my referee's daily steps  
**So that** I continue earning from successful referrals

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Receive 10% of referee's daily steps (if they walk 10K+) | Must |
| AC2: Gift period lasts 30 days from signup | Must |
| AC3: Steps added as bonus_steps (no phase progression) | Must |
| AC4: Daily gift visible in step breakdown | Should |
| AC5: Maximum 1,000 gifted steps/day/referee | Should |

**Technical Notes:**
```sql
SELECT * FROM process_daily_step_gift(
  p_referee_user_id := 'uuid',
  p_date := CURRENT_DATE
);
-- Gifts 10% of referee's steps to referrer
```

---

### 5.5 Epic 5: Wallet & Transactions

#### US-013: View Wallet Balance

**As a** user  
**I want to** see my current paisa balance  
**So that** I know how much I've earned

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Total balance prominently displayed | Must |
| AC2: Breakdown: Earned, Redeemed, Pending | Must |
| AC3: Real-time balance updates | Must |
| AC4: Balance formatted as ₹XX.XX | Must |
| AC5: Lifetime earnings visible | Should |

**Technical Notes:**
```typescript
// use-wallet.tsx hook
const { balance, totalEarned, totalRedeemed, pendingToday } = useWallet();
```

---

#### US-014: Transaction History

**As a** user  
**I want to** see my transaction history  
**So that** I can track all my earnings and redemptions

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: List all transactions (earn, redeem, spin, referral) | Must |
| AC2: Filter by type, date range | Should |
| AC3: Show amount, type, description, timestamp | Must |
| AC4: Paginated (50 per page) | Must |
| AC5: Export to PDF/CSV | Nice to Have |

**Technical Notes:**
```sql
SELECT * FROM transactions 
WHERE user_id = 'uuid' 
ORDER BY created_at DESC 
LIMIT 50 OFFSET 0;
```

---

### 5.6 Epic 6: Gamification

#### US-015: Daily Spin Wheel

**As a** active user  
**I want to** spin a wheel daily for bonus rewards  
**So that** I have an exciting chance to win extra paisa

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: One free spin per day | Must |
| AC2: Spin cooldown resets at midnight | Must |
| AC3: Wheel segments: 5, 10, 25, 50, 100, 500 paisa + Bonus Spin | Must |
| AC4: Animated wheel spin (2-3 seconds) | Should |
| AC5: Confetti celebration on big win (100+) | Should |
| AC6: Reward immediately credited to wallet | Must |
| AC7: Bonus spin award gives extra spin | Must |

**Technical Notes:**
```sql
SELECT * FROM check_spin_availability('uuid');
SELECT * FROM process_spin_result(
  p_user_id := 'uuid',
  p_reward_type := 'paisa',
  p_reward_amount := 25,
  p_reward_description := 'Spin wheel bonus',
  p_bonus_spin_awarded := false
);
```

---

#### US-016: Achievements & Badges

**As a** walker  
**I want to** earn badges for reaching milestones  
**So that** I feel recognized for my progress

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Achievement categories: Steps, Streaks, Phases, Social | Must |
| AC2: Progress shown for locked achievements | Should |
| AC3: Celebration popup on unlock | Should |
| AC4: Rarity levels: Common, Rare, Epic, Legendary | Should |
| AC5: Coin rewards for unlocking | Must |
| AC6: Share achievement to social | Should |

**Achievement Examples:**

| Achievement | Requirement | Reward | Rarity |
|-------------|-------------|--------|--------|
| First Steps | Walk 100 steps | 10 paisa | Common |
| Kilometer Kid | Walk 1 km | 25 paisa | Common |
| Marathon Master | Walk 42 km | 500 paisa | Epic |
| Week Warrior | 7-day streak | 100 paisa | Rare |
| Phase Pioneer | Reach Phase 2 | 200 paisa | Rare |
| Immortal Walker | Reach Phase 9 | 10,000 paisa | Legendary |

---

#### US-017: Streak Tracking

**As a** consistent walker  
**I want to** maintain a daily streak  
**So that** I earn bonus rewards for consistency

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Streak increments for 5,000+ steps/day | Must |
| AC2: Streak resets if a day is missed | Must |
| AC3: Streak protection (1 per week) available | Should |
| AC4: Milestone bonuses at 7, 30, 100, 365 days | Must |
| AC5: Current streak visible on dashboard | Must |
| AC6: Streak fire animation | Should |

**Streak Bonuses:**

| Streak Days | Bonus | Badge |
|-------------|-------|-------|
| 7 days | 50 paisa | 🔥 Week Warrior |
| 30 days | 300 paisa | 🌟 Month Master |
| 100 days | 1,500 paisa | 👑 Century Champion |
| 365 days | 10,000 paisa | 🏆 Year Legend |

---

### 5.7 Epic 7: Social & Community

#### US-018: Create/Join Challenges

**As a** competitive walker  
**I want to** create and join step challenges  
**So that** I compete with friends for rewards

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Create challenge with target steps, duration | Must |
| AC2: Invite friends or make public | Must |
| AC3: Real-time leaderboard during challenge | Must |
| AC4: Rewards for top 3 finishers | Should |
| AC5: Photo proof option for verification | Should |
| AC6: Challenge categories: Daily, Weekly, Monthly | Must |

**Technical Notes:**
```sql
-- challenges table structure
id, title, goal_type, target_value, start_date, end_date, 
creator_id, privacy_setting, difficulty_level, status
```

---

#### US-019: Leaderboards

**As a** competitive user  
**I want to** see where I rank among other walkers  
**So that** I'm motivated to walk more

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Daily, Weekly, Monthly, All-time boards | Must |
| AC2: Top 100 users displayed | Must |
| AC3: User's own rank highlighted | Must |
| AC4: Filter by region/city | Should |
| AC5: Friend-only leaderboard | Should |
| AC6: Refresh every 5 minutes | Must |

---

#### US-020: Friends & Social

**As a** social user  
**I want to** add friends and see their progress  
**So that** we can motivate each other

| Acceptance Criteria | Priority |
|---------------------|----------|
| AC1: Send/accept friend requests | Must |
| AC2: View friend's step count, phase, streak | Must |
| AC3: Send motivation cheers (500 bonus steps to referrer) | Must |
| AC4: Friend activity feed | Should |
| AC5: Block/remove friend | Must |
| AC6: Privacy settings for visibility | Must |

---

## 6. Technical Specifications

### 6.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  React App  │  │   Android   │  │     iOS     │  │        Web          │ │
│  │   (Vite)    │  │  (Capacitor)│  │ (Capacitor) │  │      (PWA)          │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                │                     │            │
│         └────────────────┴────────────────┴─────────────────────┘            │
│                                    │                                         │
│                          ┌─────────▼─────────┐                              │
│                          │   Capacitor Core  │                              │
│                          │   Bridge Layer    │                              │
│                          └─────────┬─────────┘                              │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                           NATIVE LAYER                                       │
├────────────────────────────────────┴────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────┐ │
│  │         ANDROID              │  │              iOS                      │ │
│  │  ┌────────────────────────┐  │  │  ┌────────────────────────────────┐  │ │
│  │  │ StepCounterService     │  │  │  │ BackgroundStepTracking.swift  │  │ │
│  │  │ (Foreground Service)   │  │  │  │ (CMPedometer)                  │  │ │
│  │  ├────────────────────────┤  │  │  ├────────────────────────────────┤  │ │
│  │  │ BackgroundStepTracking │  │  │  │ HealthKitService               │  │ │
│  │  │ Plugin (Capacitor)     │  │  │  │ (HKHealthStore)                │  │ │
│  │  ├────────────────────────┤  │  │  ├────────────────────────────────┤  │ │
│  │  │ GoogleFitService       │  │  │  │ Location Services              │  │ │
│  │  │ (Fitness API)          │  │  │  │ (CLLocationManager)            │  │ │
│  │  └────────────────────────┘  │  │  └────────────────────────────────┘  │ │
│  └──────────────────────────────┘  └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     │ HTTPS
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                          BACKEND LAYER (Supabase)                            │
├────────────────────────────────────┴────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   Supabase      │  │   Edge          │  │      Realtime               │  │
│  │   Auth          │  │   Functions     │  │      Subscriptions          │  │
│  │   (JWT)         │  │   (Deno)        │  │      (WebSocket)            │  │
│  └────────┬────────┘  └────────┬────────┘  └─────────────┬───────────────┘  │
│           │                    │                         │                   │
│           └────────────────────┴─────────────────────────┘                   │
│                                │                                             │
│                    ┌───────────▼───────────┐                                │
│                    │     PostgreSQL DB     │                                │
│                    │   (120+ tables)       │                                │
│                    │   + RLS Policies      │                                │
│                    │   + DB Functions      │                                │
│                    └───────────────────────┘                                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.3.1 | UI Framework |
| | TypeScript | 5.x | Type Safety |
| | Vite | 5.x | Build Tool |
| | Tailwind CSS | 3.x | Styling |
| | Framer Motion | 12.x | Animations |
| | TanStack Query | 5.x | Server State |
| | React Router | 6.x | Navigation |
| **Mobile** | Capacitor | 7.4.3 | Native Bridge |
| | Capacitor Plugins | Various | Native APIs |
| **Backend** | Supabase | Latest | BaaS Platform |
| | PostgreSQL | 15.x | Database |
| | Deno | Latest | Edge Functions |
| **Native Android** | Kotlin | 1.9.22 | Native Code |
| | Android SDK | 34 | Platform SDK |
| | Google Fit API | 21.1.0 | Fitness Data |
| **Native iOS** | Swift | 5.x | Native Code |
| | CoreMotion | Latest | Pedometer |
| | HealthKit | Latest | Health Data |

### 6.3 API Specifications

#### 6.3.1 Supabase Client API

```typescript
// Authentication
supabase.auth.signInWithOtp({ phone: '+91XXXXXXXXXX' })
supabase.auth.verifyOtp({ phone, token, type: 'sms' })
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()

// Database Operations
supabase.from('daily_steps').upsert({ user_id, date, steps, ... })
supabase.from('wallet_balances').select('*').eq('user_id', userId)
supabase.from('transactions').insert({ user_id, type, amount, ... })

// Realtime Subscriptions
supabase.channel('wallet-changes')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'wallet_balances' 
  }, callback)
  .subscribe()
```

#### 6.3.2 Edge Functions

| Function | Method | Path | Purpose |
|----------|--------|------|---------|
| generate-whatsapp-otp | POST | /generate-whatsapp-otp | Send OTP via WhatsApp |
| create-auth-session | POST | /create-auth-session | Create device session |
| process-daily-step-gifts | POST | /process-daily-step-gifts | Process referral gifts |
| security-headers | GET | /security-headers | Security validation |

#### 6.3.3 Capacitor Plugin APIs

```typescript
// Step Tracking Plugin
BackgroundStepTracking.start()
BackgroundStepTracking.stop()
BackgroundStepTracking.getTodaySteps()
BackgroundStepTracking.requestPermissions()
BackgroundStepTracking.addListener('step', callback)

// Geolocation
Geolocation.watchPosition({ enableHighAccuracy: true }, callback)
Geolocation.getCurrentPosition()

// Local Notifications
LocalNotifications.schedule({ title, body, schedule: { at } })

// Preferences (Storage)
Preferences.set({ key, value })
Preferences.get({ key })
```

### 6.4 Database Schema (Core Tables)

```sql
-- Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Daily Steps Table
CREATE TABLE public.daily_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    date DATE NOT NULL,
    steps INTEGER DEFAULT 0,
    personal_steps INTEGER DEFAULT 0,
    bonus_steps INTEGER DEFAULT 0,
    capped_steps INTEGER DEFAULT 0,
    paisa_earned INTEGER DEFAULT 0,
    phase_id INTEGER DEFAULT 1,
    phase_rate INTEGER DEFAULT 1,
    is_redeemed BOOLEAN DEFAULT false,
    redeemed_at TIMESTAMPTZ,
    UNIQUE(user_id, date)
);

-- Wallet Balances Table
CREATE TABLE public.wallet_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    total_balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_redeemed INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- User Phases Table
CREATE TABLE public.user_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    current_phase INTEGER DEFAULT 1,
    total_steps BIGINT DEFAULT 0,
    phase_start_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transactions Table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'completed',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Referrals Table
CREATE TABLE public.referrals_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_user_id UUID NOT NULL,
    referee_user_id UUID NOT NULL,
    referral_code TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    bonus_expires_at TIMESTAMPTZ,
    total_steps_gifted INTEGER DEFAULT 0,
    daily_step_gift_percentage NUMERIC DEFAULT 0.10,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.5 File Structure

```
yogicmile/
├── src/
│   ├── components/
│   │   ├── ui/                    # Shadcn/UI components
│   │   ├── achievements/          # Achievement components
│   │   ├── challenges/            # Challenge components
│   │   ├── community/             # Social components
│   │   ├── gamification/          # Gamification components
│   │   └── ...                    # Feature components
│   ├── pages/
│   │   ├── Index.tsx              # Dashboard
│   │   ├── LoginPage.tsx          # Authentication
│   │   ├── WalletPage.tsx         # Wallet & Transactions
│   │   ├── ChallengesPage.tsx     # Challenges
│   │   └── ...                    # Other pages
│   ├── hooks/
│   │   ├── use-step-tracking.tsx  # Step tracking state
│   │   ├── use-wallet.tsx         # Wallet operations
│   │   ├── use-native-step-tracking.tsx
│   │   └── ...                    # Custom hooks
│   ├── services/
│   │   ├── AndroidStepTracking.ts
│   │   ├── HealthKitService.ts
│   │   ├── GoogleFitService.ts
│   │   └── ...                    # Service layer
│   ├── contexts/
│   │   └── AuthContext.tsx        # Auth provider
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Supabase client
│   │       └── types.ts           # Auto-generated types
│   └── constants/
│       └── phases.ts              # Phase definitions
├── android/
│   └── app/src/main/java/app/lovable/yogicmile/
│       ├── MainActivity.kt
│       └── steps/
│           ├── BackgroundStepTrackingPlugin.kt
│           ├── StepCounterService.kt
│           └── BootReceiver.kt
├── ios/
│   └── App/App/
│       └── BackgroundStepTracking.swift
├── supabase/
│   ├── functions/                 # Edge functions
│   ├── migrations/                # DB migrations
│   └── config.toml                # Supabase config
└── public/                        # Static assets
```

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements

| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| App Launch Time | < 3 seconds (cold start) | Firebase Performance |
| Step Update Latency | < 1 second | In-app measurement |
| API Response Time | < 500ms (p95) | Supabase Analytics |
| Database Query Time | < 100ms (simple), < 500ms (complex) | pg_stat_statements |
| Battery Consumption | < 3% per day (background) | Android Vitals |
| Memory Usage | < 150MB (active), < 50MB (background) | Profiler |
| APK Size | < 25MB | Build output |
| Offline Capability | Core features work offline | Manual testing |

### 7.2 Scalability Requirements

| Aspect | Current | Target (6 months) | Target (12 months) |
|--------|---------|-------------------|-------------------|
| Concurrent Users | 100 | 10,000 | 100,000 |
| Daily Active Users | 50 | 10,000 | 50,000 |
| Database Size | 1 GB | 50 GB | 500 GB |
| Requests/Second | 10 | 1,000 | 10,000 |
| Edge Function Invocations | 1K/day | 100K/day | 1M/day |

### 7.3 Availability Requirements

| Requirement | Target | Notes |
|-------------|--------|-------|
| Uptime | 99.9% | Supabase SLA |
| Planned Downtime | < 4 hours/month | Maintenance window |
| Recovery Time (RTO) | < 1 hour | Supabase managed |
| Recovery Point (RPO) | < 5 minutes | Point-in-time recovery |
| Disaster Recovery | Cross-region backup | Supabase feature |

### 7.4 Compatibility Requirements

| Platform | Minimum Version | Recommended |
|----------|-----------------|-------------|
| Android | API 24 (7.0 Nougat) | API 31+ (12+) |
| iOS | iOS 14.0 | iOS 16+ |
| Web Browsers | Chrome 90+, Safari 14+, Firefox 90+ | Latest |
| Screen Sizes | 320px - 1920px | 360px - 428px (mobile) |

### 7.5 Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Screen Reader | aria-labels on all interactive elements |
| Color Contrast | WCAG 2.1 AA (4.5:1 text, 3:1 UI) |
| Touch Targets | Minimum 44x44px |
| Font Scaling | Support up to 200% system font |
| Reduced Motion | Respect prefers-reduced-motion |
| Keyboard Navigation | All actions keyboard accessible |

---

## 8. Data Requirements

### 8.1 Data Model Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORE DATA ENTITIES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐         ┌─────────────────┐         ┌─────────────────┐   │
│   │    USERS    │────────▶│   USER_PHASES   │         │  WALLET_BALANCES│   │
│   │             │         │                 │         │                 │   │
│   │ • id        │         │ • current_phase │         │ • total_balance │   │
│   │ • mobile    │◀────────│ • total_steps   │◀───────▶│ • total_earned  │   │
│   │ • full_name │         │ • phase_start   │         │ • total_redeemed│   │
│   │ • email     │         └────────┬────────┘         └────────┬────────┘   │
│   └──────┬──────┘                  │                           │            │
│          │                         │                           │            │
│          │         ┌───────────────┴───────────────┐           │            │
│          │         ▼                               ▼           │            │
│          │   ┌─────────────┐               ┌─────────────┐     │            │
│          │   │ DAILY_STEPS │               │TRANSACTIONS │◀────┘            │
│          │   │             │               │             │                  │
│          │   │ • date      │──────────────▶│ • type      │                  │
│          │   │ • steps     │               │ • amount    │                  │
│          │   │ • paisa_    │               │ • status    │                  │
│          │   │   earned    │               └─────────────┘                  │
│          │   └─────────────┘                                                │
│          │                                                                  │
│          │         ┌─────────────────────────────────────────┐             │
│          └────────▶│              REFERRALS_NEW              │             │
│                    │                                         │             │
│                    │ • referrer_user_id  • referee_user_id   │             │
│                    │ • daily_step_gift_percentage (10%)      │             │
│                    │ • total_steps_gifted                    │             │
│                    └─────────────────────────────────────────┘             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Data Retention Policy

| Data Type | Retention Period | Action After |
|-----------|------------------|--------------|
| User Account Data | Until deletion + 90 days | Anonymize |
| Step History | 2 years | Archive to cold storage |
| Transaction History | 7 years | Legal requirement |
| Session Logs | 90 days | Delete |
| Audit Logs | 1 year | Archive |
| OTP Logs | 24 hours | Delete |
| Fraud Detection | 1 year | Review & Archive |

### 8.3 Data Privacy (DPDPA Compliance)

| Requirement | Implementation |
|-------------|----------------|
| Consent Collection | Explicit consent at signup |
| Data Access Request | Self-service in app + manual request |
| Data Deletion Request | 30-day grace period, then permanent |
| Data Portability | Export to JSON/CSV |
| Data Minimization | Only collect necessary data |
| Purpose Limitation | Clear data use disclosure |
| Breach Notification | 72-hour notification window |

---

## 9. Security Requirements

### 9.1 Authentication Security

| Requirement | Implementation |
|-------------|----------------|
| OTP Security | bcrypt hashing (8 rounds) |
| OTP Expiry | 3 minutes |
| Rate Limiting | 3 attempts/15 min, 10/day |
| Session Management | JWT with 7-day expiry |
| Password Policy | 8+ chars, mixed case, number, special |
| Multi-Device Support | Device fingerprinting |
| Suspicious Login Alert | Email/SMS notification |

### 9.2 Authorization Security

| Level | Implementation |
|-------|----------------|
| Row-Level Security | Enabled on all user data tables |
| Role-Based Access | user, moderator, admin roles |
| API Authorization | Supabase RLS policies |
| Admin Actions | Audit logging required |
| Privilege Escalation | Trigger detection & blocking |

### 9.3 Data Protection

| Protection | Implementation |
|------------|----------------|
| Data at Rest | Supabase encryption (AES-256) |
| Data in Transit | TLS 1.3 |
| PII Masking | Mobile numbers masked in logs |
| Sensitive Fields | Hash passwords, OTPs |
| Backup Encryption | Supabase managed |

### 9.4 Fraud Prevention

| Fraud Type | Detection Method | Action |
|------------|------------------|--------|
| Step Shaking | GPS speed validation | Flag + Warning |
| Simulator | Device trust scoring | Block |
| Multiple Accounts | Mobile/device fingerprint | Merge/Ban |
| Referral Abuse | Pattern detection | Bonus revocation |
| Wallet Manipulation | Transaction anomaly | Freeze + Review |

### 9.5 Security Monitoring

```sql
-- Audit Log Structure
INSERT INTO audit_logs (user_id, action, details, ip_address, user_agent)
VALUES (
    auth.uid(),
    'security_event_type',
    jsonb_build_object('severity', 'high', 'details', ...),
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent'
);
```

---

## 10. Release Criteria

### 10.1 MVP Release Checklist

#### Functionality

- [ ] WhatsApp OTP authentication working
- [ ] Email/password authentication working
- [ ] Native step tracking on Android
- [ ] Native step tracking on iOS
- [ ] Background step counting
- [ ] Paisa earning calculation
- [ ] Daily redemption to wallet
- [ ] Phase progression system
- [ ] Transaction history display
- [ ] Profile management

#### Quality

- [ ] 0 P0 (Critical) bugs
- [ ] < 5 P1 (Major) bugs
- [ ] App crash rate < 1%
- [ ] ANR rate < 0.5%
- [ ] Performance metrics met

#### Security

- [ ] RLS policies verified
- [ ] OTP rate limiting tested
- [ ] Fraud detection functional
- [ ] Data encryption verified
- [ ] Penetration testing passed

### 10.2 Beta Release Checklist

All MVP items plus:

- [ ] Referral system functional
- [ ] Spin wheel working
- [ ] Basic achievements unlocking
- [ ] Streak tracking accurate
- [ ] Push notifications working
- [ ] 1,000+ beta testers
- [ ] Feedback collection system

### 10.3 Production Release Checklist

All Beta items plus:

- [ ] Challenges feature complete
- [ ] Leaderboards functional
- [ ] Social features working
- [ ] Analytics dashboard
- [ ] Customer support system
- [ ] Legal compliance verified
- [ ] App Store/Play Store approved

---

## 11. Appendix

### 11.1 Glossary

| Term | Definition |
|------|------------|
| **Paisa** | Smallest currency unit (100 paisa = ₹1) |
| **Phase** | User progression tier (1-9) |
| **Capped Steps** | Steps counted toward earning (max 12,000/day) |
| **Bonus Steps** | Extra steps from referrals/motivations |
| **Streak** | Consecutive days of 5,000+ steps |
| **Referee** | User who signed up via referral |
| **Referrer** | User who shared referral code |
| **RLS** | Row-Level Security (Postgres feature) |

### 11.2 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-12-19 | YogicMile Team | Initial PRD |

### 11.3 Related Documents

| Document | Purpose |
|----------|---------|
| README.md | Project overview |
| README-REFERRAL-SYSTEM.md | Referral system details |
| README-STEP-TRACKING.md | Step tracking implementation |
| ANDROID-TESTING-GUIDE.md | Android testing procedures |
| NATIVE-STEP-TRACKING-COMPLETE.md | Native implementation details |

### 11.4 Stakeholder Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| QA Lead | | | |
| Security Lead | | | |
| Business Sponsor | | | |

---

**Document Status:** DRAFT  
**Next Review Date:** January 2025  
**Owner:** YogicMile Product Team
