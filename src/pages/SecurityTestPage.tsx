import React, { useEffect } from 'react';
import { SecurityTestingSuite } from '@/components/security/SecurityTestingSuite';

export const SecurityTestPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Security Tests | Yogic Mile';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <SecurityTestingSuite />
      </div>
    </div>
  );
};

export default SecurityTestPage;