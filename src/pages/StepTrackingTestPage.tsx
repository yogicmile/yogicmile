import React from 'react';
import { StepTrackingTestPanel } from '@/components/StepTrackingTestPanel';

const StepTrackingTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <StepTrackingTestPanel />
    </div>
  );
};

export default StepTrackingTestPage;