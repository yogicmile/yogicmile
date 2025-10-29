import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, Calendar, Target, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ChallengeCompletionFlow } from './ChallengeCompletionFlow';

interface ChallengeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
}

interface ChallengePhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  uploaded_at: string;
  user_profile?: {
    display_name: string;
    profile_picture_url?: string;
  };
}

export const ChallengeDetailModal = ({
  open,
  onOpenChange,
  challengeId
}: ChallengeDetailModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<any>(null);
  const [photos, setPhotos] = useState<ChallengePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (open && challengeId) {
      loadChallengeDetails();
    }
  }, [open, challengeId]);

  const loadChallengeDetails = async () => {
    setLoading(true);
    try {
      // Fetch challenge details
      const { data: challengeData, error: challengeError } = await supabase
        .from('seasonal_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;
      setChallenge(challengeData);

      // Fetch completion photos
      const { data: photosData, error: photosError } = await supabase
        .from('challenge_completion_photos')
        .select('*')
        .eq('challenge_id', challengeId)
        .order('uploaded_at', { ascending: false })
        .limit(20);

      if (photosError) throw photosError;

      // Fetch user profiles for photos
      if (photosData && photosData.length > 0) {
        const userIds = [...new Set(photosData.map(p => p.user_id))];
        const { data: profilesData } = await supabase
          .from('user_profiles')
          .select('user_id, display_name, profile_picture_url')
          .in('user_id', userIds);

        const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]) || []);
        const photosWithProfiles = photosData.map(photo => ({
          ...photo,
          user_profile: profilesMap.get(photo.user_id)
        }));
        setPhotos(photosWithProfiles as any);
      }
    } catch (error) {
      console.error('Error loading challenge:', error);
      toast({
        title: "Error",
        description: "Could not load challenge details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = () => {
    setShowCompletion(true);
  };

  if (!challenge && !loading) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              {challenge?.title || 'Challenge Details'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            {loading ? (
              <div className="space-y-4 p-4">
                <div className="h-40 bg-primary/10 rounded-lg animate-pulse" />
                <div className="h-20 bg-primary/10 rounded-lg animate-pulse" />
              </div>
            ) : (
              <div className="space-y-6 p-4">
                {/* Challenge Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {challenge.goal_value?.toLocaleString() || 0} steps
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {challenge.participants_count || 0} joined
                    </div>
                  </div>

                  <p className="text-foreground">{challenge.description}</p>

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      🏆 {challenge.reward_coins} coins
                    </Badge>
                    {challenge.reward_badge && (
                      <Badge variant="secondary">
                        🎖️ {challenge.reward_badge}
                      </Badge>
                    )}
                  </div>

                  <Button onClick={handleJoinChallenge} className="w-full">
                    Complete Challenge
                  </Button>
                </div>

                {/* Photo Gallery */}
                {photos.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Completion Photos ({photos.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {photos.map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => setSelectedPhoto(photo.photo_url)}
                        >
                          <img
                            src={photo.photo_url}
                            alt={photo.caption || 'Challenge completion'}
                            className="w-full h-40 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex items-center gap-2 text-white text-sm">
                                <Avatar className="w-6 h-6">
                                  {photo.user_profile?.profile_picture_url && (
                                    <AvatarImage src={photo.user_profile.profile_picture_url} />
                                  )}
                                  <AvatarFallback className="text-xs">
                                    {photo.user_profile?.display_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="truncate">{photo.user_profile?.display_name || 'User'}</span>
                              </div>
                              {photo.caption && (
                                <p className="text-xs text-white/90 mt-1 line-clamp-2">
                                  {photo.caption}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Lightbox for full-size photos */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl p-0">
            <img
              src={selectedPhoto}
              alt="Challenge completion"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Challenge Completion Flow */}
      {challenge && (
        <ChallengeCompletionFlow
          open={showCompletion}
          onOpenChange={setShowCompletion}
          challengeId={challengeId}
          challengeTitle={challenge.title}
          onComplete={loadChallengeDetails}
        />
      )}
    </>
  );
};
