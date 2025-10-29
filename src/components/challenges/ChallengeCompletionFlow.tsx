import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PhotoUploadService } from '@/services/PhotoUploadService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChallengeCompletionFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  challengeTitle: string;
  onComplete?: () => void;
}

export const ChallengeCompletionFlow = ({
  open,
  onOpenChange,
  challengeId,
  challengeTitle,
  onComplete
}: ChallengeCompletionFlowProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<'upload' | 'caption' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = PhotoUploadService.validateImage(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setStep('caption');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    try {
      // Compress and upload photo
      const compressed = await PhotoUploadService.compressImage(selectedFile, 1920, 0.85);
      const result = await PhotoUploadService.uploadChallengePhoto(compressed, challengeId, caption);

      if (!result.success || !result.url) {
        throw new Error(result.error as string);
      }

      // Save challenge completion to database
      const { error: completionError } = await supabase
        .from('challenge_completion_photos')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          photo_url: result.url,
          caption: caption || null
        });

      if (completionError) throw completionError;

      setStep('success');
      setTimeout(() => {
        onOpenChange(false);
        onComplete?.();
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not complete challenge",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewUrl('');
    setCaption('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Challenge</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload a photo showing your completion of "{challengeTitle}"
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Camera className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">Click to upload photo</p>
              <p className="text-xs text-muted-foreground">JPEG, PNG or WebP (max 5MB)</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {step === 'caption' && (
          <div className="space-y-4">
            {previewUrl && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Challenge completion"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => {
                    setStep('upload');
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Textarea
                id="caption"
                placeholder="Share your experience completing this challenge..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={200}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {caption.length}/200
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
                className="flex-1"
              >
                Change Photo
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-xl font-bold mb-2">Challenge Completed! 🎉</h3>
            <p className="text-muted-foreground">
              Your photo has been uploaded successfully
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
