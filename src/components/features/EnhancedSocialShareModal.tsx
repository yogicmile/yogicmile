import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Facebook, Twitter, Share2, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface EnhancedSocialShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: {
    title: string;
    description: string;
    stats?: {
      steps?: number;
      distance?: number;
      calories?: number;
    };
    imageUrl?: string;
  };
}

const platformTemplates = {
  facebook: "🎉 Just achieved {title} on YogicMile! {stats} Join me on this wellness journey! 🚶‍♂️💪 #YogicMile #WellnessJourney",
  instagram: "✨ {title} unlocked! ✨\n\n{stats}\n\nEvery step counts towards a healthier me! 💚\n\n#YogicMile #WalkingChallenge #FitnessGoals #WellnessWarrior #HealthyLifestyle",
  twitter: "🎯 {title} achieved on @YogicMile! {stats} #Walking #Fitness #HealthGoals",
  whatsapp: "Hey! I just achieved *{title}* on YogicMile! 🎉\n\n{stats}\n\nWant to join me on this walking challenge? It's super fun and motivating! 🚶‍♀️",
  snapchat: "Just crushed {title}! {stats} 🔥 #YogicMile"
};

export const EnhancedSocialShareModal = ({ open, onOpenChange, achievement }: EnhancedSocialShareModalProps) => {
  const [selectedPlatform, setSelectedPlatform] = useState<keyof typeof platformTemplates | null>(null);
  const [caption, setCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateCaption = (platform: keyof typeof platformTemplates) => {
    let stats = "";
    if (achievement.stats) {
      const parts = [];
      if (achievement.stats.steps) parts.push(`${achievement.stats.steps.toLocaleString()} steps`);
      if (achievement.stats.distance) parts.push(`${achievement.stats.distance.toFixed(2)} km`);
      if (achievement.stats.calories) parts.push(`${achievement.stats.calories} calories`);
      stats = parts.join(" | ");
    }

    return platformTemplates[platform]
      .replace("{title}", achievement.title)
      .replace("{stats}", stats)
      .replace("{description}", achievement.description);
  };

  const handlePlatformSelect = (platform: keyof typeof platformTemplates) => {
    setSelectedPlatform(platform);
    setCaption(generateCaption(platform));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Caption copied to clipboard"
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: achievement.title,
          text: caption,
          url: window.location.origin
        });
        toast({
          title: "Shared!",
          description: "Achievement shared successfully"
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary" />
            Share Your Achievement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
            <h3 className="text-xl font-bold text-foreground mb-2">{achievement.title}</h3>
            <p className="text-muted-foreground mb-3">{achievement.description}</p>
            {achievement.stats && (
              <div className="flex gap-3 flex-wrap">
                {achievement.stats.steps && (
                  <Badge variant="secondary">👟 {achievement.stats.steps.toLocaleString()} steps</Badge>
                )}
                {achievement.stats.distance && (
                  <Badge variant="secondary">📍 {achievement.stats.distance.toFixed(2)} km</Badge>
                )}
                {achievement.stats.calories && (
                  <Badge variant="secondary">🔥 {achievement.stats.calories} cal</Badge>
                )}
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Choose Platform</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(Object.keys(platformTemplates) as Array<keyof typeof platformTemplates>).map((platform) => (
                <motion.div key={platform} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={selectedPlatform === platform ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handlePlatformSelect(platform)}
                  >
                    {platform === "facebook" && <Facebook className="w-4 h-4 mr-2" />}
                    {platform === "twitter" && <Twitter className="w-4 h-4 mr-2" />}
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Caption Editor */}
          {selectedPlatform && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h4 className="text-sm font-semibold text-foreground">Edit Caption</h4>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {caption.length} characters
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleCopy} variant="outline" className="flex-1" disabled={!caption}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Caption"}
            </Button>
            <Button onClick={handleShare} className="flex-1" disabled={!caption}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
