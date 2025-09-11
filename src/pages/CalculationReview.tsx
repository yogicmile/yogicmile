import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { YogicMileHeader } from '@/components/YogicMileHeader';
import { ArrowLeft, Calculator, Target, Clock, Coins, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PhaseData {
  tier: number;
  symbol: string;
  name: string;
  rate: number; // paisa per 25 steps
  stepRequirement: number;
  timeLimit: number;
  spiritualName: string;
}

interface CalculationResult {
  currentPhase: PhaseData;
  nextPhase: PhaseData | null;
  stepsEntered: number;
  cappedSteps: number;
  daysEntered: number;
  units: number;
  coinsEarned: number;
  rupeesEarned: number;
  phaseAchieved: boolean;
  stepsProgress: number;
  daysProgress: number;
  dailyCapExceeded: boolean;
}

const CalculationReview = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<string>('');
  const [days, setDays] = useState<string>('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const phases: PhaseData[] = [
    { tier: 1, symbol: '🟡', name: 'Paisa Phase', rate: 1, stepRequirement: 200000, timeLimit: 30, spiritualName: 'Foundation of Discipline' },
    { tier: 2, symbol: '🪙', name: 'Coin Phase', rate: 2, stepRequirement: 300000, timeLimit: 45, spiritualName: 'Consistent Practice' },
    { tier: 3, symbol: '🎟️', name: 'Token Phase', rate: 3, stepRequirement: 400000, timeLimit: 60, spiritualName: 'Strengthened Willpower' },
    { tier: 4, symbol: '💎', name: 'Gem Phase', rate: 5, stepRequirement: 500000, timeLimit: 75, spiritualName: 'Inner Clarity' },
    { tier: 5, symbol: '💠', name: 'Diamond Phase', rate: 7, stepRequirement: 600000, timeLimit: 80, spiritualName: 'Unshakeable Focus' },
    { tier: 6, symbol: '👑', name: 'Crown Phase', rate: 10, stepRequirement: 1000000, timeLimit: 120, spiritualName: 'Mastery of Self' },
    { tier: 7, symbol: '🏵️', name: 'Emperor Phase', rate: 15, stepRequirement: 1700000, timeLimit: 200, spiritualName: 'Transcendent Power' },
    { tier: 8, symbol: '🏅', name: 'Legend Phase', rate: 20, stepRequirement: 2000000, timeLimit: 250, spiritualName: 'Enlightened Being' },
    { tier: 9, symbol: '🏆', name: 'Immortal Phase', rate: 30, stepRequirement: 3000000, timeLimit: 365, spiritualName: 'Eternal Consciousness' }
  ];

  const calculatePhaseAndEarnings = (inputSteps: number, inputDays: number): CalculationResult => {
    // Apply daily cap of 12,000 steps
    const cappedSteps = Math.min(inputSteps, 12000);
    const dailyCapExceeded = inputSteps > 12000;
    
    // Calculate units (every 25 steps = 1 unit)
    const units = Math.floor(cappedSteps / 25);
    
    // Find the appropriate phase based on steps and time limits
    let currentPhase = phases[0]; // Default to first phase
    let phaseAchieved = false;

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      if (inputSteps <= phase.stepRequirement && inputDays <= phase.timeLimit) {
        currentPhase = phase;
        phaseAchieved = true;
        break;
      } else if (inputSteps >= phase.stepRequirement && inputDays <= phase.timeLimit) {
        // User has completed this phase, move to next
        if (i < phases.length - 1) {
          currentPhase = phases[i + 1];
        } else {
          currentPhase = phase; // Max phase reached
        }
      }
    }

    // If no phase qualifies, user hasn't achieved any phase properly
    if (inputSteps > phases[phases.length - 1].stepRequirement || inputDays > phases[phases.length - 1].timeLimit) {
      phaseAchieved = false;
    }

    // Calculate earnings based on the determined phase
    let coinsEarned = 0;
    if (phaseAchieved) {
      // All phases: rate paisa per 25 steps
      coinsEarned = Math.floor(units * currentPhase.rate);
    }

    const rupeesEarned = coinsEarned / 100;
    const nextPhase = phases.find(p => p.tier === currentPhase.tier + 1) || null;

    return {
      currentPhase,
      nextPhase,
      stepsEntered: inputSteps,
      cappedSteps,
      daysEntered: inputDays,
      units,
      coinsEarned,
      rupeesEarned,
      phaseAchieved,
      stepsProgress: (inputSteps / currentPhase.stepRequirement) * 100,
      daysProgress: (inputDays / currentPhase.timeLimit) * 100,
      dailyCapExceeded
    };
  };

  const handleCalculate = () => {
    const inputSteps = parseInt(steps) || 0;
    const inputDays = parseInt(days) || 0;

    if (inputSteps <= 0 || inputDays <= 0) {
      return;
    }

    const calculationResult = calculatePhaseAndEarnings(inputSteps, inputDays);
    setResult(calculationResult);
    setShowResult(true);
  };

  const handleTryAgain = () => {
    setShowResult(false);
    setResult(null);
    setSteps('');
    setDays('');
  };

  const getPhaseColor = (phase: PhaseData) => {
    const colors = {
      1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      2: 'bg-orange-100 text-orange-800 border-orange-200',
      3: 'bg-blue-100 text-blue-800 border-blue-200',
      4: 'bg-purple-100 text-purple-800 border-purple-200',
      5: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      6: 'bg-amber-100 text-amber-800 border-amber-200',
      7: 'bg-red-100 text-red-800 border-red-200',
      8: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      9: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return colors[phase.tier as keyof typeof colors] || colors[1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <YogicMileHeader />
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calculation Review</h1>
            <p className="text-muted-foreground">Verify coin logic across all phases</p>
          </div>
        </div>

        {!showResult ? (
          /* Input Section */
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                User Simulation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="steps">Steps Walked</Label>
                  <Input
                    id="steps"
                    type="number"
                    placeholder="Enter total steps..."
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Days Since Start</Label>
                  <Input
                    id="days"
                    type="number"
                    placeholder="Enter days..."
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="text-lg"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleCalculate}
                className="w-full text-lg py-6"
                disabled={!steps || !days}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Calculate Phase & Earnings
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Results Section */
          <div className="space-y-6 animate-scale-in">
            {/* Phase Status Card */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Phase Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Daily Cap Warning */}
                {result?.dailyCapExceeded && (
                  <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700">
                      <span className="text-lg">⚠️</span>
                      <span className="text-sm font-medium">
                        For your joint safety, only 12,000 steps per day are rewarded.
                      </span>
                    </div>
                    <div className="text-xs text-orange-600 mt-1">
                      Steps counted: {result.cappedSteps.toLocaleString()} / {result.stepsEntered.toLocaleString()} entered
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{result?.currentPhase.symbol}</span>
                    <div>
                      <Badge className={`${getPhaseColor(result!.currentPhase)} text-sm font-medium`}>
                        {result?.currentPhase.name}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result?.currentPhase.spiritualName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${result?.phaseAchieved ? 'text-green-600' : 'text-red-600'}`}>
                      {result?.phaseAchieved ? '✅ Phase Achieved' : '❌ Phase Not Achieved'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="h-4 w-4" />
                      Steps Progress
                    </div>
                    <div className="text-lg font-semibold">
                      {result?.stepsEntered.toLocaleString()} / {result?.currentPhase.stepRequirement.toLocaleString()}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(result?.stepsProgress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Time Progress
                    </div>
                    <div className="text-lg font-semibold">
                      {result?.daysEntered} / {result?.currentPhase.timeLimit} days
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(result?.daysProgress || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {result?.units.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-700">Units (25 steps each)</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600">
                      {result?.coinsEarned.toLocaleString()}
                    </div>
                    <div className="text-sm text-yellow-700">Paisa Earned</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{result?.rupeesEarned.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700">Rupees Equivalent</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      <strong>Rate Applied:</strong> {result?.currentPhase.rate} paisa per 25 steps
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      <strong>Steps Counted:</strong> {result?.cappedSteps.toLocaleString()} 
                      {result?.dailyCapExceeded && ' (capped)'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Phase Target */}
            {result?.nextPhase && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Next Phase Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{result.nextPhase.symbol}</span>
                    <div>
                      <Badge className={`${getPhaseColor(result.nextPhase)} text-sm font-medium`}>
                        {result.nextPhase.name}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.nextPhase.spiritualName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Steps Required</div>
                      <div className="text-lg font-semibold">{result.nextPhase.stepRequirement.toLocaleString()}</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Time Limit</div>
                      <div className="text-lg font-semibold">{result.nextPhase.timeLimit} days</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Try Again Button */}
            <Button 
              onClick={handleTryAgain}
              variant="outline"
              className="w-full text-lg py-6"
            >
              Try Again with New Input
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculationReview;