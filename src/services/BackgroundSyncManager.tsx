import { supabase } from '@/integrations/supabase/client';

interface SyncQueueItem {
  id?: string;
  user_id: string;
  action_type: string;
  data_payload: any;
  priority: number;
  retry_count: number;
  max_retries: number;
}

interface NetworkQuality {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export class BackgroundSyncManager {
  private syncQueue: Map<string, SyncQueueItem> = new Map();
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes default
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private userId: string | null = null;

  constructor() {
    this.setupEventListeners();
    this.loadQueueFromDatabase();
    this.startPeriodicSync();
  }

  setUserId(userId: string | null) {
    this.userId = userId;
    if (userId) {
      this.loadQueueFromDatabase();
    }
  }

  private setupEventListeners() {
    // Network status listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network came online, starting sync...');
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network went offline');
    });

    // Page visibility listener for background processing
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isOnline) {
        this.processQueue();
      }
    });
  }

  // Add item to sync queue
  async addToQueue(actionType: string, data: any, priority: number = 5): Promise<void> {
    if (!this.userId) return;

    const queueItem: SyncQueueItem = {
      user_id: this.userId,
      action_type: actionType,
      data_payload: data,
      priority,
      retry_count: 0,
      max_retries: 5
    };

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    this.syncQueue.set(tempId, queueItem);

    // Save to database
    try {
      const { data: savedItem, error } = await supabase
        .from('sync_queue')
        .insert(queueItem)
        .select()
        .single();

      if (error) throw error;

      // Update queue with real ID
      this.syncQueue.delete(tempId);
      this.syncQueue.set(savedItem.id, { ...queueItem, id: savedItem.id });

      // Try to sync immediately if online
      if (this.isOnline) {
        this.processQueue();
      }
    } catch (error) {
      console.error('Failed to save sync item to database:', error);
    }
  }

  // Load queue from database
  private async loadQueueFromDatabase() {
    if (!this.userId) return;

    try {
      const { data, error } = await supabase
        .from('sync_queue')
        .select('*')
        .eq('user_id', this.userId)
        .eq('sync_status', 'pending')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.syncQueue.clear();
      data?.forEach(item => {
        this.syncQueue.set(item.id, item);
      });

      console.log(`Loaded ${data?.length || 0} pending sync items`);
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  // Process the sync queue
  private async processQueue() {
    if (!this.isOnline || this.isSyncing || this.syncQueue.size === 0) {
      return;
    }

    this.isSyncing = true;
    console.log(`Processing ${this.syncQueue.size} sync items`);

    // Sort queue by priority and timestamp
    const sortedItems = Array.from(this.syncQueue.values()).sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority number = higher priority
      }
      return (a.id || '').localeCompare(b.id || '');
    });

    // Process items in batches
    const batchSize = this.getBatchSize();
    
    for (let i = 0; i < sortedItems.length; i += batchSize) {
      const batch = sortedItems.slice(i, i + batchSize);
      await this.processBatch(batch);
      
      // Delay between batches to prevent overwhelming the server
      if (i + batchSize < sortedItems.length) {
        await this.delay(1000); // 1 second delay
      }
    }

    this.isSyncing = false;
  }

  private async processBatch(items: SyncQueueItem[]) {
    const promises = items.map(item => this.processItem(item));
    await Promise.allSettled(promises);
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    try {
      const success = await this.executeSync(item);
      
      if (success) {
        await this.markItemCompleted(item.id!);
        this.syncQueue.delete(item.id!);
      } else {
        await this.handleRetry(item);
      }
    } catch (error) {
      console.error(`Sync failed for item ${item.id}:`, error);
      await this.handleRetry(item);
    }
  }

  private async executeSync(item: SyncQueueItem): Promise<boolean> {
    switch (item.action_type) {
      case 'step_log':
        return await this.syncStepLog(item.data_payload);
      
      case 'wallet_transaction':
        return await this.syncWalletTransaction(item.data_payload);
      
      case 'achievement_unlock':
        return await this.syncAchievement(item.data_payload);
      
      case 'spin_result':
        return await this.syncSpinResult(item.data_payload);
      
      case 'coupon_redemption':
        return await this.syncCouponRedemption(item.data_payload);
      
      default:
        console.warn(`Unknown sync action type: ${item.action_type}`);
        return false;
    }
  }

  // Specific sync methods
  private async syncStepLog(data: any): Promise<boolean> {
    try {
      const { error } = await supabase.from('daily_steps').upsert(data);
      return !error;
    } catch (error) {
      console.error('Failed to sync step log:', error);
      return false;
    }
  }

  private async syncWalletTransaction(data: any): Promise<boolean> {
    try {
      // This would sync wallet balance updates
      // Implementation depends on your wallet schema
      return true;
    } catch (error) {
      console.error('Failed to sync wallet transaction:', error);
      return false;
    }
  }

  private async syncAchievement(data: any): Promise<boolean> {
    try {
      const { error } = await supabase.from('achievements').insert(data);
      return !error;
    } catch (error) {
      console.error('Failed to sync achievement:', error);
      return false;
    }
  }

  private async syncSpinResult(data: any): Promise<boolean> {
    try {
      const { error } = await supabase.from('spin_results').insert(data);
      return !error;
    } catch (error) {
      console.error('Failed to sync spin result:', error);
      return false;
    }
  }

  private async syncCouponRedemption(data: any): Promise<boolean> {
    try {
      const { error } = await supabase.from('coupon_redemptions').insert(data);
      return !error;
    } catch (error) {
      console.error('Failed to sync coupon redemption:', error);
      return false;
    }
  }

  private async handleRetry(item: SyncQueueItem) {
    const newRetryCount = item.retry_count + 1;
    
    if (newRetryCount >= item.max_retries) {
      // Max retries reached, mark as failed
      await this.markItemFailed(item.id!);
      this.syncQueue.delete(item.id!);
      return;
    }

    // Calculate exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, newRetryCount), 30000); // Max 30 seconds
    
    // Update retry count
    item.retry_count = newRetryCount;
    const nextRetryAt = new Date(Date.now() + delay);
    
    try {
      await supabase
        .from('sync_queue')
        .update({
          retry_count: newRetryCount,
          next_retry_at: nextRetryAt.toISOString()
        })
        .eq('id', item.id);

      // Schedule retry
      const timeoutId = setTimeout(() => {
        this.retryTimeouts.delete(item.id!);
        if (this.isOnline) {
          this.processItem(item);
        }
      }, delay);

      this.retryTimeouts.set(item.id!, timeoutId);
      
    } catch (error) {
      console.error('Failed to update retry count:', error);
    }
  }

  private async markItemCompleted(itemId: string) {
    try {
      await supabase
        .from('sync_queue')
        .update({ sync_status: 'completed' })
        .eq('id', itemId);
    } catch (error) {
      console.error('Failed to mark item as completed:', error);
    }
  }

  private async markItemFailed(itemId: string) {
    try {
      await supabase
        .from('sync_queue')
        .update({ sync_status: 'failed' })
        .eq('id', itemId);
    } catch (error) {
      console.error('Failed to mark item as failed:', error);
    }
  }

  private getBatchSize(): number {
    const networkQuality = this.getNetworkQuality();
    
    if (networkQuality.effectiveType === '4g' && networkQuality.downlink > 2) {
      return 10; // High-speed connection
    } else if (networkQuality.effectiveType === '3g' || networkQuality.downlink > 1) {
      return 5; // Medium-speed connection
    } else {
      return 2; // Slow connection
    }
  }

  private getNetworkQuality(): NetworkQuality {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection?.effectiveType || '4g',
        downlink: connection?.downlink || 10,
        rtt: connection?.rtt || 100,
        saveData: connection?.saveData || false
      };
    }
    
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false
    };
  }

  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processQueue();
      }
    }, this.syncInterval);
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for queue management
  async getQueueStatus(): Promise<{
    pending: number;
    failed: number;
    isOnline: boolean;
    isSyncing: boolean;
  }> {
    const pending = Array.from(this.syncQueue.values()).length;
    
    let failed = 0;
    try {
      const { count } = await supabase
        .from('sync_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.userId)
        .eq('sync_status', 'failed');
      
      failed = count || 0;
    } catch (error) {
      console.error('Failed to get failed sync count:', error);
    }

    return {
      pending,
      failed,
      isOnline: this.isOnline,
      isSyncing: this.isSyncing
    };
  }

  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.processQueue();
    }
  }

  async clearFailedItems(): Promise<void> {
    try {
      await supabase
        .from('sync_queue')
        .delete()
        .eq('user_id', this.userId)
        .eq('sync_status', 'failed');
    } catch (error) {
      console.error('Failed to clear failed items:', error);
    }
  }
}

// Global sync manager instance
export const backgroundSyncManager = new BackgroundSyncManager();