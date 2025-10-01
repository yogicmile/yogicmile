import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityStats } from "@/components/community/CommunityStats";
import { CommunityLeaderboards } from "@/components/community/CommunityLeaderboards";
import { CommunityFriends } from "@/components/community/CommunityFriends";
import { CommunityProfiles } from "@/components/community/CommunityProfiles";
import { CommunityForums } from "@/components/community/CommunityForums";
import { Users, Trophy, UserPlus, MessageSquare } from "lucide-react";

export const CommunityPage = () => {
  useEffect(() => {
    document.title = "Community | Yogic Mile";
    const desc = "Connect with walkers, compete on leaderboards, and join the Yogic Mile community.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" />
          Community
        </h1>
        <p className="text-muted-foreground">
          Connect with fellow walkers, compete on leaderboards, and share your journey.
        </p>
      </header>

      <section>
        <CommunityStats />
      </section>

      <Tabs defaultValue="leaderboards" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboards" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboards</span>
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Friends</span>
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Profiles</span>
          </TabsTrigger>
          <TabsTrigger value="forums" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Forums</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboards" className="mt-6">
          <CommunityLeaderboards />
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <CommunityFriends />
        </TabsContent>

        <TabsContent value="profiles" className="mt-6">
          <CommunityProfiles />
        </TabsContent>

        <TabsContent value="forums" className="mt-6">
          <CommunityForums />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default CommunityPage;
