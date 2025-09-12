import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Phone, MapPin, Calendar, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, enterGuestMode } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    age: "",
    gender: "",
    referralCode: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    Object.values(checks).forEach(check => check && score++);
    return { score, checks };
  };

  // Mobile number validation
  const validateMobileNumber = useCallback((mobile: string) => {
    const mobilePattern = /^[6-9]\d{9}$/; // Indian mobile number pattern
    return mobilePattern.test(mobile.replace(/\s+/g, ''));
  }, []);

  // Email validation with debouncing
  const validateEmail = useCallback((email: string) => {
    if (!email) return true; // Email is now optional
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }, []);

  // Age validation
  const validateAge = (age: string) => {
    if (!age) return true; // Optional field
    const ageNum = parseInt(age);
    return ageNum >= 13 && ageNum <= 120;
  };

  const { score, checks } = calculatePasswordStrength(formData.password);
  const passwordStrengthPercentage = (score / 5) * 100;
  const passwordStrengthColor = score < 3 ? "bg-destructive" : score < 4 ? "bg-yellow-500" : "bg-green-500";

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }
    
    if (formData.age && !validateAge(formData.age)) {
      newErrors.age = "Please enter a valid age between 13 and 120";
    }
    
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!agreedToTerms) {
      newErrors.terms = "Please accept the terms and conditions";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      try {
        const { error } = await signUp({
          fullName: formData.fullName,
          mobileNumber: formData.mobileNumber,
          email: formData.email || undefined,
          password: formData.password || undefined,
          address: formData.address,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender || undefined,
          referralCode: formData.referralCode || undefined
        });
        
        if (!error) {
          navigate('/login');
        }
      } catch (err) {
        console.error('Signup error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle guest mode
  const handleGuestMode = () => {
    enterGuestMode();
    navigate('/');
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'age') {
      // Only allow numbers for age
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 3) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
      }
    } else if (field === 'mobileNumber') {
      // Only allow numbers for mobile number
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-mist to-warm-coral/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-golden-accent to-warm-coral rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white">Y</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Create Your Account</CardTitle>
          <CardDescription className="text-center">
            Join Yogic Mile and start your wellness journey
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Full Name Field */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
              {errors.fullName && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="mobileNumber"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  className={`pl-10 ${errors.mobileNumber ? 'border-destructive' : ''}`}
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                />
                {validateMobileNumber(formData.mobileNumber) && formData.mobileNumber && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.mobileNumber && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.mobileNumber}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                This will be your unique ID and referral code
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address (optional)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {validateEmail(formData.email) && formData.email && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Optional: For password recovery and notifications
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter your full address"
                  className={`pl-10 ${errors.address ? 'border-destructive' : ''}`}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              {errors.address && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.address}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Required: For location-based offers and delivery
              </div>
            </div>

            {/* Age Field */}
            <div className="space-y-2">
              <Label htmlFor="age">Age (optional)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="age"
                  type="text"
                  placeholder="Enter your age"
                  className={`pl-10 ${errors.age ? 'border-destructive' : ''}`}
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                />
                {formData.age && validateAge(formData.age) && (
                  <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {errors.age && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.age}
                </div>
              )}
            </div>

            {/* Gender Field */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender (optional)</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Referral Code Field */}
            <div className="space-y-2">
              <Label htmlFor="referralCode">Referral Code (optional)</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="referralCode"
                  type="tel"
                  placeholder="Enter referrer's mobile number"
                  className="pl-10"
                  value={formData.referralCode}
                  onChange={(e) => handleInputChange('referralCode', e.target.value)}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Optional: Enter a friend's mobile number to get bonus rewards
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (leave empty for OTP-only login)"
                  className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
            {/* Password Requirements */}
            {formData.password && (
              <div className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Optional: Set a password for email login, or use OTP-only login
            </div>
              
              {errors.password && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            {formData.password && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle2 className="absolute right-10 top-3 h-4 w-4 text-green-500" />
                  )}
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.confirmPassword}
                  </div>
                )}
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                />
                <label htmlFor="terms" className="text-sm leading-5">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.terms}
                </div>
              )}
            </div>

          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGuestMode}
              disabled={isLoading}
            >
              Continue as Guest
            </Button>
            
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}