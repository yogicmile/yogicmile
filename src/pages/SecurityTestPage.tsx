import React, { useEffect } from 'react';
import { EnhancedSecurityDashboard } from '@/components/security/EnhancedSecurityDashboard';

export const SecurityTestPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Security Dashboard | Yogic Mile';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <EnhancedSecurityDashboard />
    </div>
  );
};

export default SecurityTestPage;