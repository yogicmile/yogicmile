import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Zap, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface ThresholdTest {
  id: string;
  name: string;
  description: string;
  exactRequirement: number;
  currentValue: number;
  testType: "exact" | "minimum" | "range";
  rangeMax?: number;
  unlocked: boolean;
  category: string;
}

const mockThresholds: ThresholdTest[] = [
  {
    id: "steps_exact_10k",
    name: "Perfect 10K",
    description: "Walk exactly 10,000 steps",
    exactRequirement: 10000,
    currentValue: 9995,
    testType: "exact",
    unlocked: false,
    category: "Precision",
  },
  {
    id: "coins_min_100",
    name: "Century Club",
    description: "Earn at least 100 coins",
    exactRequirement: 100,
    currentValue: 99,
    testType: "minimum",
    unlocked: false,
    category: "Minimum",
  },
  {
    id: "streak_exact_30",
    name: "Month Perfect",
    description: "Maintain exactly 30-day streak",
    exactRequirement: 30,
    currentValue: 29,
    testType: "exact",
    unlocked: false,
    category: "Precision",
  },
  {
    id: "friends_range_5_10",
    name: "Social Sweet Spot",
    description: "Have between 5-10 friends",
    exactRequirement: 5,
    rangeMax: 10,
    currentValue: 4,
    testType: "range",
    unlocked: false,
    category: "Range",
  },
  {
    id: "challenges_min_3",
    name: "Challenge Veteran",
    description: "Complete at least 3 challenges",
    exactRequirement: 3,
    currentValue: 2,
    testType: "minimum",
    unlocked: false,
    category: "Minimum",
  },
];

export function ThresholdTests() {
  const [thresholds, setThresholds] = useState(mockThresholds);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);

  const checkThreshold = (threshold: ThresholdTest): boolean => {
    switch (threshold.testType) {
      case "exact":
        return threshold.currentValue === threshold.exactRequirement;
      case "minimum":
        return threshold.currentValue >= threshold.exactRequirement;
      case "range":
        return threshold.currentValue >= threshold.exactRequirement && 
               threshold.currentValue <= (threshold.rangeMax || threshold.exactRequirement);
      default:
        return false;
    }
  };

  const updateValue = (id: string, increment: number) => {
    setThresholds(prev => prev.map(threshold => {
      if (threshold.id === id) {
        const newValue = Math.max(0, threshold.currentValue + increment);
        const wasUnlocked = threshold.unlocked;
        const meetsThreshold = checkThreshold({ ...threshold, currentValue: newValue });
        
        if (!wasUnlocked && meetsThreshold) {
          setJustUnlocked(id);
          setTimeout(() => setJustUnlocked(null), 2000);
          
          toast({
            title: "Threshold Achievement Unlocked! 🎯",
            description: `${threshold.name} - Perfect timing!`,
          });
        }
        
        return {
          ...threshold,
          currentValue: newValue,
          unlocked: meetsThreshold,
        };
      }
      return threshold;
    }));
  };

  const setExactValue = (id: string, value: number) => {
    setThresholds(prev => prev.map(threshold => {
      if (threshold.id === id) {
        const wasUnlocked = threshold.unlocked;
        const meetsThreshold = checkThreshold({ ...threshold, currentValue: value });
        
        if (!wasUnlocked && meetsThreshold) {
          setJustUnlocked(id);
          setTimeout(() => setJustUnlocked(null), 2000);
          
          toast({
            title: "Threshold Achievement Unlocked! 🎯",
            description: `${threshold.name} - Perfect precision!`,
          });
        }
        
        return {
          ...threshold,
          currentValue: value,
          unlocked: meetsThreshold,
        };
      }
      return threshold;
    }));
  };

  const resetThresholds = () => {
    setThresholds(mockThresholds);
    setJustUnlocked(null);
  };

  const getProgressPercentage = (threshold: ThresholdTest): number => {
    switch (threshold.testType) {
      case "exact":
        return Math.min(100, (threshold.currentValue / threshold.exactRequirement) * 100);
      case "minimum":
        return Math.min(100, (threshold.currentValue / threshold.exactRequirement) * 100);
      case "range":
        const rangeSize = (threshold.rangeMax || threshold.exactRequirement) - threshold.exactRequirement + 1;
        const positionInRange = Math.max(0, threshold.currentValue - threshold.exactRequirement + 1);
        return Math.min(100, (positionInRange / rangeSize) * 100);
      default:
        return 0;
    }
  };

  const getThresholdStatus = (threshold: ThresholdTest) => {
    const meets = checkThreshold(threshold);
    const progress = getProgressPercentage(threshold);
    
    if (meets) {
      return { color: "text-green-500", icon: <CheckCircle2 className="w-4 h-4" />, status: "Met" };
    } else if (progress >= 90) {
      return { color: "text-yellow-500", icon: <AlertCircle className="w-4 h-4" />, status: "Close" };
    } else {
      return { color: "text-muted-foreground", icon: <Circle className="w-4 h-4" />, status: "Progress" };
    }
  };

  const getRequirementText = (threshold: ThresholdTest): string => {
    switch (threshold.testType) {
      case "exact":
        return `Exactly ${threshold.exactRequirement}`;
      case "minimum":
        return `At least ${threshold.exactRequirement}`;
      case "range":
        return `Between ${threshold.exactRequirement}-${threshold.rangeMax}`;
      default:
        return `${threshold.exactRequirement}`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Threshold Testing System</h2>
          <p className="text-muted-foreground">Test exact requirements and progress tracking</p>
        </div>
        <Button onClick={resetThresholds} variant="outline">
          Reset All
        </Button>
      </div>

      <div className="grid gap-4">
        {thresholds.map((threshold) => {
          const status = getThresholdStatus(threshold);
          const progress = getProgressPercentage(threshold);
          
          return (
            <motion.div
              key={threshold.id}
              layout
              className={`relative p-4 rounded-lg border transition-all ${
                threshold.unlocked 
                  ? "bg-green-500/10 border-green-500/30" 
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    threshold.unlocked 
                      ? "bg-green-500 text-white" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    <Target className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{threshold.name}</h3>
                      <div className={`flex items-center gap-1 ${status.color}`}>
                        {status.icon}
                        <span className="text-xs">{status.status}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{threshold.description}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {threshold.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {threshold.testType}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2 min-w-[200px]">
                  <div className="text-sm">
                    <div className="font-medium">
                      Current: {threshold.currentValue}
                    </div>
                    <div className="text-muted-foreground">
                      Required: {getRequirementText(threshold)}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-center">{progress.toFixed(1)}%</div>
                  </div>
                  
                  {!threshold.unlocked && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateValue(threshold.id, -1)}
                        disabled={threshold.currentValue <= 0}
                      >
                        -1
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateValue(threshold.id, 1)}
                      >
                        +1
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setExactValue(threshold.id, threshold.exactRequirement)}
                      >
                        Set Exact
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {justUnlocked === threshold.id && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-lg animate-pulse" />
                    <div className="absolute top-2 right-2">
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="text-2xl"
                      >
                        🎯
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Test Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Threshold Test Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-500">
                {thresholds.filter(t => t.unlocked).length}
              </div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-500">
                {thresholds.filter(t => !t.unlocked && getProgressPercentage(t) >= 90).length}
              </div>
              <div className="text-sm text-muted-foreground">Close</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-muted-foreground">
                {thresholds.filter(t => !t.unlocked && getProgressPercentage(t) < 90).length}
              </div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Threshold System Features:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">Test Types:</h4>
            <ul className="space-y-1">
              <li>✅ Exact value matching</li>
              <li>✅ Minimum threshold detection</li>
              <li>✅ Range-based achievements</li>
              <li>✅ Immediate unlock triggers</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Progress Tracking:</h4>
            <ul className="space-y-1">
              <li>✅ Real-time progress updates</li>
              <li>✅ Visual proximity indicators</li>
              <li>✅ Precise requirement display</li>
              <li>✅ Achievement celebration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}