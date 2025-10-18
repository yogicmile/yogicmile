import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileSignupForm } from "@/components/MobileSignupForm";
import { MobileOTPLogin } from "@/components/MobileOTPLogin";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const { enterGuestMode, migrateGuestData } = useAuth();

  const handleSignupSuccess = async () => {
    // Try to migrate guest data if any exists
    await migrateGuestData();
    
    // After successful signup with email/password, user will receive verification email
    navigate('/login');
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
          <CardTitle className="text-2xl text-center">Join Yogic Mile</CardTitle>
          <CardDescription className="text-center">
            Start your walking journey and earn rewards
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email & Password</TabsTrigger>
              <TabsTrigger value="otp">WhatsApp OTP</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
              <MobileSignupForm 
                onSuccess={handleSignupSuccess}
                className="border-0 shadow-none"
              />
            </TabsContent>
            
            <TabsContent value="otp">
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  📱 Get OTP on your WhatsApp (new users supported)
                </p>
              </div>
              <MobileOTPLogin 
                onSuccess={handleSignupSuccess}
                onSwitchToSignup={() => {}}
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
              <span className="text-muted-foreground">Already have an account? </span>
              <Button
                variant="link"
                onClick={() => navigate('/login')}
                className="text-primary hover:text-primary/80 p-0 h-auto font-semibold"
              >
                Sign in here
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}