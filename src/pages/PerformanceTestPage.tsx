import React, { useEffect } from 'react';
import { PerformanceTestingSuite } from '@/components/performance/PerformanceTestingSuite';

export const PerformanceTestPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Performance Tests | Yogic Mile';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <PerformanceTestingSuite />
      </div>
    </div>
  );
};

export default PerformanceTestPage;