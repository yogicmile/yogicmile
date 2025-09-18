import React from 'react';
import { PhaseTestingPanel } from '@/components/PhaseTestingPanel';

const PhaseTestingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <PhaseTestingPanel />
    </div>
  );
};

export default PhaseTestingPage;