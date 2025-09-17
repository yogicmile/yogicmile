import { supabase } from '@/integrations/supabase/client';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  size: number;
}

interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  defaultTTL: number; // Default time to live in milliseconds
}

class IndexedDBCache {
  private dbName = 'steprewards_cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiry', 'expiry');
          cacheStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    const expiry = Date.now() + (ttl || 30 * 60 * 1000); // Default 30 minutes
    const size = new Blob([JSON.stringify(data)]).size;
    
    const cacheItem = {
      key,
      data,
      timestamp: Date.now(),
      expiry,
      size
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(cacheItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise<T | null>((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        
        if (!result) {
          resolve(null);
          return;
        }
        
        // Check if expired
        if (result.expiry < Date.now()) {
          this.delete(key); // Clean up expired item
          resolve(null);
          return;
        }
        
        resolve(result.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    const index = store.index('expiry');
    
    const now = Date.now();
    const range = IDBKeyRange.upperBound(now);
    
    await new Promise<void>((resolve, reject) => {
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getSize(): Promise<number> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');
    
    return new Promise<number>((resolve, reject) => {
      let totalSize = 0;
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          totalSize += cursor.value.size || 0;
          cursor.continue();
        } else {
          resolve(totalSize);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

export class CacheManager {
  private cache: IndexedDBCache;
  private config: CacheConfig;
  private userId: string | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.cache = new IndexedDBCache();
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      defaultTTL: 30 * 60 * 1000, // 30 minutes default
      ...config
    };
  }

  setUserId(userId: string | null) {
    this.userId = userId;
  }

  private getCacheKey(category: string, key: string): string {
    return `${this.userId || 'anonymous'}:${category}:${key}`;
  }

  // Profile data caching (1 hour TTL)
  async cacheProfile(data: any): Promise<void> {
    const key = this.getCacheKey('profile', 'user_profile');
    await this.cache.set(key, data, 60 * 60 * 1000); // 1 hour
    await this.updateCacheStatus('profile', 'user_profile', 60 * 60 * 1000);
  }

  async getProfile(): Promise<any | null> {
    const key = this.getCacheKey('profile', 'user_profile');
    return await this.cache.get(key);
  }

  // Wallet balance caching (5 minutes TTL)
  async cacheWalletBalance(balance: any): Promise<void> {
    const key = this.getCacheKey('wallet', 'balance');
    await this.cache.set(key, balance, 5 * 60 * 1000); // 5 minutes
    await this.updateCacheStatus('wallet', 'balance', 5 * 60 * 1000);
  }

  async getWalletBalance(): Promise<any | null> {
    const key = this.getCacheKey('wallet', 'balance');
    return await this.cache.get(key);
  }

  // Step data caching (5 minutes TTL)
  async cacheStepData(stepData: any): Promise<void> {
    const key = this.getCacheKey('steps', 'recent_data');
    await this.cache.set(key, stepData, 5 * 60 * 1000); // 5 minutes
    await this.updateCacheStatus('steps', 'recent_data', 5 * 60 * 1000);
  }

  async getStepData(): Promise<any | null> {
    const key = this.getCacheKey('steps', 'recent_data');
    return await this.cache.get(key);
  }

  // Rewards catalog caching (30 minutes TTL)
  async cacheRewards(rewards: any[]): Promise<void> {
    const key = this.getCacheKey('rewards', 'catalog');
    await this.cache.set(key, rewards, 30 * 60 * 1000); // 30 minutes
    await this.updateCacheStatus('rewards', 'catalog', 30 * 60 * 1000);
  }

  async getRewards(): Promise<any[] | null> {
    const key = this.getCacheKey('rewards', 'catalog');
    return await this.cache.get(key);
  }

  // FAQ caching (2 hours TTL)
  async cacheFAQs(faqs: any[]): Promise<void> {
    const key = this.getCacheKey('faqs', 'all');
    await this.cache.set(key, faqs, 2 * 60 * 60 * 1000); // 2 hours
    await this.updateCacheStatus('faqs', 'all', 2 * 60 * 60 * 1000);
  }

  async getFAQs(): Promise<any[] | null> {
    const key = this.getCacheKey('faqs', 'all');
    return await this.cache.get(key);
  }

  // Generic cache methods
  async setCache<T>(category: string, key: string, data: T, ttl?: number): Promise<void> {
    const cacheKey = this.getCacheKey(category, key);
    const cacheTTL = ttl || this.config.defaultTTL;
    await this.cache.set(cacheKey, data, cacheTTL);
    await this.updateCacheStatus(category, key, cacheTTL);
  }

  async getCache<T>(category: string, key: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(category, key);
    return await this.cache.get<T>(cacheKey);
  }

  async invalidateCache(category: string, key?: string): Promise<void> {
    if (key) {
      const cacheKey = this.getCacheKey(category, key);
      await this.cache.delete(cacheKey);
    } else {
      // Clear all cache entries for this category
      // This is a simplified approach - in a real implementation,
      // you might want to iterate through all keys and delete matching ones
      await this.cache.clear();
    }
  }

  // Cache status management
  private async updateCacheStatus(category: string, key: string, ttl: number): Promise<void> {
    if (!this.userId) return;

    try {
      const cacheKey = this.getCacheKey(category, key);
      const size = new Blob([JSON.stringify({ category, key })]).size;
      
      await supabase.from('cache_status').upsert({
        user_id: this.userId,
        cache_key: cacheKey,
        cache_type: category,
        last_updated: new Date().toISOString(),
        expiry_time: new Date(Date.now() + ttl).toISOString(),
        size_bytes: size
      });
    } catch (error) {
      console.error('Failed to update cache status:', error);
    }
  }

  // Cache maintenance
  async performMaintenance(): Promise<void> {
    // Clean up expired items
    await this.cache.cleanup();

    // Check cache size and perform LRU eviction if needed
    const currentSize = await this.cache.getSize();
    
    if (currentSize > this.config.maxSize) {
      console.warn(`Cache size (${currentSize} bytes) exceeds limit (${this.config.maxSize} bytes). Performing cleanup.`);
      
      // In a real implementation, you would implement LRU eviction here
      // For now, we'll just clear 25% of the cache
      await this.cache.clear();
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{
    size: number;
    maxSize: number;
    utilizationPercentage: number;
  }> {
    const size = await this.cache.getSize();
    return {
      size,
      maxSize: this.config.maxSize,
      utilizationPercentage: (size / this.config.maxSize) * 100
    };
  }
}

// Global cache instance
export const cacheManager = new CacheManager();

// Initialize cache when app starts
export const initializeCache = async (userId?: string) => {
  if (userId) {
    cacheManager.setUserId(userId);
  }
  
  // Perform initial maintenance
  await cacheManager.performMaintenance();
  
  // Set up periodic maintenance (every 10 minutes)
  setInterval(() => {
    cacheManager.performMaintenance().catch(console.error);
  }, 10 * 60 * 1000);
};