import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Trophy, HelpCircle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export const MiniChallengeCarousel = () => {
  const { data: miniChallenges, refetch } = useQuery({
    queryKey: ["mini-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mini_challenges")
        .select("*")
        .gt("active_until", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const handleAccept = async (challengeId: string) => {
    // Logic to accept mini challenge
    console.log("Accepting mini challenge:", challengeId);
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "mystery":
        return <HelpCircle className="w-5 h-5" />;
      case "remix":
        return <Zap className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  if (!miniChallenges?.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" />
          Quick Challenges
        </h3>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {miniChallenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="snap-start flex-shrink-0 w-72"
          >
            <Card className="border-2 border-warning/20 hover:border-warning/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning">
                    {challenge.is_mystery ? (
                      <HelpCircle className="w-5 h-5" />
                    ) : (
                      getChallengeIcon(challenge.type)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground truncate">
                      {challenge.is_mystery ? "Mystery Challenge" : challenge.name}
                    </h4>
                    {!challenge.is_mystery && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {challenge.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="secondary">
                      {challenge.target_steps.toLocaleString()} steps
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {challenge.time_limit_minutes}min
                    </div>
                  </div>

                  {challenge.active_until && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Expires {formatDistanceToNow(new Date(challenge.active_until), { addSuffix: true })}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-warning">
                      🪙 {challenge.reward_coins} coins
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => handleAccept(challenge.id)}
                      className="h-8"
                    >
                      {challenge.is_mystery ? "Reveal & Accept" : "Accept"}
                    </Button>
                  </div>
                </div>

                {challenge.is_mystery && (
                  <div className="mt-3 text-xs text-center text-muted-foreground italic">
                    Complete to reveal the mystery! 🎁
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
