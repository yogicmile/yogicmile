import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  
  try {
    const { enterGuestMode, user, isLoading } = useAuth();

    // If authenticated, never show welcome — go home
    useEffect(() => {
      if (!isLoading && user) {
        navigate('/');
      }
    }, [isLoading, user, navigate]);

    const handleGuestMode = () => {
      try {
        console.log('Entering guest mode...');
        enterGuestMode();
        navigate('/');
      } catch (error) {
        console.error('Error in handleGuestMode:', error);
      }
    };

    console.log('WelcomePage rendering successfully');

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col items-center justify-center p-4">
        {/* Step Rewards Logo and Branding */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-premium">
            <div className="text-4xl">👟</div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Step Rewards</h1>
          <p className="text-xl text-primary font-semibold">Walk. Earn. Achieve.</p>
        </div>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-md">
          <Card className="p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">👣</div>
            <p className="text-sm font-medium">Track Steps</p>
          </Card>
          <Card className="p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">🪙</div>
            <p className="text-sm font-medium">Earn Rewards</p>
          </Card>
          <Card className="p-4 text-center hover:scale-105 transition-transform">
            <div className="text-2xl mb-2">💪</div>
            <p className="text-sm font-medium">Stay Healthy</p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-sm">
          <Button 
            onClick={() => {
              console.log('Navigating to signup');
              navigate('/signup');
            }}
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] transition-transform"
            size="lg"
          >
            Sign Up
          </Button>
          
          <Button 
            onClick={() => {
              console.log('Navigating to login');
              navigate('/login');
            }}
            variant="outline"
            className="w-full h-12 text-lg border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            size="lg"
          >
            Login
          </Button>
          
          <Button 
            onClick={handleGuestMode}
            variant="ghost"
            className="w-full h-10 text-muted-foreground hover:text-foreground"
          >
            Continue as Guest
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Join thousands of mindful walkers</p>
          <p>earning rewards for every step</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in WelcomePage:', error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Step Rewards</h1>
          <p className="text-muted-foreground mb-4">Walk. Earn. Achieve.</p>
          <Button onClick={() => navigate('/signup')}>Get Started</Button>
        </div>
      </div>
    );
  }
};

export default WelcomePage;