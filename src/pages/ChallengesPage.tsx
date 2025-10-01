import { useEffect } from "react";
import { SeasonalChallenges } from "@/components/challenges/SeasonalChallenges";
import { Trophy, Target, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ChallengesPage = () => {
  useEffect(() => {
    document.title = "Challenges | Yogic Mile";
    const desc = "Join seasonal walking challenges, compete with friends, and earn exclusive rewards on Yogic Mile.";
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
          <Trophy className="w-8 h-8 text-warning" />
          Seasonal Challenges
        </h1>
        <p className="text-muted-foreground">
          Join time-limited challenges, compete with the community, and win exclusive rewards.
        </p>
      </header>

      {/* Challenge Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Exclusive Rewards</h3>
                <p className="text-sm text-muted-foreground">Earn special badges and coins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-warning/10">
                <Target className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Stay Motivated</h3>
                <p className="text-sm text-muted-foreground">Set and achieve walking goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-success/10">
                <Star className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Community Fun</h3>
                <p className="text-sm text-muted-foreground">Compete with friends</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Challenges */}
      <section>
        <SeasonalChallenges />
      </section>
    </main>
  );
};

export default ChallengesPage;
