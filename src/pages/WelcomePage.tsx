import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { enterGuestMode } = useAuth();

  const handleGuestMode = () => {
    enterGuestMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tier-1-paisa/10 via-background to-tier-2-coin/10 flex flex-col items-center justify-center p-4">
      {/* Yogic Mile Logo and Branding */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-tier-1-paisa to-tier-2-coin rounded-full flex items-center justify-center shadow-premium">
          <div className="text-4xl">🧘‍♀️</div>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Yogic Mile</h1>
        <p className="text-xl text-tier-1-paisa font-semibold">Walk. Earn. Evolve.</p>
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
          <div className="text-2xl mb-2">🧘‍♀️</div>
          <p className="text-sm font-medium">Stay Healthy</p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 w-full max-w-sm">
        <Button 
          onClick={() => navigate('/signup')}
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-tier-1-paisa to-tier-2-coin hover:scale-[1.02] transition-transform"
          size="lg"
        >
          Sign Up
        </Button>
        
        <Button 
          onClick={() => navigate('/login')}
          variant="outline"
          className="w-full h-12 text-lg border-2 border-tier-1-paisa text-tier-1-paisa hover:bg-tier-1-paisa hover:text-tier-1-paisa-foreground"
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
};

export default WelcomePage;