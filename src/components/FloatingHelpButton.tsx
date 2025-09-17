import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const FloatingHelpButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/help')}
      className="fixed bottom-20 right-4 w-12 h-12 rounded-full shadow-lg z-50 p-0 bg-primary hover:bg-primary/90"
      title="Help & Support"
    >
      <HelpCircle className="w-6 h-6" />
    </Button>
  );
};