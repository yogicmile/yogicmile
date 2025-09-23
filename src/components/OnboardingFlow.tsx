import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Camera, 
  Heart, 
  Activity, 
  Coins, 
  Gift, 
  Users, 
  ChevronRight,
  CheckCircle,
  Smartphone,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingFlowProps {
  onComplete: () => void;
  className?: string;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Yogic Mile',
    description: 'Start your walking journey and earn rewards',
    icon: Heart,
    color: 'text-red-500'
  },
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your photo and personal details',
    icon: User,
    color: 'text-blue-500'
  },
  {
    id: 'permissions',
    title: 'Health Permissions',
    description: 'Allow step tracking for accurate rewards',
    icon: Activity,
    color: 'text-green-500'
  },
  {
    id: 'demo',
    title: 'First Steps Demo',
    description: 'Learn how step tracking works',
    icon: Smartphone,
    color: 'text-purple-500'
  },
  {
    id: 'wallet',
    title: 'Your Digital Wallet',
    description: 'Understand earning and spending coins',
    icon: Coins,
    color: 'text-yellow-600'
  },
  {
    id: 'rewards',
    title: 'Rewards Catalog',
    description: 'Discover what you can redeem',
    icon: Gift,
    color: 'text-orange-500'
  },
  {
    id: 'community',
    title: 'Join the Community',
    description: 'Connect with other walkers',
    icon: Users,
    color: 'text-teal-500'
  }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ 
  onComplete, 
  className 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      onComplete();
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-3xl">👟</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Yogic Mile!</h2>
              <p className="text-muted-foreground">
                Transform your daily walks into rewards. Every step counts towards earning coins, 
                achieving milestones, and unlocking exciting rewards.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm font-medium">Track Steps</p>
              </div>
              <div className="text-center">
                <Coins className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-sm font-medium">Earn Coins</p>
              </div>
              <div className="text-center">
                <Gift className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-sm font-medium">Get Rewards</p>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center border-4 border-dashed border-muted-foreground/20">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Add Your Photo</h2>
              <p className="text-muted-foreground">
                Personalize your profile and connect with the community
              </p>
            </div>
            <Button variant="outline" className="w-full">
              <Camera className="h-4 w-4 mr-2" />
              Add Profile Photo
            </Button>
          </div>
        );

      case 'permissions':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Enable Step Tracking</h2>
              <p className="text-muted-foreground">
                We need permission to track your steps for accurate rewards calculation
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-left space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Data Stays on Device</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">No Location Tracking</span>
              </div>
            </div>
            <Button className="w-full">
              <Activity className="h-4 w-4 mr-2" />
              Enable Step Tracking
            </Button>
          </div>
        );

      case 'demo':
        return (
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
                <div className="text-3xl font-bold text-blue-600">
                  1,234
                </div>
              </div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                Live Tracking
              </Badge>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Watch Your Steps Count</h2>
              <p className="text-muted-foreground">
                Take a few steps to see the counter update in real-time
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                💰 You earn 1 coin for every 25 steps taken
              </p>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center">
              <Coins className="h-10 w-10 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Your Digital Wallet</h2>
              <p className="text-muted-foreground">
                Earn coins by walking and spend them on real rewards
              </p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">₹0.00</div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/50 p-3 rounded">
                <div className="font-semibold">Daily Limit</div>
                <div className="text-muted-foreground">12,000 steps</div>
              </div>
              <div className="bg-muted/50 p-3 rounded">
                <div className="font-semibold">Min Cashout</div>
                <div className="text-muted-foreground">₹10.00</div>
              </div>
            </div>
          </div>
        );

      case 'rewards':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
              <Gift className="h-10 w-10 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Amazing Rewards Await</h2>
              <p className="text-muted-foreground">
                Redeem your coins for vouchers, cashback, and more
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold">🛒</div>
                <div className="text-sm font-medium">Shopping</div>
                <div className="text-xs text-muted-foreground">Vouchers</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold">🍕</div>
                <div className="text-sm font-medium">Food</div>
                <div className="text-xs text-muted-foreground">Discounts</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold">💰</div>
                <div className="text-sm font-medium">Cashback</div>
                <div className="text-xs text-muted-foreground">Direct Transfer</div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-lg font-bold">🎁</div>
                <div className="text-sm font-medium">Surprise</div>
                <div className="text-xs text-muted-foreground">Mystery Box</div>
              </div>
            </div>
          </div>
        );

      case 'community':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-teal-100 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-teal-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Join Our Community</h2>
              <p className="text-muted-foreground">
                Connect with thousands of walkers, join challenges, and stay motivated
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  C
                </div>
                <div className="text-left">
                  <div className="font-medium">Daily Challenges</div>
                  <div className="text-xs text-muted-foreground">Compete with friends</div>
                </div>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  L
                </div>
                <div className="text-left">
                  <div className="font-medium">Leaderboards</div>
                  <div className="text-xs text-muted-foreground">Weekly rankings</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("min-h-screen bg-background flex items-center justify-center p-4", className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <currentStepData.icon className={cn("h-5 w-5", currentStepData.color)} />
              <CardTitle className="text-lg">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {renderStepContent()}

          <div className="flex gap-3">
            <Button 
              onClick={handleNext}
              className="flex-1"
              size="lg"
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Continue'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep 
                    ? "bg-primary" 
                    : completedSteps.has(index)
                    ? "bg-green-500"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};