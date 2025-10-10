import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MobileSignupForm } from "@/components/MobileSignupForm";
// import { MobileOTPLogin } from "@/components/MobileOTPLogin"; // Disabled for testing
import { useAuth } from "@/contexts/AuthContext";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Disabled for testing
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();

  const handleSignupSuccess = () => {
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
          {/* OTP Login temporarily disabled - using email/password only for testing */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              📧 Email & Password signup only (OTP disabled for testing)
            </p>
          </div>
          
          <MobileSignupForm 
            onSuccess={handleSignupSuccess}
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