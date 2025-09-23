import React, { useEffect } from 'react';
import { BusinessLogicTestingSuite } from '@/components/BusinessLogicTestingSuite';

export const BusinessLogicTestPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Business Logic Tests | Yogic Mile';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <BusinessLogicTestingSuite />
      </div>
    </div>
  );
};

export default BusinessLogicTestPage;