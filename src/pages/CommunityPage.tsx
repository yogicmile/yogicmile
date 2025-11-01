import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CommunityStats } from "@/components/community/CommunityStats";
import { CommunityLeaderboards } from "@/components/community/CommunityLeaderboards";
import { CommunityFriends } from "@/components/community/CommunityFriends";
import { CommunityProfiles } from "@/components/community/CommunityProfiles";
import { CommunityForums } from "@/components/community/CommunityForums";
import { CommunityCreator } from "@/components/community/CommunityCreator";
import { CommunityCard } from "@/components/community/CommunityCard";
import RouteHistoryMap from "@/components/gps/RouteHistoryMap";
import { Users, Trophy, UserPlus, MessageSquare, Plus, Map } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CommunityPage = () => {
  const [showCreator, setShowCreator] = useState(false);

  const { data: communities } = useQuery({
    queryKey: ["communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("privacy_setting", "public")
        .order("member_count", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Community
            </h1>
            <p className="text-muted-foreground">
              Connect with fellow walkers, compete on leaderboards, and share your journey.
            </p>
          </div>
          <Button onClick={() => setShowCreator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </header>

      {/* Featured Communities */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Discover Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities?.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>

      <section>
        <CommunityStats />
      </section>

      <Tabs defaultValue="leaderboards" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Routes</span>
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

        <TabsContent value="routes" className="mt-6">
          <RouteHistoryMap />
        </TabsContent>

        <TabsContent value="forums" className="mt-6">
          <CommunityForums />
        </TabsContent>
      </Tabs>

      <CommunityCreator open={showCreator} onOpenChange={setShowCreator} />
    </main>
  );
};

export default CommunityPage;
