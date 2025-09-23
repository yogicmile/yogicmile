import React, { useEffect } from 'react';
import { IntegrationTestingSuite } from '@/components/integration/IntegrationTestingSuite';

export const IntegrationTestPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Integration Tests | Yogic Mile';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <IntegrationTestingSuite />
      </div>
    </div>
  );
};

export default IntegrationTestPage;