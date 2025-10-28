import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, Palette, Users, Lock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface CommunityCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community?: any;
}

export const CommunityCreator = ({ open, onOpenChange, community }: CommunityCreatorProps) => {
  const [name, setName] = useState(community?.name || "");
  const [description, setDescription] = useState(community?.description || "");
  const [privacy, setPrivacy] = useState<"public" | "private" | "invite_only">(community?.privacy_setting || "public");
  const [primaryColor, setPrimaryColor] = useState(community?.theme_settings?.primaryColor || "#6366F1");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const inviteCode = community?.invite_code || generateInviteCode();

      if (community) {
        const { error } = await supabase
          .from("communities")
          .update({
            name,
            description,
            privacy_setting: privacy,
            theme_settings: {
              primaryColor,
              secondaryColor: "#8B5CF6",
              layout: "grid"
            }
          })
          .eq("id", community.id);
        if (error) throw error;
      } else {
        const { data: newCommunity, error } = await supabase
          .from("communities")
          .insert({
            name,
            description,
            privacy_setting: privacy,
            theme_settings: {
              primaryColor,
              secondaryColor: "#8B5CF6",
              layout: "grid"
            },
            invite_code: inviteCode,
            creator_id: user.id
          })
          .select()
          .single();
        if (error) throw error;

        // Auto-join creator as admin
        await supabase.from("community_members").insert({
          community_id: newCommunity.id,
          user_id: user.id,
          role: "admin"
        });
      }

      toast({
        title: community ? "Community Updated" : "Community Created!",
        description: `${name} has been ${community ? "updated" : "created"} successfully.`,
      });

      queryClient.invalidateQueries({ queryKey: ["communities"] });
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {community ? "Edit Community" : "Create New Community"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Community Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Walking Warriors"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A community for daily walkers to motivate each other..."
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy Setting *</Label>
            <Select value={privacy} onValueChange={(value: any) => setPrivacy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Public - Anyone can join
                  </div>
                </SelectItem>
                <SelectItem value="invite_only">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Invite Only - Need invite code
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private - Hidden from public
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Theme Color</Label>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <Input
                id="color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-10"
              />
              <span className="text-sm text-muted-foreground">{primaryColor}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name} className="flex-1">
              {loading ? "Saving..." : community ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
