import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSocialSharing, SocialPlatform, ShareContent } from '@/hooks/use-social-sharing';
import { Copy, Share2, Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ShareContent | null;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  const [customMessage, setCustomMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);
  const [preview, setPreview] = useState('');
  const { shareToplatform, isSharing, getPlatformPreview, platforms } = useSocialSharing();
  const { toast } = useToast();

  // Update preview when platform or message changes
  useEffect(() => {
    if (selectedPlatform && content) {
      const previewText = getPlatformPreview(selectedPlatform, content, customMessage);
      setPreview(previewText);
    }
  }, [selectedPlatform, customMessage, content, getPlatformPreview]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCustomMessage('');
      setSelectedPlatform(null);
      setPreview('');
    } else if (content) {
      setCustomMessage(content.description);
    }
  }, [isOpen, content]);

  const handleShare = async () => {
    if (!selectedPlatform) return;
    
    await shareToplatform(selectedPlatform, customMessage);
  };

  const copyToClipboard = async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(customMessage || content.description);
      toast({
        title: "Copied!",
        description: "Share content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const getContentIcon = (type: ShareContent['type']) => {
    switch (type) {
      case 'achievement': return '🏆';
      case 'milestone': return '🎯';
      case 'streak': return '🔥';
      case 'phase_advancement': return '📈';
      case 'challenge': return '💪';
      default: return '🚀';
    }
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Your Progress
          </DialogTitle>
          <DialogDescription>
            Inspire others with your wellness journey!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Preview */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{getContentIcon(content.type)}</div>
                <div>
                  <h3 className="font-semibold">{content.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {content.type.replace('_', ' ')} achievement
                  </p>
                </div>
              </div>
              
              {/* Achievement Stats */}
              <div className="flex flex-wrap gap-2">
                {content.data.steps && (
                  <Badge variant="outline">
                    👣 {content.data.steps.toLocaleString()} steps
                  </Badge>
                )}
                {content.data.coins && (
                  <Badge variant="outline">
                    💰 ₹{(content.data.coins / 100).toFixed(2)} earned
                  </Badge>
                )}
                {content.data.streak && (
                  <Badge variant="outline">
                    🔥 {content.data.streak} day streak
                  </Badge>
                )}
                {content.data.phase && (
                  <Badge variant="outline">
                    📈 {content.data.phase}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Message</label>
            <Textarea
              placeholder="Add your personal touch..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{customMessage.length} characters</span>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Choose Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.filter(p => p.isSupported).map((platform) => (
                <Card 
                  key={platform.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedPlatform?.id === platform.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedPlatform(platform)}
                >
                  <CardContent className="p-3 text-center">
                    <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center text-white text-sm mb-2 mx-auto`}>
                      {platform.icon}
                    </div>
                    <p className="text-sm font-medium">{platform.name}</p>
                    {platform.maxLength && (
                      <p className="text-xs text-muted-foreground">
                        Max {platform.maxLength} chars
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Preview */}
          {selectedPlatform && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedPlatform.name} Preview
              </label>
              <Card className="border-dashed">
                <CardContent className="p-3">
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {preview}
                  </div>
                  {selectedPlatform.maxLength && preview.length > selectedPlatform.maxLength && (
                    <Badge variant="destructive" className="mt-2">
                      Too long! {preview.length - selectedPlatform.maxLength} characters over limit
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          {/* Share Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShare}
              disabled={!selectedPlatform || isSharing || (selectedPlatform.maxLength && preview.length > selectedPlatform.maxLength)}
              className="flex-1"
            >
              {isSharing ? 'Sharing...' : `Share to ${selectedPlatform?.name || 'Platform'}`}
            </Button>
          </div>

          {/* Engagement Tips */}
          <Card className="border-info/20 bg-info/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-info" />
                <p className="text-sm font-medium">Engagement Tips</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Share during peak hours (7-9 AM, 6-8 PM)</li>
                <li>• Use relevant hashtags for better discovery</li>
                <li>• Add personal context to inspire others</li>
                <li>• Tag friends to spread wellness motivation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};