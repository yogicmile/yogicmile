import { supabase } from '@/integrations/supabase/client';
import { PhotoUploadService } from '@/services/PhotoUploadService';

/**
 * Test Storage Setup
 * Utility functions to verify storage buckets are configured correctly
 */

export class StorageTest {
  /**
   * Check if all required buckets exist
   */
  static async checkBuckets() {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Failed to list buckets:', error);
        return { success: false, error };
      }
      
      const requiredBuckets = [
        'challenge-photos',
        'community-photos',
        'profile-photos',
        'route-photos',
      ];
      
      const existingBuckets = buckets?.map(b => b.id) || [];
      const missingBuckets = requiredBuckets.filter(
        bucket => !existingBuckets.includes(bucket)
      );
      
      if (missingBuckets.length > 0) {
        console.warn('Missing buckets:', missingBuckets);
        return {
          success: false,
          message: `Missing buckets: ${missingBuckets.join(', ')}`,
          buckets: existingBuckets,
        };
      }
      
      console.log('✅ All storage buckets configured correctly');
      return {
        success: true,
        buckets: existingBuckets,
      };
    } catch (error) {
      console.error('Bucket check failed:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Test file upload to a bucket
   */
  static async testUpload(bucketName: string) {
    try {
      // Create a test blob
      const testBlob = new Blob(['test image content'], { type: 'image/png' });
      const testFile = new File([testBlob], 'test.png', { type: 'image/png' });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const fileName = `${user.user.id}/test-${Date.now()}.png`;
      
      // Upload test file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, testFile);
      
      if (error) {
        console.error(`Upload test failed for ${bucketName}:`, error);
        return { success: false, error };
      }
      
      // Clean up test file
      await supabase.storage.from(bucketName).remove([fileName]);
      
      console.log(`✅ Upload test passed for ${bucketName}`);
      return { success: true, path: data.path };
    } catch (error) {
      console.error('Upload test error:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Test all buckets
   */
  static async testAllBuckets() {
    const buckets = [
      'challenge-photos',
      'community-photos',
      'profile-photos',
      'route-photos',
    ];
    
    console.log('🧪 Testing storage buckets...');
    
    const results = await Promise.all(
      buckets.map(async (bucket) => {
        const result = await this.testUpload(bucket);
        return { bucket, ...result };
      })
    );
    
    const failed = results.filter(r => !r.success);
    
    if (failed.length > 0) {
      console.error('❌ Some bucket tests failed:', failed);
      return { success: false, results };
    }
    
    console.log('✅ All bucket tests passed!');
    return { success: true, results };
  }
  
  /**
   * Get storage usage statistics
   */
  static async getStorageStats() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const buckets = [
        'challenge-photos',
        'community-photos',
        'profile-photos',
        'route-photos',
      ];
      
      const stats = await Promise.all(
        buckets.map(async (bucket) => {
          const { data: files } = await supabase.storage
            .from(bucket)
            .list(user.user!.id);
          
          const totalSize = files?.reduce((sum, file) => {
            return sum + (file.metadata?.size || 0);
          }, 0) || 0;
          
          return {
            bucket,
            fileCount: files?.length || 0,
            totalSize,
            totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
          };
        })
      );
      
      return { success: true, stats };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Run all storage checks
   */
  static async runAllChecks() {
    console.log('🔍 Running storage diagnostics...\n');
    
    // Check buckets exist
    const bucketCheck = await this.checkBuckets();
    if (!bucketCheck.success) {
      console.error('❌ Bucket check failed');
      return bucketCheck;
    }
    
    // Test uploads
    const uploadTest = await this.testAllBuckets();
    if (!uploadTest.success) {
      console.error('❌ Upload tests failed');
      return uploadTest;
    }
    
    // Get stats
    const stats = await this.getStorageStats();
    if (stats.success) {
      console.log('\n📊 Storage Statistics:');
      stats.stats?.forEach((stat: any) => {
        console.log(`  ${stat.bucket}: ${stat.fileCount} files (${stat.totalSizeMB} MB)`);
      });
    }
    
    console.log('\n✅ All storage checks passed!');
    return { success: true };
  }
}

/**
 * Quick storage check for development
 */
export async function checkStorage() {
  return await StorageTest.runAllChecks();
}
