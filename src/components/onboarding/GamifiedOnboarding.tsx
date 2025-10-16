import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  User, 
  Users, 
  Target, 
  Trophy,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useGamification } from '@/hooks/use-gamification';
import { CelebrationModal } from '@/components/gamification/CelebrationModal';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  reward: number;
  completed: boolean;
}

interface GamifiedOnboardingProps {
  onComplete?: () => void;
}

export function GamifiedOnboarding({ onComplete }: GamifiedOnboardingProps) {
  const navigate = useNavigate();
  const { onboardingProgress, completeOnboardingStep, awardAchievement } = useGamification();
  const [currentStep, setCurrentStep] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    title: string;
    description: string;
    reward: number;
  } | null>(null);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Yogic Mile!',
      description: 'Get started on your walking journey with rewards for every step.',
      icon: <Sparkles className="w-6 h-6" />,
      action: 'Get Started',
      reward: 100,
      completed: onboardingProgress?.steps_completed.includes('welcome') || false
    },
    {
      id: 'profile_setup',
      title: 'Complete Your Profile',
      description: 'Set up your profile with a photo and bio to connect with the community.',
      icon: <User className="w-6 h-6" />,
      action: 'Setup Profile',
      reward: 50,
      completed: onboardingProgress?.steps_completed.includes('profile_setup') || false
    },
    {
      id: 'first_steps',
      title: 'Take Your First 1,000 Steps',
      description: 'Start walking and earn your first coins! Every 25 steps = 1 paisa.',
      icon: <Target className="w-6 h-6" />,
      action: 'Start Walking',
      reward: 200,
      completed: onboardingProgress?.steps_completed.includes('first_steps') || false
    },
    {
      id: 'find_friends',
      title: 'Find Your First Friend',
      description: 'Connect with other walkers to share your journey and compete in challenges.',
      icon: <Users className="w-6 h-6" />,
      action: 'Find Friends',
      reward: 75,
      completed: onboardingProgress?.steps_completed.includes('find_friends') || false
    },
    {
      id: 'join_challenge',
      title: 'Join Your First Challenge',
      description: 'Participate in seasonal challenges for exclusive rewards and badges.',
      icon: <Trophy className="w-6 h-6" />,
      action: 'Join Challenge',
      reward: 150,
      completed: onboardingProgress?.steps_completed.includes('join_challenge') || false
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const totalSteps = onboardingSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const totalRewards = onboardingSteps.reduce((sum, step) => step.completed ? sum + step.reward : sum, 0);

  const handleStepAction = async (step: OnboardingStep) => {
    if (step.completed) return;

    // Mock completion for demo - in real app, this would be handled by the respective feature
    if (step.id === 'welcome') {
      await completeOnboardingStep(step.id);
      await awardAchievement('welcome_walker_id'); // Would need to get actual ID
      
      setCelebrationData({
        title: 'Welcome Bonus!',
        description: `You've earned ${step.reward} coins for joining Yogic Mile!`,
        reward: step.reward
      });
      setShowCelebration(true);
    } else {
      // Navigate to respective sections
      switch (step.id) {
        case 'profile_setup':
          navigate('/profile');
          break;
        case 'first_steps':
          navigate('/');
          break;
        case 'find_friends':
          navigate('/profile');
          break;
        case 'join_challenge':
          navigate('/rewards');
          break;
      }
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (completedSteps === totalSteps && onComplete) {
      onComplete();
    }
  }, [completedSteps, totalSteps, onComplete]);

  if (!onboardingProgress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Yogic Mile
          </h1>
          <p className="text-muted-foreground">
            Complete these steps to unlock the full walking experience
          </p>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{completedSteps} / {totalSteps} completed</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Rewards Summary */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-warning">🪙</span>
            <span>Earned: {totalRewards} coins</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-success" />
            <span>Progress: {Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Current Step Card */}
      <Card className="relative overflow-hidden border-2 border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                p-3 rounded-full 
                ${currentStepData.completed 
                  ? 'bg-success/20 text-success' 
                  : 'bg-primary/20 text-primary'
                }
              `}>
                {currentStepData.completed ? 
                  <CheckCircle className="w-6 h-6" /> : 
                  currentStepData.icon
                }
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentStepData.title}
                  {currentStepData.completed && (
                    <Badge variant="secondary" className="bg-success text-success-foreground">
                      Completed
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Reward</div>
              <div className="text-lg font-bold text-warning">
                {currentStepData.reward} coins
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Step Action */}
          <Button
            onClick={() => handleStepAction(currentStepData)}
            disabled={currentStepData.completed}
            className={`
              w-full 
              ${currentStepData.completed 
                ? 'bg-success text-success-foreground' 
                : 'bg-primary hover:bg-primary/90'
              }
            `}
          >
            {currentStepData.completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              <>
                {currentStepData.action}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {onboardingSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`
                    w-3 h-3 rounded-full transition-all
                    ${index === currentStep 
                      ? 'bg-primary scale-125' 
                      : onboardingSteps[index].completed
                        ? 'bg-success'
                        : 'bg-muted'
                    }
                  `}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Steps Overview */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Onboarding Steps</h3>
        {onboardingSteps.map((step, index) => (
          <Card
            key={step.id}
            className={`
              cursor-pointer transition-all duration-200
              ${step.completed 
                ? 'border-success/50 bg-success/5' 
                : index === currentStep
                  ? 'border-primary/50 bg-primary/5'
                  : 'hover:border-muted'
              }
            `}
            onClick={() => setCurrentStep(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.title}</h4>
                    <div className="text-sm text-warning font-medium">
                      {step.reward} coins
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Celebration Modal */}
      {celebrationData && (
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false);
            setCelebrationData(null);
          }}
          celebrationType="milestone"
          customTitle={celebrationData.title}
          customDescription={celebrationData.description}
        />
      )}
    </div>
  );
}