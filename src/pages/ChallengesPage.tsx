import { useEffect } from "react";
import { SeasonalChallenges } from "@/components/challenges/SeasonalChallenges";

export const ChallengesPage = () => {
  useEffect(() => {
    // Basic SEO
    document.title = "Challenges | Yogic Mile";
    const desc = "Join seasonal walking challenges and earn rewards on Yogic Mile.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);
  }, []);

  return (
    <main className="container mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Seasonal Challenges</h1>
        <p className="text-muted-foreground">Compete, stay motivated, and win rewards.</p>
      </header>
      <section>
        <SeasonalChallenges />
      </section>
    </main>
  );
};

export default ChallengesPage;
