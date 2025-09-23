import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Coins,
  Target,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Accessible Progress Ring Component
interface AccessibleProgressRingProps {
  progress: number;
  goal: number;
  label: string;
  description?: string;
  className?: string;
}

export const AccessibleProgressRing: React.FC<AccessibleProgressRingProps> = ({
  progress,
  goal,
  label,
  description,
  className
}) => {
  const percentage = Math.min((progress / goal) * 100, 100);
  const strokeDasharray = `${percentage * 2.83} 283`;
  
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative w-32 h-32" role="img" aria-label={`${label}: ${progress} out of ${goal} (${Math.round(percentage)}% complete)`}>
        <svg
          className="w-32 h-32 transform -rotate-90"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="text-primary transition-all duration-500 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground" aria-hidden="true">
            {progress.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground" aria-hidden="true">
            of {goal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Accessible text description */}
      <div className="mt-2 text-center">
        <div className="text-sm font-medium" id={`progress-label-${label.replace(/\s+/g, '-')}`}>
          {label}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground" id={`progress-desc-${label.replace(/\s+/g, '-')}`}>
            {description}
          </div>
        )}
      </div>

      {/* Screen reader only detailed description */}
      <div className="sr-only" aria-live="polite">
        {`Progress update: ${label} is ${Math.round(percentage)}% complete. Current: ${progress}, Goal: ${goal}.`}
        {description && ` ${description}`}
      </div>
    </div>
  );
};

// Accessible Form Component
interface AccessibleFormProps {
  onSubmit: (data: any) => void;
  className?: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({ onSubmit, className }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goal: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.goal.trim()) {
      newErrors.goal = 'Daily step goal is required';
    } else if (isNaN(Number(formData.goal)) || Number(formData.goal) < 1000) {
      newErrors.goal = 'Please enter a valid step goal (minimum 1000 steps)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Announce errors to screen readers
      const errorMessages = Object.values(errors).join('. ');
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.textContent = `Form errors: ${errorMessages}`;
      announcement.className = 'sr-only';
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      
      // Success announcement
      const successAnnouncement = document.createElement('div');
      successAnnouncement.setAttribute('aria-live', 'polite');
      successAnnouncement.textContent = 'Form submitted successfully!';
      successAnnouncement.className = 'sr-only';
      document.body.appendChild(successAnnouncement);
      setTimeout(() => document.body.removeChild(successAnnouncement), 1000);
      
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle id="form-title">Profile Setup</CardTitle>
        <p className="text-sm text-muted-foreground">
          Complete your profile to get personalized recommendations
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate role="form" aria-labelledby="form-title">
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="name"
                className="text-sm font-medium"
              >
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={cn("min-h-[44px]", errors.name && "border-red-500")}
                aria-describedby={errors.name ? "name-error" : "name-help"}
                aria-invalid={!!errors.name}
                required
              />
              {errors.name ? (
                <div id="name-error" className="text-sm text-red-600" role="alert" aria-live="polite">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {errors.name}
                </div>
              ) : (
                <div id="name-help" className="text-sm text-muted-foreground">
                  Enter your full name as you'd like it to appear
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="email"
                className="text-sm font-medium"
              >
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={cn("min-h-[44px]", errors.email && "border-red-500")}
                aria-describedby={errors.email ? "email-error" : "email-help"}
                aria-invalid={!!errors.email}
                required
              />
              {errors.email ? (
                <div id="email-error" className="text-sm text-red-600" role="alert" aria-live="polite">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {errors.email}
                </div>
              ) : (
                <div id="email-help" className="text-sm text-muted-foreground">
                  We'll use this to send you updates and rewards
                </div>
              )}
            </div>

            {/* Goal Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="goal"
                className="text-sm font-medium"
              >
                Daily Step Goal *
              </Label>
              <Input
                id="goal"
                type="number"
                min="1000"
                max="50000"
                step="500"
                value={formData.goal}
                onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                className={cn("min-h-[44px]", errors.goal && "border-red-500")}
                aria-describedby={errors.goal ? "goal-error" : "goal-help"}
                aria-invalid={!!errors.goal}
                required
              />
              {errors.goal ? (
                <div id="goal-error" className="text-sm text-red-600" role="alert" aria-live="polite">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  {errors.goal}
                </div>
              ) : (
                <div id="goal-help" className="text-sm text-muted-foreground">
                  Recommended: 8,000-12,000 steps per day
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full min-h-[44px]"
              disabled={isSubmitting}
              aria-describedby="submit-status"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Save Profile</span>
                </>
              )}
            </Button>
            
            <div id="submit-status" className="sr-only" aria-live="polite">
              {isSubmitting ? 'Form is being submitted' : 'Form is ready to submit'}
            </div>

            {errors.submit && (
              <div className="text-sm text-red-600 text-center" role="alert" aria-live="polite">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                {errors.submit}
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Accessible Stats Dashboard
interface AccessibleStatsDashboardProps {
  stats: {
    dailySteps: number;
    dailyGoal: number;
    coinsEarned: number;
    streakDays: number;
    achievements: number;
  };
  className?: string;
}

export const AccessibleStatsDashboard: React.FC<AccessibleStatsDashboardProps> = ({ 
  stats, 
  className 
}) => {
  const progressPercentage = (stats.dailySteps / stats.dailyGoal) * 100;

  return (
    <div className={cn("space-y-6", className)} role="region" aria-label="Daily Statistics Dashboard">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <AccessibleProgressRing
              progress={stats.dailySteps}
              goal={stats.dailyGoal}
              label="Daily Steps"
              description="Keep walking to reach your goal!"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-semibold">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
              aria-label={`Daily step progress: ${Math.round(progressPercentage)}% complete`}
            />
            <div className="text-xs text-muted-foreground text-center">
              {stats.dailySteps >= stats.dailyGoal 
                ? '🎉 Congratulations! Goal achieved!' 
                : `${stats.dailyGoal - stats.dailySteps} steps remaining`
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="group" aria-label="Activity Statistics">
        {/* Coins Earned */}
        <Card tabIndex={0} role="article" aria-labelledby="coins-title">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p id="coins-title" className="text-sm font-medium text-muted-foreground">
                  Coins Earned Today
                </p>
                <p className="text-2xl font-bold text-yellow-600" aria-describedby="coins-desc">
                  {stats.coinsEarned}
                </p>
                <p id="coins-desc" className="text-xs text-muted-foreground">
                  From {stats.dailySteps.toLocaleString()} steps
                </p>
              </div>
              <Coins className="h-8 w-8 text-yellow-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        {/* Streak Days */}
        <Card tabIndex={0} role="article" aria-labelledby="streak-title">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p id="streak-title" className="text-sm font-medium text-muted-foreground">
                  Current Streak
                </p>
                <p className="text-2xl font-bold text-orange-600" aria-describedby="streak-desc">
                  {stats.streakDays}
                </p>
                <p id="streak-desc" className="text-xs text-muted-foreground">
                  {stats.streakDays === 1 ? 'day' : 'days'} in a row
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card tabIndex={0} role="article" aria-labelledby="achievements-title">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p id="achievements-title" className="text-sm font-medium text-muted-foreground">
                  Achievements
                </p>
                <p className="text-2xl font-bold text-purple-600" aria-describedby="achievements-desc">
                  {stats.achievements}
                </p>
                <p id="achievements-desc" className="text-xs text-muted-foreground">
                  Badges earned
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accessibility Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Screen Reader Ready
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Keyboard Navigation
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                High Contrast Support
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                WCAG 2.1 AA
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};