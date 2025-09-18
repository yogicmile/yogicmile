import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ReferralCard } from '@/components/ReferralCard';

export function ReferralPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/profile')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">Refer Friends</h1>
            <p className="text-muted-foreground">Earn bonus coins for every referral</p>
          </div>
        </div>

        {/* Referral Card */}
        <ReferralCard />
      </div>
    </div>
  );
}