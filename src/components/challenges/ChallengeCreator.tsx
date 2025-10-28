import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Camera, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ChallengeCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityId?: string;
}

export const ChallengeCreator = ({ open, onOpenChange, communityId }: ChallengeCreatorProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState("steps");
  const [targetValue, setTargetValue] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "extreme">("medium");
  const [rewardType, setRewardType] = useState<"coins" | "badges" | "collectibles" | "combo">("coins");
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [requiresGPS, setRequiresGPS] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7); // Default 7 days

      const { error } = await supabase
        .from("challenges")
        .insert({
          title,
          description,
          goal_type: goalType,
          target_value: parseInt(targetValue),
          difficulty_level: difficulty,
          reward_type: rewardType,
          requires_photo_proof: requiresPhoto,
          requires_gps_tracking: requiresGPS,
          community_id: communityId || null,
          creator_id: user.id,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          status: "active"
        });

      if (error) throw error;

      toast({
        title: "Challenge Created!",
        description: `${title} has been created successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      onOpenChange(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setTargetValue("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const difficultyColors = {
    easy: "text-success",
    medium: "text-warning",
    hard: "text-destructive",
    extreme: "text-purple-500"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Create New Challenge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Challenge Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Walk 10,000 Steps Daily"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Complete this challenge to earn rewards..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goalType">Goal Type *</Label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="steps">Steps</SelectItem>
                  <SelectItem value="distance">Distance (km)</SelectItem>
                  <SelectItem value="duration">Duration (min)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target Value *</Label>
              <Input
                id="target"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="10000"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty *</Label>
            <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">
                  <span className={difficultyColors.easy}>⭐ Easy</span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className={difficultyColors.medium}>⭐⭐ Medium</span>
                </SelectItem>
                <SelectItem value="hard">
                  <span className={difficultyColors.hard}>⭐⭐⭐ Hard</span>
                </SelectItem>
                <SelectItem value="extreme">
                  <span className={difficultyColors.extreme}>⭐⭐⭐⭐ Extreme</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward">Reward Type *</Label>
            <Select value={rewardType} onValueChange={(value: any) => setRewardType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coins">🪙 Coins</SelectItem>
                <SelectItem value="badges">🏆 Badges</SelectItem>
                <SelectItem value="collectibles">💎 Collectibles</SelectItem>
                <SelectItem value="combo">🎁 Combo (All)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <Label htmlFor="photo">Require Photo Proof</Label>
              </div>
              <Switch
                id="photo"
                checked={requiresPhoto}
                onCheckedChange={setRequiresPhoto}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-success" />
                <Label htmlFor="gps">Require GPS Tracking</Label>
              </div>
              <Switch
                id="gps"
                checked={requiresGPS}
                onCheckedChange={setRequiresGPS}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title || !targetValue} className="flex-1">
              {loading ? "Creating..." : "Create Challenge"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
