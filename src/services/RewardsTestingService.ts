export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number; // Cost in paisa
  category: 'vouchers' | 'bills' | 'cashout' | 'special';
  brand: string;
  logo?: string;
  stock: number;
  isActive: boolean;
  expiryDate?: Date;
  originalPrice?: number;
  discountPrice?: number;
}

export interface RedemptionRecord {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  cost: number;
  voucherCode: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  expiryDate?: Date;
}

export interface TestResult {
  testCase: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

export class RewardsTestingService {
  private mockWalletBalance = 75000; // ₹750 in paisa
  private mockRedemptionHistory: RedemptionRecord[] = [];
  private mockStockCounts: Map<string, number> = new Map();

  // Mock reward items for testing
  private mockRewards: RewardItem[] = [
    {
      id: 'amazon_100',
      name: '₹100 Amazon Voucher',
      description: 'Shopping voucher for Amazon.in',
      cost: 10000,
      category: 'vouchers',
      brand: 'Amazon',
      logo: '🛒',
      stock: 50,
      isActive: true
    },
    {
      id: 'flipkart_500',
      name: '₹500 Flipkart Voucher',
      description: 'Shopping voucher for Flipkart',
      cost: 50000,
      category: 'vouchers',
      brand: 'Flipkart',
      logo: '🛍️',
      stock: 25,
      isActive: true
    },
    {
      id: 'expired_voucher',
      name: '₹200 Expired Voucher',
      description: 'This voucher has expired',
      cost: 20000,
      category: 'vouchers',
      brand: 'ExpiredBrand',
      logo: '⏰',
      stock: 10,
      isActive: false,
      expiryDate: new Date('2024-01-01')
    },
    {
      id: 'out_of_stock',
      name: '₹300 Out of Stock',
      description: 'Popular item currently unavailable',
      cost: 30000,
      category: 'vouchers',
      brand: 'PopularBrand',
      logo: '🚫',
      stock: 0,
      isActive: true
    },
    {
      id: 'bill_payment_1000',
      name: '₹1000 Bill Payment',
      description: 'Pay any utility bill',
      cost: 100000,
      category: 'bills',
      brand: 'Utility',
      logo: '⚡',
      stock: 999,
      isActive: true
    },
    {
      id: 'restaurant_coupon',
      name: 'Local Restaurant Coupon',
      description: '20% off at participating restaurants',
      cost: 5000,
      category: 'special',
      brand: 'LocalEats',
      logo: '🍽️',
      stock: 15,
      isActive: true
    }
  ];

  constructor() {
    // Initialize stock counts
    this.mockRewards.forEach(item => {
      this.mockStockCounts.set(item.id, item.stock);
    });
  }

  // Test Cases Implementation

  async testCatalogViewing(): Promise<TestResult> {
    try {
      const catalog = await this.getCatalog();
      
      const hasVouchers = catalog.some(item => item.category === 'vouchers');
      const hasPrices = catalog.every(item => item.cost > 0);
      const hasActiveItems = catalog.some(item => item.isActive);
      
      if (hasVouchers && hasPrices && hasActiveItems) {
        return {
          testCase: 'TC036',
          status: 'PASS',
          message: 'Catalog displays correctly with vouchers, prices, and active items',
          details: { itemCount: catalog.length, categories: [...new Set(catalog.map(i => i.category))] }
        };
      } else {
        return {
          testCase: 'TC036',
          status: 'FAIL',
          message: 'Catalog missing required elements',
          details: { hasVouchers, hasPrices, hasActiveItems }
        };
      }
    } catch (error) {
      return {
        testCase: 'TC036',
        status: 'FAIL',
        message: 'Error loading catalog',
        details: error
      };
    }
  }

  async testSuccessfulRedemption(): Promise<TestResult> {
    try {
      // Set high balance for successful redemption
      this.setWalletBalance(75000);
      const item = this.mockRewards.find(r => r.id === 'flipkart_500');
      
      if (!item) {
        return {
          testCase: 'TC037',
          status: 'FAIL',
          message: 'Test item not found'
        };
      }

      const result = await this.redeemItem(item.id, 'test_user');
      
      if (result.success && result.voucherCode) {
        return {
          testCase: 'TC037',
          status: 'PASS',
          message: 'Redemption successful with voucher code generated',
          details: { 
            voucherCode: result.voucherCode,
            newBalance: result.newBalance,
            itemCost: item.cost 
          }
        };
      } else {
        return {
          testCase: 'TC037',
          status: 'FAIL',
          message: 'Redemption failed or voucher not generated',
          details: result
        };
      }
    } catch (error) {
      return {
        testCase: 'TC037',
        status: 'FAIL',
        message: 'Redemption error',
        details: error
      };
    }
  }

  async testVoucherGeneration(): Promise<TestResult> {
    try {
      const item = this.mockRewards.find(r => r.id === 'amazon_100');
      if (!item) {
        return {
          testCase: 'TC038',
          status: 'FAIL',
          message: 'Test item not found'
        };
      }

      const result = await this.redeemItem(item.id, 'test_user');
      
      if (result.success && result.voucherCode) {
        const isUniqueCode = result.voucherCode.length >= 8;
        const hasCorrectFormat = /^[A-Z0-9]{8,12}$/.test(result.voucherCode);
        
        if (isUniqueCode && hasCorrectFormat) {
          return {
            testCase: 'TC038',
            status: 'PASS',
            message: 'Unique voucher code generated successfully',
            details: { 
              voucherCode: result.voucherCode,
              format: 'Valid alphanumeric code',
              length: result.voucherCode.length 
            }
          };
        } else {
          return {
            testCase: 'TC038',
            status: 'FAIL',
            message: 'Voucher code format invalid',
            details: { voucherCode: result.voucherCode, isUniqueCode, hasCorrectFormat }
          };
        }
      } else {
        return {
          testCase: 'TC038',
          status: 'FAIL',
          message: 'No voucher code generated',
          details: result
        };
      }
    } catch (error) {
      return {
        testCase: 'TC038',
        status: 'FAIL',
        message: 'Voucher generation error',
        details: error
      };
    }
  }

  async testRedemptionHistory(): Promise<TestResult> {
    try {
      // Add some mock redemptions first
      const item1 = this.mockRewards.find(r => r.id === 'amazon_100');
      const item2 = this.mockRewards.find(r => r.id === 'restaurant_coupon');
      
      if (item1 && item2) {
        await this.redeemItem(item1.id, 'test_user');
        await this.redeemItem(item2.id, 'test_user');
      }

      const history = await this.getRedemptionHistory('test_user');
      
      const hasMultipleEntries = history.length >= 2;
      const hasRequiredFields = history.every(record => 
        record.voucherCode && record.timestamp && record.itemName && record.cost
      );
      const isSortedByDate = history.every((record, index) => 
        index === 0 || record.timestamp <= history[index - 1].timestamp
      );
      
      if (hasMultipleEntries && hasRequiredFields && isSortedByDate) {
        return {
          testCase: 'TC039',
          status: 'PASS',
          message: 'Redemption history displayed correctly',
          details: { 
            historyCount: history.length,
            latestRedemption: history[0]?.itemName,
            totalValue: history.reduce((sum, r) => sum + r.cost, 0)
          }
        };
      } else {
        return {
          testCase: 'TC039',
          status: 'FAIL',
          message: 'Redemption history incomplete or incorrect',
          details: { hasMultipleEntries, hasRequiredFields, isSortedByDate }
        };
      }
    } catch (error) {
      return {
        testCase: 'TC039',
        status: 'FAIL',
        message: 'Error retrieving redemption history',
        details: error
      };
    }
  }

  async testInsufficientBalance(): Promise<TestResult> {
    try {
      // Set low balance
      this.setWalletBalance(10000); // ₹100
      const expensiveItem = this.mockRewards.find(r => r.id === 'flipkart_500');
      
      if (!expensiveItem) {
        return {
          testCase: 'TC040',
          status: 'FAIL',
          message: 'Test item not found'
        };
      }

      const result = await this.redeemItem(expensiveItem.id, 'test_user');
      
      if (!result.success && result.error?.includes('Insufficient balance')) {
        return {
          testCase: 'TC040',
          status: 'PASS',
          message: 'Insufficient balance correctly blocked redemption',
          details: { 
            walletBalance: 10000,
            itemCost: expensiveItem.cost,
            shortfall: expensiveItem.cost - 10000,
            errorMessage: result.error 
          }
        };
      } else {
        return {
          testCase: 'TC040',
          status: 'FAIL',
          message: 'Should have blocked redemption due to insufficient balance',
          details: result
        };
      }
    } catch (error) {
      return {
        testCase: 'TC040',
        status: 'FAIL',
        message: 'Error in insufficient balance test',
        details: error
      };
    }
  }

  async testExpiredVoucher(): Promise<TestResult> {
    try {
      this.setWalletBalance(50000); // Sufficient balance
      const expiredItem = this.mockRewards.find(r => r.id === 'expired_voucher');
      
      if (!expiredItem) {
        return {
          testCase: 'TC041',
          status: 'FAIL',
          message: 'Expired test item not found'
        };
      }

      const result = await this.redeemItem(expiredItem.id, 'test_user');
      
      if (!result.success && result.error?.includes('expired')) {
        return {
          testCase: 'TC041',
          status: 'PASS',
          message: 'Expired voucher correctly blocked',
          details: { 
            itemName: expiredItem.name,
            expiryDate: expiredItem.expiryDate,
            errorMessage: result.error 
          }
        };
      } else {
        return {
          testCase: 'TC041',
          status: 'FAIL',
          message: 'Should have blocked expired voucher redemption',
          details: result
        };
      }
    } catch (error) {
      return {
        testCase: 'TC041',
        status: 'FAIL',
        message: 'Error in expired voucher test',
        details: error
      };
    }
  }

  async testOutOfStock(): Promise<TestResult> {
    try {
      this.setWalletBalance(50000); // Sufficient balance
      const outOfStockItem = this.mockRewards.find(r => r.id === 'out_of_stock');
      
      if (!outOfStockItem) {
        return {
          testCase: 'TC042',
          status: 'FAIL',
          message: 'Out of stock test item not found'
        };
      }

      const result = await this.redeemItem(outOfStockItem.id, 'test_user');
      
      if (!result.success && result.error?.includes('out of stock')) {
        return {
          testCase: 'TC042',
          status: 'PASS',
          message: 'Out of stock item correctly blocked',
          details: { 
            itemName: outOfStockItem.name,
            stock: outOfStockItem.stock,
            errorMessage: result.error 
          }
        };
      } else {
        return {
          testCase: 'TC042',
          status: 'FAIL',
          message: 'Should have blocked out of stock redemption',
          details: result
        };
      }
    } catch (error) {
      return {
        testCase: 'TC042',
        status: 'FAIL',
        message: 'Error in out of stock test',
        details: error
      };
    }
  }

  async testMinimumBalance(): Promise<TestResult> {
    try {
      // Set exact minimum balance for cheapest item
      const cheapestItem = this.mockRewards.find(r => r.id === 'restaurant_coupon');
      if (!cheapestItem) {
        return {
          testCase: 'TC043',
          status: 'FAIL',
          message: 'Minimum balance test item not found'
        };
      }

      this.setWalletBalance(cheapestItem.cost); // Exactly enough
      const result = await this.redeemItem(cheapestItem.id, 'test_user');
      
      if (result.success && result.newBalance === 0) {
        return {
          testCase: 'TC043',
          status: 'PASS',
          message: 'Minimum balance redemption successful, balance now zero',
          details: { 
            itemCost: cheapestItem.cost,
            initialBalance: cheapestItem.cost,
            finalBalance: result.newBalance,
            voucherCode: result.voucherCode 
          }
        };
      } else {
        return {
          testCase: 'TC043',
          status: 'FAIL',
          message: 'Minimum balance redemption failed or balance incorrect',
          details: result
        };
      }
    } catch (error) {
      return {
        testCase: 'TC043',
        status: 'FAIL',
        message: 'Error in minimum balance test',
        details: error
      };
    }
  }

  async testStockConflicts(): Promise<TestResult> {
    try {
      // Set up item with stock of 1
      const limitedItem = { ...this.mockRewards.find(r => r.id === 'restaurant_coupon')! };
      limitedItem.stock = 1;
      this.mockStockCounts.set(limitedItem.id, 1);
      this.setWalletBalance(50000); // Sufficient for both users

      // Simulate concurrent redemptions
      const user1Promise = this.redeemItem(limitedItem.id, 'user_1');
      const user2Promise = this.redeemItem(limitedItem.id, 'user_2');

      const [result1, result2] = await Promise.all([user1Promise, user2Promise]);
      
      // Exactly one should succeed
      const successCount = [result1, result2].filter(r => r.success).length;
      const failureCount = [result1, result2].filter(r => !r.success).length;
      
      if (successCount === 1 && failureCount === 1) {
        return {
          testCase: 'TC044',
          status: 'PASS',
          message: 'Stock conflict handled correctly - only one user succeeded',
          details: { 
            result1: { success: result1.success, error: result1.error },
            result2: { success: result2.success, error: result2.error },
            finalStock: this.mockStockCounts.get(limitedItem.id)
          }
        };
      } else {
        return {
          testCase: 'TC044',
          status: 'FAIL',
          message: 'Stock conflict not handled properly',
          details: { 
            successCount, 
            failureCount,
            result1,
            result2 
          }
        };
      }
    } catch (error) {
      return {
        testCase: 'TC044',
        status: 'FAIL',
        message: 'Error in stock conflict test',
        details: error
      };
    }
  }

  // Helper methods

  async getCatalog(): Promise<RewardItem[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.mockRewards.filter(item => item.isActive);
  }

  async redeemItem(itemId: string, userId: string): Promise<{
    success: boolean;
    voucherCode?: string;
    newBalance?: number;
    error?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const item = this.mockRewards.find(r => r.id === itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    if (!item.isActive || (item.expiryDate && item.expiryDate < new Date())) {
      return { success: false, error: 'This voucher has expired' };
    }

    const currentStock = this.mockStockCounts.get(itemId) || 0;
    if (currentStock <= 0) {
      return { success: false, error: 'This item is out of stock' };
    }

    if (this.mockWalletBalance < item.cost) {
      return { 
        success: false, 
        error: `Insufficient balance. Need ₹${((item.cost - this.mockWalletBalance) / 100).toFixed(2)} more.` 
      };
    }

    // Simulate stock reduction (race condition check)
    this.mockStockCounts.set(itemId, currentStock - 1);
    
    // Deduct from wallet
    this.mockWalletBalance -= item.cost;

    // Generate voucher code
    const voucherCode = this.generateVoucherCode();

    // Record redemption
    const redemption: RedemptionRecord = {
      id: `redeem_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      itemId,
      itemName: item.name,
      cost: item.cost,
      voucherCode,
      timestamp: new Date(),
      status: 'completed',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };

    this.mockRedemptionHistory.unshift(redemption);

    return {
      success: true,
      voucherCode,
      newBalance: this.mockWalletBalance
    };
  }

  async getRedemptionHistory(userId: string): Promise<RedemptionRecord[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.mockRedemptionHistory
      .filter(record => record.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  setWalletBalance(balance: number): void {
    this.mockWalletBalance = balance;
  }

  getWalletBalance(): number {
    return this.mockWalletBalance;
  }

  resetTestData(): void {
    this.mockWalletBalance = 75000;
    this.mockRedemptionHistory = [];
    this.mockRewards.forEach(item => {
      this.mockStockCounts.set(item.id, item.stock);
    });
  }

  async runAllTests(): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    // Reset test data before running all tests
    this.resetTestData();
    
    results.push(await this.testCatalogViewing());
    results.push(await this.testSuccessfulRedemption());
    results.push(await this.testVoucherGeneration());
    results.push(await this.testRedemptionHistory());
    results.push(await this.testInsufficientBalance());
    results.push(await this.testExpiredVoucher());
    results.push(await this.testOutOfStock());
    results.push(await this.testMinimumBalance());
    results.push(await this.testStockConflicts());
    
    return results;
  }
}

export const rewardsTestingService = new RewardsTestingService();