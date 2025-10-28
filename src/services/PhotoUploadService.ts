import { supabase } from '@/integrations/supabase/client';

export class PhotoUploadService {
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private static readonly BUCKETS = {
    challenges: 'challenge-photos',
    communities: 'community-photos',
    profiles: 'profile-photos',
    routes: 'route-photos',
  };

  /**
   * Validate image file
   */
  static validateImage(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    return { valid: true };
  }

  /**
   * Generate unique file name
   */
  static generateFileName(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    return `${userId}/${timestamp}-${randomStr}.${extension}`;
  }

  /**
   * Upload image to Supabase Storage
   */
  static async uploadImage(
    file: File,
    bucket: keyof typeof PhotoUploadService.BUCKETS,
    metadata?: Record<string, any>
  ) {
    try {
      // Validate file
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Generate file path
      const fileName = this.generateFileName(user.user.id, file.name);
      const bucketName = this.BUCKETS[bucket];

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);

      return {
        success: true,
        url: urlData.publicUrl,
        path: uploadData.path,
      };
    } catch (error) {
      console.error('Failed to upload image:', error);
      return { success: false, error };
    }
  }

  /**
   * Upload challenge photo
   */
  static async uploadChallengePhoto(
    file: File,
    challengeId: string,
    caption?: string
  ) {
    return this.uploadImage(file, 'challenges', {
      challenge_id: challengeId,
      caption,
      upload_type: 'challenge_completion',
    });
  }

  /**
   * Upload community photo
   */
  static async uploadCommunityPhoto(
    file: File,
    communityId: string,
    postId?: string
  ) {
    return this.uploadImage(file, 'communities', {
      community_id: communityId,
      post_id: postId,
      upload_type: 'community_post',
    });
  }

  /**
   * Upload profile photo
   */
  static async uploadProfilePhoto(file: File) {
    const result = await this.uploadImage(file, 'profiles', {
      upload_type: 'profile_avatar',
    });

    // Note: user_profiles table structure needs to be verified
    // Skipping profile update for now to avoid schema errors

    return result;
  }

  /**
   * Upload route photo
   */
  static async uploadRoutePhoto(
    file: File,
    routeId: string,
    coordinates?: { lat: number; lng: number }
  ) {
    return this.uploadImage(file, 'routes', {
      route_id: routeId,
      coordinates,
      upload_type: 'route_photo',
    });
  }

  /**
   * Delete image
   */
  static async deleteImage(bucket: keyof typeof PhotoUploadService.BUCKETS, path: string) {
    try {
      const bucketName = this.BUCKETS[bucket];

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to delete image:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's uploaded photos (from challenge photos)
   */
  static async getUserPhotos(userId: string, bucket?: keyof typeof PhotoUploadService.BUCKETS) {
    try {
      // Get photos from challenge completion photos table
      const { data: photos, error } = await supabase
        .from('challenge_completion_photos')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      return { success: true, photos };
    } catch (error) {
      console.error('Failed to get user photos:', error);
      return { success: false, error };
    }
  }

  /**
   * Compress image before upload (client-side)
   */
  static async compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            file.type,
            quality
          );
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  }
}
