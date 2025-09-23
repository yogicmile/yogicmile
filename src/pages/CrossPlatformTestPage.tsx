import React, { useEffect } from 'react';
import { CrossPlatformTestingSuite } from '@/components/CrossPlatformTestingSuite';

export const CrossPlatformTestPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Cross-Platform Tests | Yogic Mile';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <CrossPlatformTestingSuite />
      </div>
    </div>
  );
};

export default CrossPlatformTestPage;