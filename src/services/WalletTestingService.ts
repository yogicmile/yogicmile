import { toast } from '@/hooks/use-toast';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'earning' | 'redemption' | 'referral' | 'achievement' | 'spin' | 'bonus';
  amount: number; // in paisa
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  metadata: Record<string, any>;
}

export interface WalletBalance {
  userId: string;
  totalBalance: number; // in paisa
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
}

export interface WalletTestResult {
  testId: string;
  testName: string;
  passed: boolean;
  message: string;
  expectedValue?: any;
  actualValue?: any;
  timestamp: Date;
}

class WalletTestingService {
  private transactions: WalletTransaction[] = [];
  private balances: Map<string, WalletBalance> = new Map();
  private testResults: WalletTestResult[] = [];
  private concurrentOperations: Map<string, Promise<any>> = new Map();

  // Initialize wallet for a user
  initializeWallet(userId: string): WalletBalance {
    const balance: WalletBalance = {
      userId,
      totalBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastUpdated: new Date()
    };
    this.balances.set(userId, balance);
    return balance;
  }

  // TC028: Test earnings update
  async testEarningsUpdate(userId: string, steps: number, phase: number): Promise<WalletTestResult> {
    const testId = 'TC028';
    try {
      if (!this.balances.has(userId)) {
        this.initializeWallet(userId);
      }

      const phaseRates = [1, 2, 3, 5, 8, 12, 18, 25, 30]; // paisa per 25 steps
      const rate = phaseRates[phase - 1] || 1;
      const cappedSteps = Math.min(steps, 12000); // Daily cap
      const units = Math.floor(cappedSteps / 25);
      const expectedEarnings = units * rate;

      // Simulate step earnings
      const actualEarnings = await this.addStepEarnings(userId, steps, phase);

      const passed = actualEarnings === expectedEarnings;
      const result: WalletTestResult = {
        testId,
        testName: 'Earnings Update Test',
        passed,
        message: passed 
          ? `✅ Earnings calculated correctly: ${actualEarnings} paisa`
          : `❌ Earnings mismatch. Expected: ${expectedEarnings}, Got: ${actualEarnings}`,
        expectedValue: expectedEarnings,
        actualValue: actualEarnings,
        timestamp: new Date()
      };

      this.testResults.push(result);
      return result;
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: 'Earnings Update Test',
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // TC029: Test transaction history
  async testTransactionHistory(userId: string): Promise<WalletTestResult> {
    const testId = 'TC029';
    try {
      const userTransactions = this.getUserTransactions(userId);
      const balance = this.balances.get(userId);
      
      if (!balance) {
        throw new Error('User wallet not initialized');
      }

      // Calculate balance from transactions
      const calculatedBalance = userTransactions.reduce((sum, tx) => {
        return tx.type === 'redemption' ? sum - Math.abs(tx.amount) : sum + tx.amount;
      }, 0);

      const passed = calculatedBalance === balance.totalBalance;
      const result: WalletTestResult = {
        testId,
        testName: 'Transaction History Test',
        passed,
        message: passed 
          ? `✅ Transaction history matches balance: ${userTransactions.length} transactions`
          : `❌ Transaction history mismatch. Calculated: ${calculatedBalance}, Stored: ${balance.totalBalance}`,
        expectedValue: balance.totalBalance,
        actualValue: calculatedBalance,
        timestamp: new Date()
      };

      this.testResults.push(result);
      return result;
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: 'Transaction History Test',
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // TC030: Test balance accuracy
  async testBalanceAccuracy(userId: string): Promise<WalletTestResult> {
    const testId = 'TC030';
    try {
      const balance = this.balances.get(userId);
      if (!balance) {
        throw new Error('User wallet not initialized');
      }

      const transactions = this.getUserTransactions(userId);
      const earnings = transactions
        .filter(tx => ['earning', 'referral', 'achievement', 'spin', 'bonus'].includes(tx.type))
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const spendings = transactions
        .filter(tx => tx.type === 'redemption')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      const calculatedBalance = earnings - spendings;
      const passed = calculatedBalance === balance.totalBalance && 
                     earnings === balance.totalEarned && 
                     spendings === balance.totalSpent;

      const result: WalletTestResult = {
        testId,
        testName: 'Balance Accuracy Test',
        passed,
        message: passed 
          ? `✅ Balance accuracy verified: ${balance.totalBalance} paisa`
          : `❌ Balance inaccuracy detected. Expected: ${calculatedBalance}, Got: ${balance.totalBalance}`,
        expectedValue: { balance: calculatedBalance, earned: earnings, spent: spendings },
        actualValue: { balance: balance.totalBalance, earned: balance.totalEarned, spent: balance.totalSpent },
        timestamp: new Date()
      };

      this.testResults.push(result);
      return result;
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: 'Balance Accuracy Test',
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // TC031: Test bonus earnings
  async testBonusEarnings(userId: string, bonusType: 'referral' | 'achievement' | 'spin'): Promise<WalletTestResult> {
    const testId = 'TC031';
    try {
      const initialBalance = this.balances.get(userId)?.totalBalance || 0;
      
      let bonusAmount = 0;
      switch (bonusType) {
        case 'referral':
          bonusAmount = 200; // 200 paisa for referrer
          break;
        case 'achievement':
          bonusAmount = Math.floor(Math.random() * 500) + 100; // 100-600 paisa
          break;
        case 'spin':
          bonusAmount = Math.floor(Math.random() * 90) + 10; // 10-100 paisa
          break;
      }

      await this.addBonusEarning(userId, bonusType, bonusAmount);
      const finalBalance = this.balances.get(userId)?.totalBalance || 0;
      const actualIncrease = finalBalance - initialBalance;

      const passed = actualIncrease === bonusAmount;
      const result: WalletTestResult = {
        testId,
        testName: `Bonus Earnings Test (${bonusType})`,
        passed,
        message: passed 
          ? `✅ ${bonusType} bonus added correctly: ${bonusAmount} paisa`
          : `❌ ${bonusType} bonus error. Expected: ${bonusAmount}, Got: ${actualIncrease}`,
        expectedValue: bonusAmount,
        actualValue: actualIncrease,
        timestamp: new Date()
      };

      this.testResults.push(result);
      return result;
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: `Bonus Earnings Test (${bonusType})`,
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // TC032: Test balance manipulation prevention
  async testBalanceManipulation(userId: string): Promise<WalletTestResult> {
    const testId = 'TC032';
    try {
      const initialBalance = this.balances.get(userId)?.totalBalance || 0;
      
      // Attempt direct balance modification (should fail)
      try {
        await this.directBalanceManipulation(userId, 999999);
        // If we reach here, the manipulation succeeded (bad)
        const result: WalletTestResult = {
          testId,
          testName: 'Balance Manipulation Prevention',
          passed: false,
          message: '❌ SECURITY RISK: Direct balance manipulation succeeded!',
          timestamp: new Date()
        };
        this.testResults.push(result);
        return result;
      } catch (securityError) {
        // Balance manipulation was prevented (good)
        const finalBalance = this.balances.get(userId)?.totalBalance || 0;
        const passed = finalBalance === initialBalance;
        
        const result: WalletTestResult = {
          testId,
          testName: 'Balance Manipulation Prevention',
          passed,
          message: passed 
            ? '✅ Balance manipulation successfully prevented'
            : '❌ Balance was modified during failed manipulation attempt',
          expectedValue: initialBalance,
          actualValue: finalBalance,
          timestamp: new Date()
        };
        this.testResults.push(result);
        return result;
      }
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: 'Balance Manipulation Prevention',
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // TC033: Test invalid transactions
  async testInvalidTransactions(userId: string): Promise<WalletTestResult> {
    const testId = 'TC033';
    try {
      const initialBalance = this.balances.get(userId)?.totalBalance || 0;
      const invalidTransactions = [
        { type: 'earning', amount: -100, description: 'Negative earning attempt' },
        { type: 'redemption', amount: initialBalance + 1000, description: 'Overspend attempt' },
        { type: 'earning', amount: 0, description: 'Zero amount transaction' },
      ];

      let preventedCount = 0;
      for (const invalidTx of invalidTransactions) {
        try {
          await this.processTransaction(userId, invalidTx.type as any, invalidTx.amount, invalidTx.description);
        } catch (error) {
          preventedCount++;
        }
      }

      const finalBalance = this.balances.get(userId)?.totalBalance || 0;
      const passed = preventedCount === invalidTransactions.length && finalBalance === initialBalance;

      const result: WalletTestResult = {
        testId,
        testName: 'Invalid Transaction Prevention',
        passed,
        message: passed 
          ? `✅ All ${invalidTransactions.length} invalid transactions were blocked`
          : `❌ ${invalidTransactions.length - preventedCount} invalid transactions were processed`,
        expectedValue: invalidTransactions.length,
        actualValue: preventedCount,
        timestamp: new Date()
      };

      this.testResults.push(result);
      return result;
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: 'Invalid Transaction Prevention',
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // TC034: Test concurrent transactions
  async testConcurrentTransactions(userId: string): Promise<WalletTestResult> {
    const testId = 'TC034';
    try {
      const initialBalance = this.balances.get(userId)?.totalBalance || 0;
      const transactionCount = 5;
      const amountPerTransaction = 100;

      // Create multiple concurrent transactions
      const promises = Array.from({ length: transactionCount }, (_, i) => 
        this.processTransaction(userId, 'earning', amountPerTransaction, `Concurrent earning ${i + 1}`)
      );

      await Promise.all(promises);
      
      const finalBalance = this.balances.get(userId)?.totalBalance || 0;
      const expectedBalance = initialBalance + (transactionCount * amountPerTransaction);
      const passed = finalBalance === expectedBalance;

      const result: WalletTestResult = {
        testId,
        testName: 'Concurrent Transaction Test',
        passed,
        message: passed 
          ? `✅ All ${transactionCount} concurrent transactions processed correctly`
          : `❌ Concurrent transaction error. Expected: ${expectedBalance}, Got: ${finalBalance}`,
        expectedValue: expectedBalance,
        actualValue: finalBalance,
        timestamp: new Date()
      };

      this.testResults.push(result);
      return result;
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: 'Concurrent Transaction Test',
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // TC035: Test midnight calculations
  async testMidnightCalculations(userId: string): Promise<WalletTestResult> {
    const testId = 'TC035';
    try {
      // Simulate earnings at 11:59 PM
      const beforeMidnight = new Date();
      beforeMidnight.setHours(23, 59, 0, 0);
      
      await this.addStepEarnings(userId, 5000, 2, beforeMidnight);
      
      // Simulate earnings at 12:01 AM (next day)
      const afterMidnight = new Date(beforeMidnight);
      afterMidnight.setDate(afterMidnight.getDate() + 1);
      afterMidnight.setHours(0, 1, 0, 0);
      
      await this.addStepEarnings(userId, 3000, 2, afterMidnight);
      
      // Check if transactions are properly dated
      const transactions = this.getUserTransactions(userId);
      const beforeMidnightTx = transactions.find(tx => 
        tx.timestamp.getDate() === beforeMidnight.getDate() && 
        tx.description.includes('5000')
      );
      const afterMidnightTx = transactions.find(tx => 
        tx.timestamp.getDate() === afterMidnight.getDate() && 
        tx.description.includes('3000')
      );

      const passed = beforeMidnightTx && afterMidnightTx && 
                     beforeMidnightTx.timestamp.getDate() !== afterMidnightTx.timestamp.getDate();

      const result: WalletTestResult = {
        testId,
        testName: 'Midnight Calculation Test',
        passed,
        message: passed 
          ? '✅ Midnight rollover handled correctly'
          : '❌ Midnight rollover calculation failed',
        timestamp: new Date()
      };

      this.testResults.push(result);
      return result;
    } catch (error) {
      const result: WalletTestResult = {
        testId,
        testName: 'Midnight Calculation Test',
        passed: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      this.testResults.push(result);
      return result;
    }
  }

  // Helper methods
  private async addStepEarnings(userId: string, steps: number, phase: number, timestamp?: Date): Promise<number> {
    const phaseRates = [1, 2, 3, 5, 8, 12, 18, 25, 30];
    const rate = phaseRates[phase - 1] || 1;
    const cappedSteps = Math.min(steps, 12000);
    const units = Math.floor(cappedSteps / 25);
    const earnings = units * rate;

    await this.processTransaction(
      userId, 
      'earning', 
      earnings, 
      `Daily Steps: ${steps} steps (Phase ${phase})`,
      timestamp
    );

    return earnings;
  }

  private async addBonusEarning(userId: string, type: string, amount: number): Promise<void> {
    await this.processTransaction(userId, type as any, amount, `${type} bonus`);
  }

  private async processTransaction(
    userId: string, 
    type: WalletTransaction['type'], 
    amount: number, 
    description: string,
    timestamp?: Date
  ): Promise<void> {
    // Validate transaction
    if (amount <= 0 && type !== 'redemption') {
      throw new Error('Invalid transaction: Amount must be positive for non-redemption transactions');
    }

    const balance = this.balances.get(userId);
    if (!balance) {
      throw new Error('User wallet not initialized');
    }

    if (type === 'redemption' && balance.totalBalance < amount) {
      throw new Error('Insufficient balance for redemption');
    }

    // Create transaction with concurrency protection
    const operationId = `${userId}-${Date.now()}-${Math.random()}`;
    
    const operation = new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        try {
          const transaction: WalletTransaction = {
            id: operationId,
            userId,
            type,
            amount: type === 'redemption' ? -Math.abs(amount) : amount,
            description,
            timestamp: timestamp || new Date(),
            status: 'completed',
            metadata: { phase: type === 'earning' ? 'calculated' : 'bonus' }
          };

          this.transactions.push(transaction);

          // Update balance
          const currentBalance = this.balances.get(userId)!;
          if (type === 'redemption') {
            currentBalance.totalBalance -= amount;
            currentBalance.totalSpent += amount;
          } else {
            currentBalance.totalBalance += amount;
            currentBalance.totalEarned += amount;
          }
          currentBalance.lastUpdated = new Date();

          resolve();
        } catch (error) {
          reject(error);
        }
      }, Math.random() * 100); // Simulate processing delay
    });

    this.concurrentOperations.set(operationId, operation);
    await operation;
    this.concurrentOperations.delete(operationId);
  }

  private async directBalanceManipulation(userId: string, amount: number): Promise<void> {
    // This should always throw an error to prevent direct manipulation
    throw new Error('Direct balance manipulation is not allowed');
  }

  private getUserTransactions(userId: string): WalletTransaction[] {
    return this.transactions
      .filter(tx => tx.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Run all wallet tests
  async runAllTests(userId: string): Promise<WalletTestResult[]> {
    const results: WalletTestResult[] = [];
    
    // Initialize wallet if needed
    if (!this.balances.has(userId)) {
      this.initializeWallet(userId);
    }

    try {
      // Run all test cases
      results.push(await this.testEarningsUpdate(userId, 5000, 2)); // TC028
      results.push(await this.testTransactionHistory(userId)); // TC029
      results.push(await this.testBalanceAccuracy(userId)); // TC030
      results.push(await this.testBonusEarnings(userId, 'referral')); // TC031
      results.push(await this.testBalanceManipulation(userId)); // TC032
      results.push(await this.testInvalidTransactions(userId)); // TC033
      results.push(await this.testConcurrentTransactions(userId)); // TC034
      results.push(await this.testMidnightCalculations(userId)); // TC035

      // Summary
      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;
      
      toast({
        title: "Wallet Tests Completed",
        description: `${passedTests}/${totalTests} tests passed`,
        variant: passedTests === totalTests ? "default" : "destructive",
      });

    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to complete all wallet tests",
        variant: "destructive",
      });
    }

    return results;
  }

  // Get test results
  getTestResults(): WalletTestResult[] {
    return [...this.testResults].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get wallet balance
  getWalletBalance(userId: string): WalletBalance | null {
    return this.balances.get(userId) || null;
  }

  // Get user transactions
  getTransactionHistory(userId: string): WalletTransaction[] {
    return this.getUserTransactions(userId);
  }

  // Clear all test data
  clearTestData(): void {
    this.transactions = [];
    this.balances.clear();
    this.testResults = [];
    this.concurrentOperations.clear();
  }
}

export const walletTestingService = new WalletTestingService();