import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileOTPLogin } from '@/components/MobileOTPLogin';
import { EmailPasswordLogin } from '@/components/EmailPasswordLogin';
import { useAuth } from '@/contexts/AuthContext';
import { Mail } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { enterGuestMode, user, isLoading } = useAuth();

  // If already authenticated, push to home immediately
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/');
    }
  }, [isLoading, user, navigate]);

  const handleLoginSuccess = () => {
    // AuthGuard + the effect above will handle redirect once session is active
  };

  const handleSwitchToSignup = () => {
    navigate('/signup');
  };

  const handleGuestMode = () => {
    enterGuestMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-white">👟</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your Yogic Mile account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="whatsapp" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="whatsapp">WhatsApp OTP</TabsTrigger>
              <TabsTrigger value="email">Email & Password</TabsTrigger>
            </TabsList>
            
            <TabsContent value="whatsapp">
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  📱 Get OTP on your WhatsApp
                </p>
              </div>
              <MobileOTPLogin
                onSuccess={handleLoginSuccess}
                onSwitchToSignup={handleSwitchToSignup}
                className="border-0 shadow-none"
              />
            </TabsContent>
            
            <TabsContent value="email">
              <EmailPasswordLogin
                onSuccess={handleLoginSuccess}
                onSwitchToOTP={() => {}}
                onSwitchToSignup={handleSwitchToSignup}
                className="border-0 shadow-none"
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleGuestMode}
                className="text-muted-foreground hover:text-foreground"
              >
                Continue as Guest
              </Button>
            </div>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button
                variant="link"
                onClick={handleSwitchToSignup}
                className="text-primary hover:text-primary/80 p-0 h-auto font-semibold"
              >
                Sign up here
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}