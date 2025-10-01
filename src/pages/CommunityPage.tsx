import { useEffect } from "react";
import { CommunityStats } from "@/components/community/CommunityStats";
import { CommunityLeaderboards } from "@/components/community/CommunityLeaderboards";

export const CommunityPage = () => {
  useEffect(() => {
    // Basic SEO
    document.title = "Community | Yogic Mile";
    const desc = "Discover community stats and leaderboards on Yogic Mile.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Community</h1>
        <p className="text-muted-foreground">See how the community is performing and climb the leaderboards.</p>
      </header>
      <section>
        <CommunityStats />
      </section>
      <section>
        <CommunityLeaderboards />
      </section>
    </main>
  );
};

export default CommunityPage;
