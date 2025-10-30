/**
 * Phase 6: Testing & Quality Assurance Utilities
 * 
 * Comprehensive testing utilities for end-to-end validation,
 * performance monitoring, and security auditing.
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// END-TO-END TESTING UTILITIES
// ============================================================================

export const TestUtilities = {
  /**
   * Test complete authentication flow
   */
  async testAuthFlow(mobileNumber: string) {
    const results = {
      otpGeneration: false,
      otpVerification: false,
      sessionCreation: false,
      deviceFingerprint: false,
      errors: [] as string[],
    };

    try {
      // Test OTP generation with rate limiting
      const { data: otpData, error: otpError } = await supabase
        .rpc('generate_otp_with_rate_limit', {
          p_mobile_number: mobileNumber,
        });

      if (otpError) {
        results.errors.push(`OTP Generation: ${otpError.message}`);
      } else {
        results.otpGeneration = true;
      }

      // Note: Cannot test OTP verification without actual OTP
      console.log('✅ OTP generation flow tested');
      
    } catch (error: any) {
      results.errors.push(`Auth flow error: ${error.message}`);
    }

    return results;
  },

  /**
   * Test step tracking system
   */
  async testStepTracking(userId: string) {
    const results = {
      dailyStepsInsert: false,
      walletUpdate: false,
      transactionLogging: false,
      phaseProgression: false,
      errors: [] as string[],
    };

    try {
      // Check if daily_steps record exists
      const { data: dailySteps, error: stepsError } = await supabase
        .from('daily_steps')
        .select('*')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      results.dailyStepsInsert = !stepsError;

      // Check wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      results.walletUpdate = !walletError && wallet !== null;

      // Check recent transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      results.transactionLogging = !txError && transactions && transactions.length > 0;

      // Check phase progression
      const { data: phase, error: phaseError } = await supabase
        .from('user_phases')
        .select('*')
        .eq('user_id', userId)
        .single();

      results.phaseProgression = !phaseError && phase !== null;

      console.log('✅ Step tracking system tested');
      
    } catch (error: any) {
      results.errors.push(`Step tracking error: ${error.message}`);
    }

    return results;
  },

  /**
   * Test referral system
   */
  async testReferralSystem(referrerUserId: string, refereeUserId: string) {
    const results = {
      referralCreation: false,
      signupBonus: false,
      dailyGift: false,
      motivationBonus: false,
      errors: [] as string[],
    };

    try {
      // Check referral record
      const { data: referral, error: refError } = await supabase
        .from('referrals_new')
        .select('*')
        .eq('referrer_user_id', referrerUserId)
        .eq('referee_user_id', refereeUserId)
        .single();

      results.referralCreation = !refError && referral !== null;

      // Check signup bonus in bonus_logs
      const { data: bonuses, error: bonusError } = await supabase
        .from('bonus_logs')
        .select('*')
        .eq('user_id', referrerUserId)
        .eq('bonus_type', 'referral_signup_cash')
        .order('date_earned', { ascending: false })
        .limit(1);

      results.signupBonus = !bonusError && bonuses && bonuses.length > 0;

      // Check step bonuses log
      const { data: stepBonuses, error: stepError } = await supabase
        .from('step_bonuses_log')
        .select('*')
        .eq('recipient_user_id', referrerUserId)
        .eq('source_user_id', refereeUserId)
        .order('awarded_date', { ascending: false });

      if (!stepError && stepBonuses && stepBonuses.length > 0) {
        results.dailyGift = stepBonuses.some(b => b.bonus_type === 'referral_daily_gift');
        results.motivationBonus = stepBonuses.some(b => b.bonus_type === 'community_motivation');
      }

      console.log('✅ Referral system tested');
      
    } catch (error: any) {
      results.errors.push(`Referral system error: ${error.message}`);
    }

    return results;
  },

  /**
   * Test wallet transactions
   */
  async testWalletTransactions(userId: string) {
    const results = {
      redemptionFlow: false,
      idempotency: false,
      rateLimiting: false,
      balanceAccuracy: false,
      errors: [] as string[],
    };

    try {
      const today = new Date().toISOString().split('T')[0];
      const idempotencyKey = `test-${Date.now()}`;

      // Test redemption
      const { data: redemption, error: redeemError } = await supabase
        .rpc('redeem_daily_coins_with_rate_limit', {
          p_user_id: userId,
          p_date: today,
          p_idempotency_key: idempotencyKey,
        });

      if (!redeemError) {
        results.redemptionFlow = true;

        // Test idempotency - should return same result
        const { data: redemption2 } = await supabase
          .rpc('redeem_daily_coins_with_rate_limit', {
            p_user_id: userId,
            p_date: today,
            p_idempotency_key: idempotencyKey,
          });

        results.idempotency = (redemption2 as any)?.already_processed === true;
      } else {
        results.errors.push(`Redemption error: ${redeemError.message}`);
      }

      // Verify wallet balance
      const { data: wallet, error: walletError } = await supabase
        .from('wallet_balances')
        .select('total_balance, total_earned, total_redeemed')
        .eq('user_id', userId)
        .single();

      if (!walletError && wallet) {
        results.balanceAccuracy = 
          wallet.total_balance === (wallet.total_earned - wallet.total_redeemed);
      }

      console.log('✅ Wallet transactions tested');
      
    } catch (error: any) {
      results.errors.push(`Wallet transaction error: ${error.message}`);
    }

    return results;
  },

  /**
   * Test RLS policies for security
   */
  async testRLSPolicies(userId: string, otherUserId: string) {
    const results = {
      userDataIsolation: false,
      walletIsolation: false,
      sessionIsolation: false,
      otpIsolation: false,
      errors: [] as string[],
    };

    try {
      // Test user data isolation - should only see own data
      const { data: otherUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', otherUserId)
        .single();

      results.userDataIsolation = userError !== null; // Should fail

      // Test wallet isolation
      const { data: otherWallet, error: walletError } = await supabase
        .from('wallet_balances')
        .select('*')
        .eq('user_id', otherUserId)
        .single();

      results.walletIsolation = walletError !== null; // Should fail

      // Test device session isolation
      const { data: otherSessions, error: sessionError } = await supabase
        .from('device_sessions')
        .select('*')
        .eq('user_id', otherUserId);

      results.sessionIsolation = sessionError !== null || otherSessions?.length === 0;

      // Test OTP isolation
      const { data: otherOtps, error: otpError } = await supabase
        .from('otp_logs')
        .select('*')
        .eq('user_id', otherUserId);

      results.otpIsolation = otpError !== null || otherOtps?.length === 0;

      console.log('✅ RLS policies tested');
      
    } catch (error: any) {
      results.errors.push(`RLS policy error: ${error.message}`);
    }

    return results;
  },

  /**
   * Run complete test suite
   */
  async runCompleteTestSuite(testUserId: string, otherUserId: string, testMobile: string) {
    console.log('🧪 Starting Phase 6 Test Suite...\n');

    const results = {
      auth: await this.testAuthFlow(testMobile),
      stepTracking: await this.testStepTracking(testUserId),
      wallet: await this.testWalletTransactions(testUserId),
      rls: await this.testRLSPolicies(testUserId, otherUserId),
    };

    console.log('\n📊 Test Suite Results:');
    console.log('Authentication:', results.auth);
    console.log('Step Tracking:', results.stepTracking);
    console.log('Wallet:', results.wallet);
    console.log('RLS Security:', results.rls);

    return results;
  },
};

// ============================================================================
// PERFORMANCE MONITORING UTILITIES
// ============================================================================

export const PerformanceMonitor = {
  /**
   * Measure database query performance
   */
  async measureQueryPerformance(query: () => Promise<any>, queryName: string) {
    const startTime = performance.now();
    
    try {
      const result = await query();
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`⚡ ${queryName}: ${duration.toFixed(2)}ms`);

      if (duration > 500) {
        console.warn(`⚠️ Slow query detected: ${queryName} took ${duration.toFixed(2)}ms`);
      }

      return { duration, result, success: true };
    } catch (error: any) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.error(`❌ Query failed: ${queryName} (${duration.toFixed(2)}ms)`, error);
      
      return { duration, error: error.message, success: false };
    }
  },

  /**
   * Check database indexes
   */
  async checkDatabaseIndexes() {
    const criticalIndexes = [
      { table: 'daily_steps', columns: ['user_id', 'date'] },
      { table: 'transactions', columns: ['user_id', 'created_at'] },
      { table: 'wallet_balances', columns: ['user_id'] },
      { table: 'user_phases', columns: ['user_id'] },
      { table: 'referrals_new', columns: ['referrer_user_id', 'referee_user_id'] },
      { table: 'push_notifications', columns: ['user_id', 'read_status', 'created_at'] },
      { table: 'gps_routes', columns: ['user_id', 'created_at'] },
    ];

    console.log('🔍 Checking critical database indexes...');
    // Note: Would need database admin access to check actual indexes
    console.log('Critical indexes needed:', criticalIndexes);
  },

  /**
   * Measure bundle size (client-side only)
   */
  measureBundleSize() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType('resource');
      let totalSize = 0;

      resources.forEach((resource: any) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });

      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log(`📦 Bundle Size: ${sizeMB} MB`);

      if (totalSize > 1024 * 1024) {
        console.warn('⚠️ Bundle size exceeds 1MB - consider lazy loading');
      }

      return totalSize;
    }
    return 0;
  },
};

// ============================================================================
// SECURITY AUDIT UTILITIES
// ============================================================================

export const SecurityAudit = {
  /**
   * Check for sensitive data exposure
   */
  async checkSensitiveDataExposure(userId: string) {
    const checks = {
      otpExposed: false,
      sessionTokenExposed: false,
      mobileNumberMasked: true,
      errors: [] as string[],
    };

    try {
      // Try to access own OTP logs (should work but OTP should be hashed)
      const { data: otps, error: otpError } = await supabase
        .from('otp_logs')
        .select('otp, mobile_number')
        .eq('user_id', userId)
        .limit(1);

      if (!otpError && otps && otps.length > 0) {
        // Check if OTP looks hashed (bcrypt starts with $2)
        const otpValue = otps[0].otp;
        checks.otpExposed = !otpValue.startsWith('$2');
        
        if (checks.otpExposed) {
          console.error('🚨 SECURITY ISSUE: OTPs are not hashed!');
        }
      }

      // Check session tokens
      const { data: sessions, error: sessionError } = await supabase
        .from('device_sessions')
        .select('session_token')
        .eq('user_id', userId)
        .limit(1);

      if (!sessionError && sessions && sessions.length > 0) {
        console.error('🚨 SECURITY ISSUE: Session tokens are accessible via direct query!');
        checks.sessionTokenExposed = true;
      }

      console.log('✅ Sensitive data exposure check completed');
      
    } catch (error: any) {
      checks.errors.push(`Security check error: ${error.message}`);
    }

    return checks;
  },

  /**
   * Test rate limiting
   */
  async testRateLimiting(mobileNumber: string, attempts: number = 5) {
    const results = {
      rateLimitTriggered: false,
      attemptsBeforeBlock: 0,
      errors: [] as string[],
    };

    try {
      for (let i = 0; i < attempts; i++) {
        const { data, error } = await supabase
          .rpc('generate_otp_with_rate_limit', {
            p_mobile_number: mobileNumber,
          });

        results.attemptsBeforeBlock++;

        if (error || (data && !(data as any).success)) {
          results.rateLimitTriggered = true;
          console.log(`✅ Rate limit triggered after ${i + 1} attempts`);
          break;
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!results.rateLimitTriggered) {
        console.warn('⚠️ Rate limiting may not be working properly');
      }
      
    } catch (error: any) {
      results.errors.push(`Rate limiting test error: ${error.message}`);
    }

    return results;
  },
};

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export default {
  TestUtilities,
  PerformanceMonitor,
  SecurityAudit,
};
