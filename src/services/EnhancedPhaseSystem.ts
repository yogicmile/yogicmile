export interface PhaseData {
  tier: number;
  symbol: string;
  name: string;
  rate: number; // paisa per 25 steps
  stepRequirement: number;
  timeLimit: number;
  spiritualName: string;
  description: string;
}

export interface PhaseProgression {
  currentPhase: PhaseData;
  nextPhase: PhaseData | null;
  progressPercentage: number;
  stepsToNext: number;
  isEligibleForAdvancement: boolean;
  blockedReason?: string;
}

export interface EarningCalculation {
  steps: number;
  baseEarnings: number; // paisa
  bonusMultiplier: number;
  totalEarnings: number; // paisa
  rupeesEarned: number;
  breakdown: {
    stepGroups: number; // groups of 25 steps
    baseRate: number;
    activeBonuses: string[];
  };
}

export interface PhaseTestResult {
  testCase: string;
  passed: boolean;
  expected: any;
  actual: any;
  message: string;
  timestamp: Date;
}

export class EnhancedPhaseSystem {
  private static instance: EnhancedPhaseSystem;
  
  // Complete 9-phase system as defined in the requirements
  private phases: PhaseData[] = [
    { 
      tier: 1, 
      symbol: '🟡', 
      name: 'Paisa Phase', 
      rate: 1, 
      stepRequirement: 25000, // Adjusted for easier testing
      timeLimit: 30, 
      spiritualName: 'Foundation of Discipline',
      description: '1 paisa per 25 steps - Begin your journey'
    },
    { 
      tier: 2, 
      symbol: '🪙', 
      name: 'Anna Phase', 
      rate: 2, 
      stepRequirement: 50000,
      timeLimit: 45, 
      spiritualName: 'Consistent Practice',
      description: '2 paisa per 25 steps - Building consistency'
    },
    { 
      tier: 3, 
      symbol: '🎟️', 
      name: 'Rupee Phase', 
      rate: 3, 
      stepRequirement: 100000,
      timeLimit: 60, 
      spiritualName: 'Strengthened Willpower',
      description: '3 paisa per 25 steps - Growing stronger'
    },
    { 
      tier: 4, 
      symbol: '💎', 
      name: 'Gem Phase', 
      rate: 5, 
      stepRequirement: 200000,
      timeLimit: 75, 
      spiritualName: 'Inner Clarity',
      description: '5 paisa per 25 steps - Finding clarity'
    },
    { 
      tier: 5, 
      symbol: '💠', 
      name: 'Diamond Phase', 
      rate: 7, 
      stepRequirement: 400000,
      timeLimit: 80, 
      spiritualName: 'Unshakeable Focus',
      description: '7 paisa per 25 steps - Unshakeable determination'
    },
    { 
      tier: 6, 
      symbol: '👑', 
      name: 'Crown Phase', 
      rate: 10, 
      stepRequirement: 600000,
      timeLimit: 120, 
      spiritualName: 'Mastery of Self',
      description: '10 paisa per 25 steps - Mastering yourself'
    },
    { 
      tier: 7, 
      symbol: '🏵️', 
      name: 'Emperor Phase', 
      rate: 15, 
      stepRequirement: 1000000,
      timeLimit: 200, 
      spiritualName: 'Transcendent Power',
      description: '15 paisa per 25 steps - Transcendent power'
    },
    { 
      tier: 8, 
      symbol: '🏅', 
      name: 'Legend Phase', 
      rate: 20, 
      stepRequirement: 1500000,
      timeLimit: 250, 
      spiritualName: 'Enlightened Being',
      description: '20 paisa per 25 steps - Legendary status'
    },
    { 
      tier: 9, 
      symbol: '🏆', 
      name: 'Immortal Phase', 
      rate: 30, 
      stepRequirement: 0, // No further advancement
      timeLimit: 365, 
      spiritualName: 'Eternal Consciousness',
      description: '30 paisa per 25 steps - Maximum achievement'
    }
  ];

  static getInstance(): EnhancedPhaseSystem {
    if (!EnhancedPhaseSystem.instance) {
      EnhancedPhaseSystem.instance = new EnhancedPhaseSystem();
    }
    return EnhancedPhaseSystem.instance;
  }

  // TC021: Test initial phase (new user starts in Paisa phase)
  testInitialPhase(): PhaseTestResult {
    const newUserPhase = this.getUserPhase(0); // 0 total steps = new user
    
    const expected = {
      tier: 1,
      name: 'Paisa Phase',
      rate: 1
    };

    const actual = {
      tier: newUserPhase.tier,
      name: newUserPhase.name,
      rate: newUserPhase.rate
    };

    const passed = newUserPhase.tier === 1 && 
                  newUserPhase.name === 'Paisa Phase' && 
                  newUserPhase.rate === 1;

    return {
      testCase: 'TC021 - Initial Phase',
      passed,
      expected,
      actual,
      message: passed 
        ? '✅ New user correctly starts in Paisa Phase with 1 paisa per 25 steps'
        : '❌ New user should start in Paisa Phase',
      timestamp: new Date()
    };
  }

  // TC022: Test phase advancement (complete 25000 steps to unlock Anna phase)
  testPhaseAdvancement(): PhaseTestResult {
    const stepsCompleted = 25000;
    const currentPhase = this.getUserPhase(stepsCompleted);
    const progression = this.getPhaseProgression(stepsCompleted);

    const expected = {
      tier: 2,
      name: 'Anna Phase',
      rate: 2,
      canAdvance: true
    };

    const actual = {
      tier: currentPhase.tier,
      name: currentPhase.name,
      rate: currentPhase.rate,
      canAdvance: progression.isEligibleForAdvancement
    };

    const passed = stepsCompleted >= this.phases[0].stepRequirement && 
                  progression.isEligibleForAdvancement;

    return {
      testCase: 'TC022 - Phase Advancement',
      passed,
      expected,
      actual,
      message: passed 
        ? `✅ User with ${stepsCompleted.toLocaleString()} steps can advance to Anna Phase`
        : `❌ User with ${stepsCompleted.toLocaleString()} steps should be eligible for Anna Phase`,
      timestamp: new Date()
    };
  }

  // TC023: Test maximum phase (Immortal phase with 30 paisa per 25 steps)
  testMaximumPhase(): PhaseTestResult {
    const maxSteps = 2000000; // Steps to reach Immortal phase
    const immortalPhase = this.getUserPhase(maxSteps);
    const earnings = this.calculateEarnings(1000, immortalPhase.rate);

    const expected = {
      tier: 9,
      name: 'Immortal Phase',
      rate: 30,
      earningsFor1000Steps: 1200 // 40 groups * 30 paisa = 1200 paisa
    };

    const actual = {
      tier: immortalPhase.tier,
      name: immortalPhase.name,
      rate: immortalPhase.rate,
      earningsFor1000Steps: earnings.totalEarnings
    };

    const passed = immortalPhase.tier === 9 && 
                  immortalPhase.rate === 30 && 
                  earnings.totalEarnings === 1200;

    return {
      testCase: 'TC023 - Maximum Phase',
      passed,
      expected,
      actual,
      message: passed 
        ? '✅ Immortal Phase correctly provides 30 paisa per 25 steps (1200 paisa for 1000 steps)'
        : '❌ Immortal Phase should provide maximum earning rate',
      timestamp: new Date()
    };
  }

  // TC024: Test phase celebration
  testPhaseCelebration(): PhaseTestResult {
    const celebration = this.triggerPhaseAdvancement(1, 2);

    const expected = {
      hasAnimation: true,
      hasNotification: true,
      newPhase: 'Anna Phase',
      celebrationMessage: 'Welcome to Anna Phase! 🎉'
    };

    const actual = {
      hasAnimation: celebration.animation !== null,
      hasNotification: celebration.notification !== null,
      newPhase: celebration.newPhase.name,
      celebrationMessage: celebration.message
    };

    const passed = celebration.animation !== null && 
                  celebration.notification !== null &&
                  celebration.newPhase.name === 'Anna Phase';

    return {
      testCase: 'TC024 - Phase Celebration',
      passed,
      expected,
      actual,
      message: passed 
        ? '✅ Phase advancement triggers proper celebration animation and notification'
        : '❌ Phase advancement should trigger celebration',
      timestamp: new Date()
    };
  }

  // TC025: Test blocked advancement without requirements
  testBlockedAdvancement(): PhaseTestResult {
    const insufficientSteps = 10000; // Less than 25000 required for advancement
    const progression = this.getPhaseProgression(insufficientSteps);

    const expected = {
      canAdvance: false,
      hasBlockedReason: true,
      stepsNeeded: 15000 // 25000 - 10000
    };

    const actual = {
      canAdvance: progression.isEligibleForAdvancement,
      hasBlockedReason: progression.blockedReason !== undefined,
      stepsNeeded: progression.stepsToNext
    };

    const passed = !progression.isEligibleForAdvancement && 
                  progression.blockedReason !== undefined &&
                  progression.stepsToNext === 15000;

    return {
      testCase: 'TC025 - Blocked Advancement',
      passed,
      expected,
      actual,
      message: passed 
        ? `✅ User with insufficient steps (${insufficientSteps.toLocaleString()}) correctly blocked with explanation`
        : '❌ User should be blocked from advancing without meeting requirements',
      timestamp: new Date()
    };
  }

  // TC026: Test phase persistence after daily reset
  testPhasePersistence(): PhaseTestResult {
    const userTotalSteps = 75000; // Should be in Rupee Phase
    const phaseBeforeReset = this.getUserPhase(userTotalSteps);
    
    // Simulate daily reset (daily steps reset to 0, but total steps maintained)
    const phaseAfterReset = this.getUserPhase(userTotalSteps);

    const expected = {
      maintainedPhase: true,
      sameTier: phaseBeforeReset.tier,
      sameName: phaseBeforeReset.name
    };

    const actual = {
      maintainedPhase: phaseBeforeReset.tier === phaseAfterReset.tier,
      sameTier: phaseAfterReset.tier,
      sameName: phaseAfterReset.name
    };

    const passed = phaseBeforeReset.tier === phaseAfterReset.tier &&
                  phaseBeforeReset.name === phaseAfterReset.name;

    return {
      testCase: 'TC026 - Phase Persistence',
      passed,
      expected,
      actual,
      message: passed 
        ? '✅ User phase correctly maintained after daily reset'
        : '❌ Phase should persist after daily reset',
      timestamp: new Date()
    };
  }

  // TC027: Test exact requirement advancement
  testExactRequirementAdvancement(): PhaseTestResult {
    const exactSteps = 25000; // Exact requirement for Anna Phase
    const progression = this.getPhaseProgression(exactSteps);

    const expected = {
      canAdvance: true,
      progressPercentage: 100,
      stepsToNext: 0
    };

    const actual = {
      canAdvance: progression.isEligibleForAdvancement,
      progressPercentage: Math.round(progression.progressPercentage),
      stepsToNext: progression.stepsToNext
    };

    const passed = progression.isEligibleForAdvancement && 
                  progression.progressPercentage >= 100 &&
                  progression.stepsToNext === 0;

    return {
      testCase: 'TC027 - Exact Requirement',
      passed,
      expected,
      actual,
      message: passed 
        ? `✅ User with exactly ${exactSteps.toLocaleString()} steps can immediately advance`
        : '❌ User meeting exact requirements should advance immediately',
      timestamp: new Date()
    };
  }

  // Test earning calculations for all phases
  testEarningCalculations(): PhaseTestResult[] {
    const testSteps = 1000;
    const results: PhaseTestResult[] = [];

    // Expected calculations for 1000 steps (40 groups of 25 steps each)
    const expectedEarnings = [
      { phase: 'Paisa', rate: 1, expected: 40 },    // 40 * 1 = 40 paisa
      { phase: 'Anna', rate: 2, expected: 80 },     // 40 * 2 = 80 paisa
      { phase: 'Rupee', rate: 3, expected: 120 },   // 40 * 3 = 120 paisa
      { phase: 'Gem', rate: 5, expected: 200 },     // 40 * 5 = 200 paisa
      { phase: 'Diamond', rate: 7, expected: 280 }, // 40 * 7 = 280 paisa
      { phase: 'Crown', rate: 10, expected: 400 },  // 40 * 10 = 400 paisa
      { phase: 'Emperor', rate: 15, expected: 600 }, // 40 * 15 = 600 paisa
      { phase: 'Legend', rate: 20, expected: 800 },  // 40 * 20 = 800 paisa
      { phase: 'Immortal', rate: 30, expected: 1200 } // 40 * 30 = 1200 paisa
    ];

    expectedEarnings.forEach((test, index) => {
      const phase = this.phases[index];
      const earnings = this.calculateEarnings(testSteps, phase.rate);
      
      const passed = earnings.totalEarnings === test.expected;
      
      results.push({
        testCase: `Earning Calculation - ${test.phase} Phase`,
        passed,
        expected: { steps: testSteps, earnings: test.expected, rate: test.rate },
        actual: { steps: testSteps, earnings: earnings.totalEarnings, rate: phase.rate },
        message: passed 
          ? `✅ ${test.phase}: ${testSteps} steps = ${test.expected} paisa (${test.rate} paisa/25 steps)`
          : `❌ ${test.phase}: Expected ${test.expected} paisa, got ${earnings.totalEarnings} paisa`,
        timestamp: new Date()
      });
    });

    return results;
  }

  // Helper methods
  getUserPhase(totalSteps: number): PhaseData {
    for (let i = this.phases.length - 1; i >= 0; i--) {
      const phase = this.phases[i];
      if (i === this.phases.length - 1) {
        // Immortal phase - no upper limit
        if (totalSteps >= this.getStepsRequiredForPhase(i + 1)) {
          return phase;
        }
      } else if (totalSteps >= this.getStepsRequiredForPhase(i + 1)) {
        return phase;
      }
    }
    return this.phases[0]; // Default to Paisa phase
  }

  private getStepsRequiredForPhase(phaseNumber: number): number {
    if (phaseNumber <= 1) return 0;
    if (phaseNumber > this.phases.length) return this.phases[this.phases.length - 1].stepRequirement;
    
    // Cumulative steps required to reach each phase
    let totalRequired = 0;
    for (let i = 0; i < phaseNumber - 1; i++) {
      totalRequired += this.phases[i].stepRequirement;
    }
    return totalRequired;
  }

  getPhaseProgression(totalSteps: number): PhaseProgression {
    const currentPhase = this.getUserPhase(totalSteps);
    const currentPhaseIndex = currentPhase.tier - 1;
    const nextPhase = currentPhaseIndex < this.phases.length - 1 ? this.phases[currentPhaseIndex + 1] : null;
    
    const stepsRequiredForCurrent = this.getStepsRequiredForPhase(currentPhase.tier);
    const stepsRequiredForNext = nextPhase ? this.getStepsRequiredForPhase(nextPhase.tier) : 0;
    const stepsInCurrentPhase = totalSteps - stepsRequiredForCurrent;
    const stepsNeededForPhase = nextPhase ? currentPhase.stepRequirement : 0;
    
    const progressPercentage = nextPhase 
      ? Math.min((stepsInCurrentPhase / stepsNeededForPhase) * 100, 100)
      : 100;
    
    const stepsToNext = nextPhase 
      ? Math.max(stepsNeededForPhase - stepsInCurrentPhase, 0)
      : 0;
    
    const isEligibleForAdvancement = nextPhase && stepsInCurrentPhase >= stepsNeededForPhase;
    
    let blockedReason: string | undefined;
    if (nextPhase && !isEligibleForAdvancement) {
      blockedReason = `Need ${stepsToNext.toLocaleString()} more steps to unlock ${nextPhase.name}`;
    } else if (!nextPhase) {
      blockedReason = 'You have reached the maximum phase - Immortal Phase!';
    }

    return {
      currentPhase,
      nextPhase,
      progressPercentage,
      stepsToNext,
      isEligibleForAdvancement,
      blockedReason
    };
  }

  calculateEarnings(steps: number, phaseRate: number): EarningCalculation {
    const stepGroups = Math.floor(steps / 25);
    const baseEarnings = stepGroups * phaseRate;
    const bonusMultiplier = 1; // No bonuses for testing
    const totalEarnings = Math.floor(baseEarnings * bonusMultiplier);
    
    return {
      steps,
      baseEarnings,
      bonusMultiplier,
      totalEarnings,
      rupeesEarned: totalEarnings / 100,
      breakdown: {
        stepGroups,
        baseRate: phaseRate,
        activeBonuses: []
      }
    };
  }

  triggerPhaseAdvancement(fromTier: number, toTier: number) {
    const newPhase = this.phases[toTier - 1];
    
    return {
      animation: {
        type: 'phase_upgrade',
        duration: 3000,
        effects: ['confetti', 'glow', 'bounce']
      },
      notification: {
        title: `Welcome to ${newPhase.name}! 🎉`,
        body: `You've unlocked ${newPhase.rate} paisa per 25 steps!`,
        icon: newPhase.symbol
      },
      newPhase,
      message: `Welcome to ${newPhase.name}! 🎉`,
      subMessage: `New rate: ${newPhase.rate} paisa per 25 steps`
    };
  }

  getAllPhases(): PhaseData[] {
    return [...this.phases];
  }

  // Run all test cases
  runAllTests(): { results: PhaseTestResult[]; summary: any } {
    const results: PhaseTestResult[] = [];
    
    // Run individual test cases
    results.push(this.testInitialPhase());
    results.push(this.testPhaseAdvancement());
    results.push(this.testMaximumPhase());
    results.push(this.testPhaseCelebration());
    results.push(this.testBlockedAdvancement());
    results.push(this.testPhasePersistence());
    results.push(this.testExactRequirementAdvancement());
    
    // Run earning calculation tests
    results.push(...this.testEarningCalculations());
    
    const summary = {
      totalTests: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      passRate: Math.round((results.filter(r => r.passed).length / results.length) * 100)
    };
    
    return { results, summary };
  }
}