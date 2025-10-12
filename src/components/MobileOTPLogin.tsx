import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useMobileAuth } from '@/hooks/use-mobile-auth';
import { Smartphone, Shield, Clock, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MobileOTPLoginProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  className?: string;
}

export const MobileOTPLogin: React.FC<MobileOTPLoginProps> = ({ 
  onSuccess, 
  onSwitchToSignup, 
  className 
}) => {
  const { 
    state, 
    formatMobileNumber, 
    validateMobileNumber, 
    generateOTP, 
    verifyOTP 
  } = useMobileAuth();
  const { enterGuestMode } = useAuth();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [error, setError] = useState('');

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateMobileNumber(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const result = await generateOTP(mobileNumber);
    
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    const result = await verifyOTP(mobileNumber, otp);
    
    if (result.success) {
      // Wait a moment for auth session to be picked up by AuthContext
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setError(result.error || 'Invalid OTP');
      setOTP('');
    }
  };

  const handleResendOTP = async () => {
    setError('');
    const result = await generateOTP(mobileNumber);
    
    if (!result.success) {
      setError(result.error || 'Failed to resend OTP');
    }
  };

  const handleBack = () => {
    setStep('mobile');
    setOTP('');
    setError('');
  };

  if (step === 'mobile') {
    return (
      <div className={cn("w-full max-w-md mx-auto", className)}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Smartphone className="h-6 w-6 text-primary" />
              Mobile Login
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your mobile number to receive OTP via WhatsApp
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMobileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile" className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(formatMobileNumber(e.target.value))}
                  className={error ? "border-red-500" : ""}
                  disabled={state.isLoading}
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  📱 We'll send a 6-digit OTP via WhatsApp to verify your number
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={state.isLoading || !mobileNumber}
              >
                {state.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Verify OTP
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent via WhatsApp to
          </p>
          <p className="text-sm font-medium">{mobileNumber}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 justify-center">
                <Shield className="h-4 w-4" />
                Enter OTP
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOTP}
                  maxLength={6}
                  className={error ? "border-red-500" : ""}
                  disabled={state.isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            {/* Timer and Resend */}
            <div className="text-center space-y-2">
              {!state.canResend && state.otpResendTimer > 0 && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Resend OTP in {state.otpResendTimer}s
                </div>
              )}
              
              {state.canResend && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={state.isLoading}
                  className="text-primary"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Resend OTP
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={state.isLoading || otp.length !== 6}
              >
                {state.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify & Login
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBack}
                disabled={state.isLoading}
              >
                ← Back to Mobile Number
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};