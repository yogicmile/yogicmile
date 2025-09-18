import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useEnhancedSecurity } from '@/hooks/use-enhanced-security';
import { cn } from '@/lib/utils';

interface EnhancedPasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  showStrengthIndicator?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
}

export const EnhancedPasswordInput: React.FC<EnhancedPasswordInputProps> = ({
  label = "Password",
  placeholder = "Enter your password",
  value,
  onChange,
  showStrengthIndicator = true,
  required = false,
  className,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const { validatePasswordStrength } = useEnhancedSecurity();
  
  const passwordValidation = validatePasswordStrength(value);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-orange-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'Strong';
      case 'medium':
        return 'Medium';
      case 'weak':
        return 'Weak';
      default:
        return 'Very Weak';
    }
  };

  const strengthPercentage = (passwordValidation.score / 6) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="password" className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            "pr-12",
            error && "border-destructive focus:border-destructive"
          )}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {showStrengthIndicator && value && (focused || value.length > 0) && (
        <div className="space-y-3">
          {/* Strength Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Password Strength</span>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  passwordValidation.strength === 'strong' && "border-green-500 text-green-700",
                  passwordValidation.strength === 'medium' && "border-orange-500 text-orange-700",
                  passwordValidation.strength === 'weak' && "border-red-500 text-red-700"
                )}
              >
                {getStrengthText(passwordValidation.strength)}
              </Badge>
            </div>
            <Progress 
              value={strengthPercentage} 
              className="h-2"
            />
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                getStrengthColor(passwordValidation.strength)
              )}
              style={{ width: `${strengthPercentage}%` }}
            />
          </div>

          {/* Password Requirements */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Password Requirements:
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              <div className="flex items-center gap-2">
                {passwordValidation.checks.length ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={passwordValidation.checks.length ? "text-green-700" : "text-red-700"}>
                  At least 8 characters
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {passwordValidation.checks.uppercase ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={passwordValidation.checks.uppercase ? "text-green-700" : "text-red-700"}>
                  Uppercase letter
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {passwordValidation.checks.lowercase ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={passwordValidation.checks.lowercase ? "text-green-700" : "text-red-700"}>
                  Lowercase letter
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {passwordValidation.checks.numbers ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={passwordValidation.checks.numbers ? "text-green-700" : "text-red-700"}>
                  Number
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {passwordValidation.checks.symbols ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={passwordValidation.checks.symbols ? "text-green-700" : "text-red-700"}>
                  Special character
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {passwordValidation.checks.noCommon ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={passwordValidation.checks.noCommon ? "text-green-700" : "text-red-700"}>
                  Not a common password
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};