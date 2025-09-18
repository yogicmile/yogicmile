import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileOTPLogin } from '@/components/MobileOTPLogin';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();

  const handleLoginSuccess = () => {
    navigate('/');
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
          <MobileOTPLogin
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            className="border-0 shadow-none"
          />

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