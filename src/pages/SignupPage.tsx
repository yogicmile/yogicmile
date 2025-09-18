import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileSignupForm } from "@/components/MobileSignupForm";
import { MobileOTPLogin } from "@/components/MobileOTPLogin";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, LogIn } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();
  const [activeTab, setActiveTab] = useState("signup");

  const handleSignupSuccess = (mobileNumber: string) => {
    navigate('/login');
  };

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleGuestMode = () => {
    enterGuestMode();
    navigate('/');
  };

  const handleSwitchToLogin = () => {
    setActiveTab("login");
  };

  const handleSwitchToSignup = () => {
    setActiveTab("signup");
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </TabsTrigger>
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signup" className="mt-6">
              <MobileSignupForm 
                onSuccess={handleSignupSuccess}
                className="border-0 shadow-none"
              />
            </TabsContent>

            <TabsContent value="login" className="mt-6">
              <MobileOTPLogin
                onSuccess={handleLoginSuccess}
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