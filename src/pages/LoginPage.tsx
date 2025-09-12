import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Phone, Lock, AlertCircle, CheckCircle2, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, enterGuestMode, generateOTP } = useAuth();
  
  const [formData, setFormData] = useState({
    mobileNumber: "",
    password: "",
    otp: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [activeTab, setActiveTab] = useState("password");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Mobile number validation
  const validateMobileNumber = (mobile: string) => {
    const mobilePattern = /^[6-9]\d{9}$/; // Indian mobile number pattern
    return mobilePattern.test(mobile.replace(/\s+/g, ''));
  };

  // Handle password login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      try {
        const { error } = await signIn(formData.mobileNumber, formData.password);
        
        if (!error) {
          navigate('/');
        }
      } catch (err) {
        console.error('Login error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle OTP request
  const handleRequestOTP = async () => {
    if (!formData.mobileNumber) {
      setErrors({ mobileNumber: "Mobile number is required" });
      return;
    }
    
    if (!validateMobileNumber(formData.mobileNumber)) {
      setErrors({ mobileNumber: "Please enter a valid 10-digit mobile number" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await generateOTP(formData.mobileNumber);
      
      if (!error) {
        setIsOTPSent(true);
        setErrors({});
        toast({
          title: "OTP Sent",
          description: "Please check the OTP displayed above (in production, this would be sent via SMS)",
        });
      }
    } catch (err) {
      console.error('OTP generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP login
  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }
    
    if (!formData.otp) {
      newErrors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      newErrors.otp = "OTP must be 6 digits";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      
      try {
        const { error } = await signIn(formData.mobileNumber, undefined, formData.otp);
        
        if (!error) {
          navigate('/');
        }
      } catch (err) {
        console.error('OTP Login error:', err);
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
    if (field === 'mobileNumber') {
      // Only allow numbers for mobile number
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [field]: numericValue }));
        if (isOTPSent) {
          setIsOTPSent(false); // Reset OTP state when mobile number changes
        }
      }
    } else if (field === 'otp') {
      // Only allow numbers for OTP, max 6 digits
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 6) {
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
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to continue your yogic journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Mobile + Password</TabsTrigger>
              <TabsTrigger value="otp">Mobile + OTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handlePasswordLogin}>
                {/* Mobile Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="mobile-password">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile-password"
                      type="tel"
                      placeholder="Enter your mobile number"
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
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
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
                  {errors.password && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Signing In...
                    </div>
                  ) : (
                    "Sign In with Password"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="otp" className="space-y-4 mt-4">
              <form onSubmit={handleOTPLogin}>
                {/* Mobile Number Field */}
                <div className="space-y-2">
                  <Label htmlFor="mobile-otp">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile-otp"
                      type="tel"
                      placeholder="Enter your mobile number"
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
                </div>

                {/* OTP Request Button */}
                {!isOTPSent && (
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleRequestOTP}
                    disabled={isLoading || !validateMobileNumber(formData.mobileNumber)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                )}

                {/* OTP Field */}
                {isOTPSent && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          className={`pl-10 ${errors.otp ? 'border-destructive' : ''}`}
                          value={formData.otp}
                          onChange={(e) => handleInputChange('otp', e.target.value)}
                          maxLength={6}
                        />
                        {formData.otp.length === 6 && (
                          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {errors.otp && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          {errors.otp}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        OTP expires in 5 minutes
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || formData.otp.length !== 6}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Verifying OTP...
                        </div>
                      ) : (
                        "Verify OTP & Sign In"
                      )}
                    </Button>

                    <Button 
                      type="button"
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => {
                        setIsOTPSent(false);
                        setFormData(prev => ({ ...prev, otp: "" }));
                      }}
                    >
                      Resend OTP
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
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
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up here
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}