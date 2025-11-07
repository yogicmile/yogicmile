import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useMobileAuth, SignUpFormData } from '@/hooks/use-mobile-auth';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, Mail, MapPin, User, Shield, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LegalPolicyModal } from './LegalPolicyModal';
import { getEmailErrorMessage, validateEmailRealtime } from '@/utils/emailValidation';

interface MobileSignupFormProps {
  onSuccess: (mobileNumber: string) => void;
  className?: string;
}

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Visakhapatnam', 'Indore', 'Thane', 'Bhopal', 'Patna'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi'
];

export const MobileSignupForm: React.FC<MobileSignupFormProps> = ({ onSuccess, className }) => {
  const { state, signUpMobile, validateMobileNumber, formatMobileNumber } = useMobileAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<SignUpFormData>({
    mobileNumber: '',
    authChoice: 'password', // Force password mode for testing (OTP disabled)
    fullName: '',
    address: {
      city: '',
      district: '',
      state: '',
      country: 'India'
    },
    email: '',
    password: '',
    age: undefined,
    gender: undefined,
    referralCode: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');
  const [isReferralLocked, setIsReferralLocked] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    error: string | null;
    suggestions: string[];
  }>({ isValid: true, error: null, suggestions: [] });

  // Auto-fill referral code from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && /^\d{10}$/.test(refCode)) {
      setFormData(prev => ({ ...prev, referralCode: refCode }));
      setIsReferralLocked(true);
      toast({
        title: "Referral code applied! 🎁",
        description: "Complete 10,000 steps to unlock ₹1 bonus",
      });
    }
  }, [toast]);

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Real-time email validation
    if (field === 'email' && typeof value === 'string') {
      const validation = validateEmailRealtime(value);
      setEmailValidation(validation);
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMobileChange = (value: string) => {
    const formatted = formatMobileNumber(value);
    setFormData(prev => ({ ...prev, mobileNumber: formatted }));
    
    if (errors.mobileNumber) {
      setErrors(prev => ({ ...prev, mobileNumber: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.address.city) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.state) {
      newErrors['address.state'] = 'State is required';
    }

    if (formData.authChoice === 'password') {
      if (!formData.email) {
        newErrors.email = 'Email is required for password login';
      } else {
        const emailError = getEmailErrorMessage(formData.email);
        if (emailError) {
          newErrors.email = emailError;
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }

    if (!termsAccepted) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await signUpMobile(formData);
    
    if (result.success && result.mobileNumber) {
      onSuccess(result.mobileNumber);
    }
  };

  return (
    <div className={cn("w-full max-w-lg mx-auto", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Smartphone className="h-6 w-6 text-primary" />
            Mobile Signup
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Start your walking journey with Yogic Mile
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Number *
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobileNumber}
                onChange={(e) => handleMobileChange(e.target.value)}
                className={errors.mobileNumber ? "border-red-500" : ""}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-500">{errors.mobileNumber}</p>
              )}
              <p className="text-xs text-muted-foreground">
                📱 This will be your login ID and referral mobile number
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Authentication Choice - OTP disabled for testing */}
            {/* 
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentication Method *
              </Label>
              <RadioGroup
                value={formData.authChoice}
                onValueChange={(value: 'password' | 'otp') => 
                  setFormData(prev => ({ ...prev, authChoice: value }))
                }
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="otp" id="otp" />
                  <Label htmlFor="otp" className="flex-1 cursor-pointer">
                    <div className="font-medium">OTP Only</div>
                    <div className="text-xs text-muted-foreground">Quick & secure</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="password" id="password" />
                  <Label htmlFor="password" className="flex-1 cursor-pointer">
                    <div className="font-medium">Set Password</div>
                    <div className="text-xs text-muted-foreground">Email + Password</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            */}

            {/* Email - Required for password authentication */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
                {emailValidation.isValid && formData.email && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={cn(
                  errors.email || emailValidation.error ? "border-red-500" : "",
                  emailValidation.isValid && formData.email ? "border-green-500" : ""
                )}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              {!errors.email && emailValidation.error && formData.email && (
                <p className="text-sm text-red-500">{emailValidation.error}</p>
              )}
              {emailValidation.suggestions.length > 0 && (
                <div className="text-xs text-amber-600 space-y-1">
                  {emailValidation.suggestions.map((suggestion, idx) => (
                    <p key={idx}>💡 {suggestion}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Password - Required */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Password *
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Address Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <MapPin className="h-4 w-4" />
                Address Information
              </Label>
              
              {/* City and District in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City *
                  </Label>
                  <Select 
                    value={formData.address.city} 
                    onValueChange={(value) => handleInputChange('address.city', value)}
                  >
                    <SelectTrigger 
                      className={cn(
                        "h-10 w-full",
                        errors['address.city'] ? "border-red-500" : ""
                      )}
                    >
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {INDIAN_CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors['address.city'] && (
                    <p className="text-xs text-red-500 mt-1">{errors['address.city']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium">
                    District
                  </Label>
                  <Input
                    id="district"
                    placeholder="Enter district"
                    value={formData.address.district}
                    onChange={(e) => handleInputChange('address.district', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* State in separate row for better visibility */}
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-medium">
                  State *
                </Label>
                <Select 
                  value={formData.address.state} 
                  onValueChange={(value) => handleInputChange('address.state', value)}
                >
                  <SelectTrigger 
                    className={cn(
                      "h-10 w-full",
                      errors['address.state'] ? "border-red-500" : ""
                    )}
                  >
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors['address.state'] && (
                  <p className="text-xs text-red-500 mt-1">{errors['address.state']}</p>
                )}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Your age"
                  min="13"
                  max="120"
                  value={formData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender || ''} 
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Referral Code - Mobile Number */}
            <div className="space-y-2">
              <Label htmlFor="referral" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Referral Mobile Number <span className="text-muted-foreground">(optional)</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Get ₹1 bonus!</span>
              </Label>
              <div className="relative">
                <Input
                  id="referral"
                  type="tel"
                  placeholder="987XXXXXX"
                  maxLength={10}
                  value={formData.referralCode}
                  disabled={isReferralLocked}
                  onChange={(e) => {
                    if (!isReferralLocked) {
                      const value = e.target.value.replace(/\D/g, '');
                      handleInputChange('referralCode', value);
                    }
                  }}
                  className={isReferralLocked ? "border-green-500 bg-green-50" : ""}
                />
                {isReferralLocked && formData.referralCode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={() => {
                      setIsReferralLocked(false);
                      setFormData(prev => ({ ...prev, referralCode: '' }));
                      toast({ title: "Referral code removed", description: "You can enter a different code" });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {isReferralLocked && formData.referralCode && (
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <span>✓</span> Referral code locked - ₹1 bonus on 10,000 steps!
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                📱 Enter your friend's mobile number to get ₹1 bonus (Complete 10,000 steps to unlock!)
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                className={errors.terms ? "border-red-500" : ""}
              />
              <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I agree to the{' '}
                <button 
                  type="button" 
                  className="text-primary underline hover:text-primary/80"
                  onClick={(e) => {
                    e.preventDefault();
                    setPolicyType('terms');
                    setShowPolicyModal(true);
                  }}
                >
                  Terms & Conditions
                </button>{' '}
                and{' '}
                <button 
                  type="button" 
                  className="text-primary underline hover:text-primary/80"
                  onClick={(e) => {
                    e.preventDefault();
                    setPolicyType('privacy');
                    setShowPolicyModal(true);
                  }}
                >
                  Privacy Policy
                </button>
              </Label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-500">{errors.terms}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <LegalPolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        initialTab={policyType}
      />
    </div>
  );
};