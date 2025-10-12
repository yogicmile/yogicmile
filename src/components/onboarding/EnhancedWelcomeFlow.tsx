import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, 
  Users, 
  Shield, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Star,
  Gift,
  Heart,
  Zap,
  Target,
  Trophy,
  MapPin
} from 'lucide-react';
import footprintIcon from '@/assets/footprint-icon.png';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  benefits: string[];
  action?: {
    text: string;
    onClick: () => void;
  };
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Yogic Mile! 🧘‍♀️',
    description: 'Transform your daily walks into a rewarding wellness journey with real earnings and health insights.',
    icon: Heart,
    benefits: [
      'Earn real money by walking',
      'Track unlimited steps daily - completely FREE',
      'Join a supportive wellness community',
      'Access local deals and exclusive rewards'
    ]
  },
  {
    id: 'step-tracking',
    title: 'Smart Step Tracking 👟',
    description: 'Connect your phone\'s health app or wearable device for accurate, automatic step counting.',
    icon: () => <img src={footprintIcon} alt="steps" className="w-6 h-6" />,
    benefits: [
      'Automatic background step detection',
      'Support for Apple Health, Google Fit, Fitbit, and more',
      'Battery-optimized tracking',
      'No daily step limits - walk as much as you want!'
    ],
    action: {
      text: 'Enable Step Tracking',
      onClick: () => {
        // Request motion permissions
        if ('DeviceMotionEvent' in window && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          (DeviceMotionEvent as any).requestPermission();
        }
      }
    }
  },
  {
    id: 'earning-system',
    title: 'Earn While You Walk 💰',
    description: 'Every 25 steps earns you paisa! Progress through 9 tiers to increase your earning rate.',
    icon: Coins,
    benefits: [
      'Start at 1 paisa per 25 steps',
      'Unlock higher earning rates as you progress',
      'Weekend bonuses and seasonal multipliers',
      'Redeem earnings for local deals and vouchers'
    ]
  },
  {
    id: 'community',
    title: 'Join the Community 👥',
    description: 'Connect with fellow walkers, join challenges, and share your wellness achievements.',
    icon: Users,
    benefits: [
      'Weekly group challenges',
      'Share achievements on social media',
      'Leaderboards and friendly competition',
      'Motivational support from the community'
    ]
  },
  {
    id: 'privacy',
    title: 'Your Data is Protected 🛡️',
    description: 'We prioritize your privacy with enterprise-grade security and transparent data practices.',
    icon: Shield,
    benefits: [
      'End-to-end encryption for sensitive data',
      'Minimal data collection - only what\'s needed',
      'Full control over your privacy settings',
      'GDPR compliant data handling'
    ]
  }
];

interface Props {
  onComplete: () => void;
}

export function EnhancedWelcomeFlow({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    const newProgress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
    setProgress(newProgress);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Mark onboarding as completed
    localStorage.setItem('yogic-mile-onboarding-completed', 'true');
    localStorage.setItem('yogic-mile-onboarding-date', new Date().toISOString());
    
    // Simulate completion process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onComplete();
  };

  const handleSkip = () => {
    setCurrentStep(ONBOARDING_STEPS.length - 1);
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col">
      {/* Header with Progress */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </Badge>
          {currentStep < ONBOARDING_STEPS.length - 1 && (
            <Button variant="ghost" onClick={handleSkip} size="sm">
              Skip Tour
            </Button>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardContent className="p-8 text-center space-y-6">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
                  className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <currentStepData.icon className="w-10 h-10 text-primary" />
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {currentStepData.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentStepData.description}
                  </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 text-left"
                >
                  {currentStepData.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{benefit}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Action Button (if exists) */}
                {currentStepData.action && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      onClick={currentStepData.action.onClick}
                      variant="outline"
                      className="w-full mb-4"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      {currentStepData.action.text}
                    </Button>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex gap-3 pt-4"
                >
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    disabled={isCompleting}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isCompleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Setting up...
                      </>
                    ) : currentStep === ONBOARDING_STEPS.length - 1 ? (
                      <>
                        <Star className="w-4 h-4 mr-2" />
                        Start Your Journey
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="p-6 pt-0"
      >
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-primary">50K+</p>
                <p className="text-xs text-muted-foreground">Active Walkers</p>
              </div>
              <div>
                <Coins className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-primary">₹10M+</p>
                <p className="text-xs text-muted-foreground">Earned by Users</p>
              </div>
              <div>
                <MapPin className="w-6 h-6 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-primary">500+</p>
                <p className="text-xs text-muted-foreground">Partner Stores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}