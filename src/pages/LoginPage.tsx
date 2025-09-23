import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileOTPLogin } from '@/components/MobileOTPLogin';
import { EmailPasswordLogin } from '@/components/EmailPasswordLogin';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Smartphone, LogIn } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();
  const [activeTab, setActiveTab] = useState("otp");

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleSwitchToSignup = () => {
    navigate('/signup');
  };

  const handleSwitchToOTP = () => {
    setActiveTab("otp");
  };

  const handleSwitchToEmail = () => {
    setActiveTab("email");
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="otp" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile OTP
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="otp" className="mt-6">
              <MobileOTPLogin
                onSuccess={handleLoginSuccess}
                onSwitchToSignup={handleSwitchToSignup}
                className="border-0 shadow-none"
              />
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <EmailPasswordLogin
                onSuccess={handleLoginSuccess}
                onSwitchToOTP={handleSwitchToOTP}
                onSwitchToSignup={handleSwitchToSignup}
                className="border-0 shadow-none"
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={handleGuestMode}
              className="text-muted-foreground hover:text-foreground"
            >
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}