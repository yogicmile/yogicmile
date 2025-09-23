import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  met: boolean;
  label: string;
}

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({
  password,
  showRequirements = true,
  className
}) => {
  const requirements: PasswordRequirement[] = [
    {
      met: password.length >= 8,
      label: 'At least 8 characters'
    },
    {
      met: /[A-Z]/.test(password),
      label: 'One uppercase letter'
    },
    {
      met: /[a-z]/.test(password),
      label: 'One lowercase letter'
    },
    {
      met: /\d/.test(password),
      label: 'One number'
    },
    {
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      label: 'One special character (!@#$%^&*)'
    }
  ];

  const metRequirements = requirements.filter(req => req.met).length;
  const strengthPercentage = (metRequirements / requirements.length) * 100;

  const getStrengthLevel = () => {
    if (metRequirements === 0) return { level: 'None', color: 'text-muted-foreground', variant: 'outline' as const };
    if (metRequirements <= 2) return { level: 'Weak', color: 'text-destructive', variant: 'destructive' as const };
    if (metRequirements <= 3) return { level: 'Fair', color: 'text-yellow-600', variant: 'secondary' as const };
    if (metRequirements <= 4) return { level: 'Good', color: 'text-blue-600', variant: 'default' as const };
    return { level: 'Strong', color: 'text-green-600', variant: 'default' as const };
  };

  const strength = getStrengthLevel();

  const getProgressColor = () => {
    if (strengthPercentage <= 40) return 'bg-destructive';
    if (strengthPercentage <= 60) return 'bg-yellow-500';
    if (strengthPercentage <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Password Strength</span>
          <Badge variant={strength.variant} className="text-xs">
            {strength.level}
          </Badge>
        </div>
        
        <div className="relative">
          <Progress value={strengthPercentage} className="h-2" />
          <div 
            className={cn(
              "absolute top-0 left-0 h-2 rounded-full transition-all duration-300",
              getProgressColor()
            )}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>

      {showRequirements && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">Requirements:</span>
          <div className="space-y-1">
            {requirements.map((requirement, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center space-x-2 text-sm transition-colors",
                  requirement.met ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {requirement.met ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <X className="w-3 h-3" />
                )}
                <span>{requirement.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security warnings */}
      {password.length > 0 && strengthPercentage < 60 && (
        <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Weak Password Detected
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              Your password may be vulnerable to attacks. Consider using a stronger password that meets all requirements.
            </p>
          </div>
        </div>
      )}

      {/* Common password warning */}
      {isCommonPassword(password) && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Common Password Warning
            </p>
            <p className="text-xs text-red-700 dark:text-red-300">
              This password appears to be commonly used and may be easily guessed. Please choose a more unique password.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Check against common passwords (simplified list)
const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'shadow', 'sunshine', 'football'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};