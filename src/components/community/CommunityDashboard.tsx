import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Share2, QrCode, UserPlus, Activity, Trophy, Users as UsersIcon } from "lucide-react";
import { CommunityActivityFeed } from "./CommunityActivityFeed";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface CommunityDashboardProps {
  communityId: string;
}

export const CommunityDashboard = ({ communityId }: CommunityDashboardProps) => {
  const [showInvite, setShowInvite] = useState(false);
  const { toast } = useToast();

  const { data: community } = useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: members } = useQuery({
    queryKey: ["community-members", communityId],
    queryFn: async () => {
      const { data: membersData, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", communityId)
        .order("contribution_score", { ascending: false });
      if (error) throw error;

      if (!membersData) return [];
      const userIds = membersData.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      return membersData.map(member => ({
        ...member,
        profile: profileMap.get(member.user_id)
      }));
    },
  });

  const { data: challenges } = useQuery({
    queryKey: ["community-challenges", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("community_id", communityId)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  const inviteLink = community ? `${window.location.origin}/community/join?code=${community.invite_code}` : "";

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({ title: "Link Copied!", description: "Invite link copied to clipboard" });
  };

  const shareInvite = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Join ${community?.name}`,
        text: `Join our walking community on YogicMile!`,
        url: inviteLink,
      });
    } else {
      copyInviteLink();
    }
  };

  if (!community) return null;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{community.member_count}</div>
              <div className="text-sm text-muted-foreground">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning">{community.total_challenges_completed}</div>
              <div className="text-sm text-muted-foreground">Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success">{community.total_distance_km.toFixed(0)}km</div>
              <div className="text-sm text-muted-foreground">Total Distance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-destructive">{community.streak_record_days}</div>
              <div className="text-sm text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Members
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={shareInvite} variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
          <Button onClick={() => setShowInvite(true)} variant="outline" className="flex-1">
            <QrCode className="w-4 h-4 mr-2" />
            QR Code
          </Button>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="challenges">
            <Trophy className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
          <TabsTrigger value="members">
            <UsersIcon className="w-4 h-4 mr-2" />
            Members
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <CommunityActivityFeed communityId={communityId} />
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          <div className="grid gap-4">
            {challenges?.map((challenge) => (
              <Card key={challenge.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{challenge.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge>{challenge.difficulty_level}</Badge>
                        <Badge variant="outline">{challenge.goal_type}</Badge>
                      </div>
                    </div>
                    <Button size="sm">Join</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!challenges?.length && (
              <div className="text-center py-12 text-muted-foreground">
                No active challenges yet
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="space-y-3">
            {members?.map((member, index) => (
              <Card key={member.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        {member.profile?.display_name || "Walker"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {member.total_steps_contributed.toLocaleString()} steps • {member.role}
                      </div>
                    </div>
                    <Badge variant="secondary">{member.contribution_score}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan to Join {community.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <QRCodeSVG value={inviteLink} size={200} level="H" />
            <div className="text-center">
              <div className="font-mono text-sm bg-muted px-3 py-2 rounded">{community.invite_code}</div>
              <p className="text-xs text-muted-foreground mt-2">Share this code or QR</p>
            </div>
            <Button onClick={copyInviteLink} variant="outline" className="w-full">
              Copy Invite Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
